import { NextResponse } from "next/server";
import { z } from "zod";

import {
  RULE_BASE_SIZE,
  getRuleBasedReply,
} from "@/lib/ruleBasedAgent";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200),
      })
    )
    .min(1)
    .max(20),
});

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null);
  const parsed = chatSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid chat payload." }, { status: 400 });
  }

  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `chat-rule-based:${ip}`,
    limit: 40,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages sent. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";
  const result = getRuleBasedReply(latestMessage, parsed.data.messages);

  return NextResponse.json(
    {
      message: result.message,
      quickReplies: result.quickReplies,
      mode: "rule_based_fastup_assistant",
      usedContext: {
        kbSize: RULE_BASE_SIZE,
        matchedIntentId: result.matchedIntentId ?? null,
        matchMode: result.mode,
      },
    },
    { status: 200, headers: rateLimitHeaders(rateLimit) }
  );
}
