import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { createOrder, getOrdersByEmail } from "@/lib/orders";

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  line1: z.string().min(4),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().min(4)
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
  const orders = await getOrdersByEmail(session?.user?.email);

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = createOrderSchema.parse(await request.json());
    const order = await createOrder({
      ...body,
      userEmail: session?.user?.email ?? body.address.email
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to place this order.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
