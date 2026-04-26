import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { faqData } from "@/lib/faq";
import { authOptions } from "@/lib/auth";
import { formatBrandContext } from "@/lib/brand";
import { getProducts } from "@/lib/catalog";
import { getOrdersByEmail } from "@/lib/orders";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";
import type { ChatMessage } from "@/types";

const ollamaClient = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey: "ollama"
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(2000)
      })
    )
    .min(1)
    .max(20)
});

// ─── 1. Stricter, structured SYSTEM PROMPT ───────────────────────────────────
const SYSTEM_PROMPT = `
You are Fast&Up Coach, an ecommerce AI assistant for Fast&Up sports nutrition.

GOALS:
- Recommend relevant products from the provided product data
- Help with orders, shipping, refunds, and general support

RULES:
- ONLY use data provided in the prompt — never invent product names, prices, delivery dates, or policies
- If no relevant product exists → say "I couldn't find a matching product. Could you tell me more about your goal?"
- Ask at most ONE short follow-up question when goal, activity level, or preference is unclear
- If no relevant data is found → respond: "I couldn't find relevant info. Can you clarify what you need?"

PRIORITY ORDER:
1. Product recommendation
2. Order support
3. FAQ / general support

OUTPUT FORMAT:
- Product recommendations → bullet points (name, benefit, price)
- Support answers → direct 1–3 line response
- Keep all replies concise (3–6 lines max)

STYLE:
- Clear, practical, trustworthy
- No generic AI filler phrases
- No long explanations unless explicitly asked
`.trim();

function formatTranscript(messages: ChatMessage[]) {
  return messages
    .slice(-8) // reduced from 12 — older turns rarely matter
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

// ─── 2. Relevance filtering — only send products the query actually needs ─────
function filterRelevantProducts(
  products: Awaited<ReturnType<typeof getProducts>>,
  userMessage: string
) {
  const query = userMessage.toLowerCase();

  const matched = products.filter(
    (p) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.tags.some((tag) => query.includes(tag.toLowerCase())) ||
      p.goalTags.some((tag) => query.includes(tag.toLowerCase()))
  );

  // fall back to featured/top-rated products if nothing keyword-matches
  const pool = matched.length > 0 ? matched : products;
  return pool.slice(0, 5);
}

// ─── 3. Relevance filtering for FAQ ──────────────────────────────────────────
function filterRelevantFaqs(userMessage: string) {
  const query = userMessage.toLowerCase();

  const matched = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().split(" ").some((word) => query.includes(word))
  );

  return (matched.length > 0 ? matched : faqData).slice(0, 3);
}

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid chat payload." }, { status: 400 });
  }

  const session = await getServerSession(authOptions);
  const identity = session?.user?.email?.toLowerCase().trim() ?? "guest";
  const ip = getClientIp(request);

  const rateLimit = checkRateLimit({
    key: `chat:${ip}:${identity}`,
    limit: 20,
    windowMs: 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages sent. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  // ─── Fetch data in parallel (unchanged) ────────────────────────────────────
  const [allProducts, orders] = await Promise.all([
    getProducts({ limit: 5 }),
    getOrdersByEmail(session?.user?.email)
  ]);

  // ─── Extract the latest user message for relevance filtering ───────────────
  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";

  // ─── 4. Build lean, relevant contexts ──────────────────────────────────────
  const relevantProducts = filterRelevantProducts(allProducts, latestMessage);

  // Stripped-down product format — model doesn't need IDs or MRP
  const productContext =
    relevantProducts.length > 0
      ? relevantProducts
          .map(
            (p) =>
              `• ${p.name} | ${p.category} | ₹${p.price} | tags: ${[...p.tags, ...p.goalTags].join(", ")} | use: ${p.howToUse}`
          )
          .join("\n")
      : "No relevant products found.";

  const relevantFaqs = filterRelevantFaqs(latestMessage);
  const faqContext = relevantFaqs
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  const orderContext =
    orders.length > 0
      ? orders
          .map(
            (o) =>
              `• ${o.orderNumber} | ${o.status} | ₹${o.total} | ETA: ${o.estimatedDelivery} | ${o.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}`
          )
          .join("\n")
      : "No authenticated order records available.";

  // ─── 5. Structured USER PROMPT ─────────────────────────────────────────────
  const userPrompt = `
USER QUERY:
${latestMessage}

---

PRODUCTS (relevant only):
${productContext}

---

FAQ:
${faqContext}

---

ORDERS:
${orderContext}

---

BRAND INFO:
${formatBrandContext()}

---

CHAT HISTORY:
${formatTranscript(parsed.data.messages)}

---

INSTRUCTION:
Answer the USER QUERY using only the data above. Follow the output format in your system instructions.
`.trim();

  try {
    const response = await ollamaClient.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      // ─── 6. Lower temperature + tighter token cap ───────────────────────
      temperature: 0.4, // was 0.7 — reduces rambling and hallucination
      max_tokens: 250   // was 1024 — keeps responses sharp and fast
    });

    const message =
      response.choices[0]?.message?.content ??
      "Sorry, I could not generate a response.";

    return NextResponse.json(
      {
        message,
        usedContext: {
          products: relevantProducts.map((p) => p.id),
          orders: orders.map((o) => o.orderNumber)
        }
      },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error("Ollama chat failed:", error);

    // ─── 7. Helpful connection error ────────────────────────────────────────
    const isConnectionError =
      error instanceof Error &&
      (error.message.includes("ECONNREFUSED") || error.message.includes("fetch failed"));

    return NextResponse.json(
      {
        message: isConnectionError
          ? "AI assistant is offline. Make sure Ollama is running: `ollama serve`"
          : "I couldn't complete that response right now. Please try again."
      },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
