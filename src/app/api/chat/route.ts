import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { getProducts } from "@/lib/catalog";
import { getOrdersByEmail } from "@/lib/orders";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";
import { detectGoalFromText, generateSmartAssistantReply } from "@/lib/wellnessEngine";

const chatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200)
      })
    )
    .min(1)
    .max(20)
});

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
    limit: 40,
    windowMs: 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many messages sent. Please wait a moment and try again." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  const latestMessage = parsed.data.messages.at(-1)?.content ?? "";
  const fallbackGoal =
    [...parsed.data.messages]
      .reverse()
      .map((message) => detectGoalFromText(message.content))
      .find(Boolean) ?? undefined;

  const [products, orders] = await Promise.all([
    getProducts({ limit: 120, sort: "rating-desc" }),
    getOrdersByEmail(session?.user?.email)
  ]);

  const message = generateSmartAssistantReply({
    message: latestMessage,
    products,
    orders,
    fallbackGoal
  });

  return NextResponse.json(
    {
      message,
      mode: "smart_free_assistant",
      usedContext: {
        products: products.length,
        orders: orders.length
      }
    },
    { status: 200, headers: rateLimitHeaders(rateLimit) }
  );
}
