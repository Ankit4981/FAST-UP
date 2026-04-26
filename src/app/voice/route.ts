import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";

// ─── Constants ─────────────────────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 9_000; // 9 s hard cap
const OLLAMA_MODEL       = process.env.OLLAMA_MODEL       ?? "llama3:8b";
const OLLAMA_BASE_URL    = process.env.OLLAMA_BASE_URL    ?? "http://localhost:11434/v1";

const GROQ_MODEL = "llama-3.1-8b-instant";

// ─── Clients (lazy — created only when needed) ─────────────────────────────────
function getOllamaClient() {
  return new OpenAI({
    baseURL: OLLAMA_BASE_URL,
    apiKey:  "ollama", // Ollama doesn't need a real key
  });
}

function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured");
  return new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey:  key,
  });
}

// ─── Validation schema ─────────────────────────────────────────────────────────
const voiceSchema = z.object({
  messages: z
    .array(
      z.object({
        role:    z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      })
    )
    .min(1)
    .max(20),  // frontend MAX_HISTORY=12; keep headroom
  lang: z.enum(["en", "hi"]).optional().default("en"),
});

// ─── System prompt ─────────────────────────────────────────────────────────────
// System prompt is language-aware — built per request
function buildSystemPrompt(lang: "en" | "hi"): string {
  const base = lang === "hi"
    ? `Aap Coach Priya hain, Fast and Up ki friendly nutrition coach ek LIVE VOICE CALL par.
SAKHT NIYAM — ek bhi mat todo:
1. BILKUL EK sentence mein jawab do. Isse zyada nahi. Koi exception nahi.
2. Maximum 20 words. Gino.
3. Bullet points, lists, markdown, asterisks ya numbers kabhi mat use karo.
4. Warm, natural insaan ki tarah bolo — robot ki tarah nahi.
5. Sirf Fast and Up products ka zikr karo: protein, hydration, pre-workout, recovery.
6. Agar pata nahi, ek chhoti sentence mein bolo aur kuch aur help offer karo.
Real-time voice call hai. Ek sentence, 20 se kam words, har baar.`
    : `You are Coach Priya, a friendly Fast and Up nutrition coach on a LIVE VOICE CALL.
STRICT RULES — break none of them:
1. Reply in EXACTLY 1 sentence. Never more. No exceptions.
2. Maximum 20 words. Count them.
3. Never use bullet points, lists, markdown, asterisks, or numbers.
4. Sound like a warm, natural human — not a robot.
5. Only mention Fast and Up products: protein, hydration, pre-workout, recovery.
6. If unsure, say so in one short sentence and offer to help differently.
This is real-time voice. One sentence, under 20 words, every single time.`;
  return base.trim();
}

// ─── Fallbacks ─────────────────────────────────────────────────────────────────
const FALLBACKS = [
  "Sorry, could you say that again?",
  "I missed that — can you repeat it?",
  "Something went wrong on my end, please try again!",
];
const randomFallback = () => FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];

// ─── Shared completion options ─────────────────────────────────────────────────
const completionOptions = (
  messages: { role: "user" | "assistant"; content: string }[],
  lang: "en" | "hi" = "en"
) => ({
  messages: [
    { role: "system" as const, content: buildSystemPrompt(lang) },
    ...messages.slice(-6), // last 6 turns only
  ],
  temperature: 0.4,   // lower = faster + more consistent
  max_tokens:  40,    // 1 sentence never needs more than 40 tokens
});

// ─── Timeout wrapper ───────────────────────────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // ── Rate limit ──
  const ip        = getClientIp(request);
  const rateLimit = checkRateLimit({
    key:      `voice-chat:${ip}`,
    limit:    30,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages — please wait a moment." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  // ── Parse & validate body ──
  const rawBody = await request.json().catch(() => null);
  const parsed  = voiceSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 }
    );
  }

  // ── Feature flag — must match .env.local key exactly ──
  const useOllama = process.env.NEXT_PUBLIC_USE_OLLAMA === "true";
  const lang      = parsed.data.lang ?? "en";

  // ── LOCAL: Ollama ──
  if (useOllama) {
    try {
      const response = await withTimeout(
        getOllamaClient().chat.completions.create({
          model: OLLAMA_MODEL,
          ...completionOptions(parsed.data.messages, lang),
        }),
        REQUEST_TIMEOUT_MS
      );

      const message = response.choices[0]?.message?.content?.trim() ?? randomFallback();
      return NextResponse.json(
        { message },
        { status: 200, headers: rateLimitHeaders(rateLimit) }
      );
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error("[voice/route] Ollama error:", errMsg);

      const isOffline =
        error instanceof Error &&
        (errMsg.includes("ECONNREFUSED") ||
          errMsg.includes("fetch failed") ||
          errMsg.includes("ENOTFOUND"));

      const isTimeout = errMsg.includes("timed out");

      return NextResponse.json(
        {
          message: isOffline
            ? "My assistant is offline — make sure Ollama is running!"
            : isTimeout
            ? "That took too long — please try again!"
            : randomFallback(),
        },
        { status: 503, headers: rateLimitHeaders(rateLimit) }
      );
    }
  }

  // ── PRODUCTION: Groq ──
  let groqClient: OpenAI;
  try {
    groqClient = getGroqClient();
  } catch {
    console.error("[voice/route] GROQ_API_KEY is not set");
    return NextResponse.json(
      { message: randomFallback() },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const response = await withTimeout(
      groqClient.chat.completions.create({
        model: GROQ_MODEL,
        ...completionOptions(parsed.data.messages, lang),
      }),
      REQUEST_TIMEOUT_MS
    );

    const message = response.choices[0]?.message?.content?.trim() ?? randomFallback();
    return NextResponse.json(
      { message },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[voice/route] Groq error:", errMsg);

    const isTimeout = errMsg.includes("timed out");
    const isAuth    = errMsg.includes("401") || errMsg.includes("invalid_api_key");
    return NextResponse.json(
      {
        message: isAuth
          ? "AI key issue — check GROQ_API_KEY in your env file!"
          : isTimeout
          ? "That took too long — please try again!"
          : randomFallback(),
      },
      { status: 503, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
