import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import { faqData } from "@/lib/faq";
import { authOptions } from "@/lib/auth";
import { formatBrandContext } from "@/lib/brand";
import { getProducts } from "@/lib/catalog";
import { getOrdersByEmail } from "@/lib/orders";
import type { ChatMessage } from "@/types";

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

function formatTranscript(messages: ChatMessage[]) {
  return messages
    .slice(-12)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");
}

export async function POST(request: Request) {
  const parsed = chatSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid chat payload." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        message:
          "The AI assistant is ready, but OPENAI_API_KEY is not configured. Add the key to enable live recommendations and support answers."
      },
      { status: 503 }
    );
  }

  const session = await getServerSession(authOptions);
  const [products, orders] = await Promise.all([
    getProducts({ limit: 24 }),
    getOrdersByEmail(session?.user?.email)
  ]);

  const productContext = products
    .map(
      (product) =>
        `${product.id} | ${product.name} | ${product.category} | ${product.price}/${product.mrp} | rating ${product.rating} | tags ${[
          ...product.tags,
          ...product.goalTags
        ].join(", ")} | use: ${product.howToUse}`
    )
    .join("\n");

  const faqContext = faqData
    .map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`)
    .join("\n\n");

  const orderContext =
    orders.length > 0
      ? orders
          .map(
            (order) =>
              `${order.orderNumber} | status ${order.status} | total ${order.total} | eta ${order.estimatedDelivery} | items ${order.items
                .map((item) => `${item.name} x${item.quantity}`)
                .join(", ")}`
          )
          .join("\n")
      : "No authenticated order records are available for this visitor.";

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      instructions:
        "You are Fast&Up Coach, an ecommerce AI assistant for Fast&Up-style sports nutrition. Prioritize product recommendation and customer support. Recommend only products present in the product context, ask at most one short follow-up question when goal, activity level or preferences are missing, and give practical reasoning. For support, use order, FAQ and official brand contact context; never invent delivery, refund, medical, account or social-channel facts. If order data is missing, ask the shopper to sign in or share an order number and email. Keep replies concise, trustworthy and action-oriented.",
      input: `BRAND SUPPORT DATA:\n${formatBrandContext()}\n\nPRODUCT DATABASE:\n${productContext}\n\nFAQ DATA:\n${faqContext}\n\nORDER DATA:\n${orderContext}\n\nCHAT HISTORY:\n${formatTranscript(parsed.data.messages)}\n\nRespond to the latest user message using the available context.`
    });

    return NextResponse.json({
      message: response.output_text,
      usedContext: {
        products: products.map((product) => product.id),
        orders: orders.map((order) => order.orderNumber)
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI response failed.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
