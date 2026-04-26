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

// ─── Constants ────────────────────────────────────────────────────────────────
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3";
const GROQ_MODEL   = "llama3-8b-8192";

// ─── AI client factory ────────────────────────────────────────────────────────
// LOCAL  → NEXT_PUBLIC_USE_OLLAMA=true  in .env.local  → uses Ollama
// PROD   → NEXT_PUBLIC_USE_OLLAMA=false in Vercel env  → uses Groq
function getAiClient(): { client: OpenAI; model: string } {
  const useOllama = process.env.NEXT_PUBLIC_USE_OLLAMA === "true";

  if (useOllama) {
    return {
      client: new OpenAI({
        baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
        apiKey: "ollama" // Ollama doesn't need a real key
      }),
      model: OLLAMA_MODEL
    };
  }

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    throw new Error("GROQ_API_KEY is not set. Add it to Vercel environment variables.");
  }

  return {
    client: new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: key
    }),
    model: GROQ_MODEL
  };
}

// ─── Validation schema ────────────────────────────────────────────────────────
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

// ─── System prompt ────────────────────────────────────────────────────────────
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatTranscript(messages: ChatMessage[]) {
  return messages
    .slice(-8)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");
}

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
  const pool = matched.length > 0 ? matched : products;
  return pool.slice(0, 5);
}

function filterRelevantFaqs(userMessage: string) {
  const query = userMessage.toLowerCase();
  const matched = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().split(" ").some((word) => query.includes(word))
  );
  return (matched.length > 0 ? matched : faqData).slice(0, 3);
}

// ─── Route handler ────────────────────────────────────────────────────────────
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

  // ─── Fetch data in parallel ───────────────────────────────────────────────
  const [allProducts, orders] = await Promise.all([
    getProducts({ limit: 5 }),
    getOrdersByEmail(session?.user?.email)
  ]);

  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";

  // ─── Build lean, relevant contexts ───────────────────────────────────────
  const relevantProducts = filterRelevantProducts(allProducts, latestMessage);

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

  // ─── AI completion ────────────────────────────────────────────────────────
  let aiClient: OpenAI;
  let aiModel: string;

  try {
    const { client, model } = getAiClient();
    aiClient = client;
    aiModel  = model;
  } catch (error) {
    // GROQ_API_KEY missing — fail fast with a clear message
    console.error("AI client setup failed:", error);
    return NextResponse.json(
      {
        message:
          process.env.NODE_ENV === "development"
            ? "AI setup error: " + (error instanceof Error ? error.message : String(error))
            : "AI assistant is not configured. Please contact support."
      },
      { status: 503, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const response = await aiClient.chat.completions.create({
      model: aiModel,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens:  250
    });

    const message =
      response.choices[0]?.message?.content ??
      "Sorry, I could not generate a response.";

    return NextResponse.json(
      {
        message,
        usedContext: {
          products: relevantProducts.map((p) => p.id),
          orders:   orders.map((o) => o.orderNumber)
        }
      },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error("AI chat completion failed:", error);

    const errMsg = error instanceof Error ? error.message : String(error);

    const isConnectionError =
      errMsg.includes("ECONNREFUSED") || errMsg.includes("fetch failed") || errMsg.includes("ENOTFOUND");
    const isAuthError =
      errMsg.includes("401") || errMsg.includes("invalid_api_key");
    const isTimeout =
      errMsg.includes("timed out") || errMsg.includes("ETIMEDOUT");

    const userMessage = isConnectionError
      ? "AI assistant is offline. Make sure Ollama is running: `ollama serve`"
      : isAuthError
      ? "AI key is invalid. Check GROQ_API_KEY in your Vercel environment variables."
      : isTimeout
      ? "AI took too long to respond. Please try again."
      : "I couldn't complete that response right now. Please try again.";

    return NextResponse.json(
      { message: userMessage },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
