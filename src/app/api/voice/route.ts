import { NextResponse } from "next/server";
import { z } from "zod";

import { getProducts } from "@/lib/catalog";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";
import { detectGoalFromText, generateSmartAssistantReply, toVoiceSentence } from "@/lib/wellnessEngine";

const voiceSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500)
      })
    )
    .min(1)
    .max(12),
  lang: z.enum(["en", "hi"]).optional()
});

export async function POST(request: Request) {
  const ip = getClientIp(request);

  const rateLimit = checkRateLimit({
    key: `voice-chat:${ip}`,
    limit: 40,
    windowMs: 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Please slow down for a moment before asking again." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = voiceSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "I can help once you repeat your question clearly." },
      { status: 400, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";
  const fallbackGoal =
    [...parsed.data.messages]
      .reverse()
      .map((message) => detectGoalFromText(message.content))
      .find(Boolean) ?? undefined;

  const products = await getProducts({ limit: 120, sort: "rating-desc" });

  const response = generateSmartAssistantReply({
    message: latestMessage,
    products,
    fallbackGoal
  });

  return NextResponse.json(
    { message: toVoiceSentence(response) },
    { status: 200, headers: rateLimitHeaders(rateLimit) }
  );
}
