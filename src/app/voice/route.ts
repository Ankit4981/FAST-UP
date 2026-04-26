import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";

// ─── Clients ──────────────────────────────────────────────────────────────────

const ollamaClient = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL ?? "http://localhost:11434/v1",
  apiKey:  "ollama",
});

// Groq is OpenAI-compatible — same SDK, different base + key
const groqClient = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey:  process.env.GROQ_API_KEY ?? "missing",
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "llama3:8b";
const GROQ_MODEL   = "llama3-8b-8192";

// ─── Validation schema ────────────────────────────────────────────────────────
const voiceSchema = z.object({
  messages: z
    .array(
      z.object({
        role:    z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      })
    )
    .min(1)
    .max(10),
});

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `
You are a friendly Fast and Up nutrition coach on a LIVE VOICE CALL.
STRICT RULES — follow every one:
1. Reply in EXACTLY 1 sentence. Never more. No exceptions.
2. Never use bullet points, lists, markdown, asterisks, or numbers.
3. Sound like a warm, natural human — not a robot reading a script.
4. Only mention Fast and Up products: protein, hydration, pre-workout, recovery.
5. If you do not know something, say so in one sentence and offer to help differently.
Remember: This is a real-time voice call. One sentence. Every time.
`.trim();

// ─── Fallback responses ───────────────────────────────────────────────────────
const FALLBACKS = [
  "Sorry, I didn't catch that — could you say that again?",
  "I'm having a small hiccup. Can you repeat that for me?",
  "My apologies — something went wrong on my end. Please try once more!",
];

const randomFallback = () =>
  FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)];

// ─── Shared completion options ────────────────────────────────────────────────
const completionOptions = (
  messages: { role: "user" | "assistant"; content: string }[]
) => ({
  messages: [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages.slice(-6),          // last 6 turns max
  ],
  temperature: 0.7,
  max_tokens:  60,
});

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  // Rate limit
  const ip        = getClientIp(request);
  const rateLimit = checkRateLimit({
    key:      `voice-chat:${ip}`,
    limit:    30,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages — please wait a moment." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  // Validate body
  const rawBody = await request.json().catch(() => null);
  const parsed  = voiceSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { message: randomFallback() },
      { status: 400 }
    );
  }

  const useOllama = process.env.NEXT_PUBLIC_USE_OLLAMA === "true";

  // LOCAL: Ollama
  if (useOllama) {
    try {
      const response = await ollamaClient.chat.completions.create({
        model: OLLAMA_MODEL,
        ...completionOptions(parsed.data.messages),
      });

      const message =
        response.choices[0]?.message?.content?.trim() ?? randomFallback();

      return NextResponse.json(
        { message },
        { status: 200, headers: rateLimitHeaders(rateLimit) }
      );
    } catch (error) {
      console.error("[voice/route] Ollama error:", error);

      const isOffline =
        error instanceof Error &&
        (error.message.includes("ECONNREFUSED") ||
          error.message.includes("fetch failed") ||
          error.message.includes("ENOTFOUND"));

      return NextResponse.json(
        {
          message: isOffline
            ? "My AI assistant is offline right now — make sure Ollama is running!"
            : randomFallback(),
        },
        { status: 200, headers: rateLimitHeaders(rateLimit) }
      );
    }
  }

  // PRODUCTION: Groq
  if (!process.env.GROQ_API_KEY) {
    console.error("[voice/route] GROQ_API_KEY is not set");
    return NextResponse.json(
      { message: randomFallback() },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const response = await groqClient.chat.completions.create({
      model: GROQ_MODEL,
      ...completionOptions(parsed.data.messages),
    });

    const message =
      response.choices[0]?.message?.content?.trim() ?? randomFallback();

    return NextResponse.json(
      { message },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error("[voice/route] Groq error:", error);
    return NextResponse.json(
      { message: randomFallback() },
      { status: 200, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
