import { NextResponse } from "next/server";
import { z } from "zod";

import { getRuleBasedReply } from "@/lib/ruleBasedAgent";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";

const voiceSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `voice-rule-based:${ip}`,
    limit: 40,
    windowMs: 60 * 1000,
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
      { message: "Please repeat your question clearly." },
      { status: 400, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";
  const result = getRuleBasedReply(latestMessage, parsed.data.messages);

  return NextResponse.json(
    {
      message: result.message,
      quickReplies: result.quickReplies,
      mode: "rule_based_fastup_voice",
      matchMode: result.mode,
    },
    { status: 200, headers: rateLimitHeaders(rateLimit) }
  );
}
