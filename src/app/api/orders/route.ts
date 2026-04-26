import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z, ZodError } from "zod";

import { authOptions } from "@/lib/auth";
import { createOrder, getOrdersByEmail } from "@/lib/orders";
import { checkRateLimit, getClientIp, rateLimitHeaders } from "@/lib/rateLimit";

const addressSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{8,15}$/),
  email: z.string().trim().email(),
  line1: z.string().trim().min(4),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z
    .string()
    .trim()
    .regex(/^[0-9]{4,10}$/)
});

const createOrderSchema = z.object({
  address: addressSchema,
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
    .min(1),
  paymentMode: z.enum(["cod", "upi"]).default("cod")
});

export async function GET() {
  const session = await getServerSession(authOptions);
  const userEmail = session?.user?.email?.toLowerCase().trim();

  if (!userEmail) {
    return NextResponse.json({ message: "Authentication required." }, { status: 401 });
  }

  const orders = await getOrdersByEmail(userEmail);
  return NextResponse.json({ orders }, { status: 200 });
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `orders:${ip}`,
    limit: 8,
    windowMs: 10 * 60 * 1000
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many order attempts. Please try again shortly." },
      { status: 429, headers: rateLimitHeaders(rateLimit) }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    const rawBody = await request.json().catch(() => null);
    const body = createOrderSchema.parse(rawBody);
    const authenticatedEmail = session?.user?.email?.toLowerCase().trim();

    const address = {
      ...body.address,
      email: authenticatedEmail ?? body.address.email.toLowerCase().trim()
    };

    const order = await createOrder({
      ...body,
      address,
      userEmail: authenticatedEmail ?? `guest-${crypto.randomUUID()}@guest.fastup.local`
    });

    return NextResponse.json(
      { order },
      { status: 201, headers: rateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid checkout details. Please review your fields." },
        { status: 400, headers: rateLimitHeaders(rateLimit) }
      );
    }

    console.error("Order creation failed", error);
    return NextResponse.json(
      { message: "Unable to place order right now. Please try again." },
      { status: 500, headers: rateLimitHeaders(rateLimit) }
    );
  }
}
