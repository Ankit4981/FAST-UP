import { demoOrders } from "@/data/seed";
import { getProductById } from "@/lib/catalog";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db";
import { OrderModel } from "@/models/Order";
import type { Address, Order, OrderLine } from "@/types";

type CreateOrderInput = {
  address: Address;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  userEmail?: string | null;
  paymentMode: "cod" | "upi";
};

let memoryOrders: Order[] = [...demoOrders];

function serializeOrder(raw: Partial<Order> & Record<string, unknown>): Order {
  return {
    id: String(raw.id),
    orderNumber: String(raw.orderNumber),
    userEmail: String(raw.userEmail),
    address: raw.address as Address,
    items: (raw.items ?? []) as OrderLine[],
    subtotal: Number(raw.subtotal),
    shipping: Number(raw.shipping),
    total: Number(raw.total),
    status: raw.status as Order["status"],
    paymentMode: raw.paymentMode as Order["paymentMode"],
    createdAt: raw.createdAt ? new Date(raw.createdAt as string).toISOString() : new Date().toISOString(),
    estimatedDelivery: String(raw.estimatedDelivery)
  };
}

function createOrderNumber() {
  return `FU-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

export async function createOrder(input: CreateOrderInput) {
  const lines: OrderLine[] = [];

  for (const item of input.items) {
    const product = await getProductById(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} was not found.`);
    }

    lines.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      price: product.price,
      quantity: Math.max(1, item.quantity)
    });
  }

  const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 599 ? 0 : 49;
  const now = new Date();
  const estimatedDelivery = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 4).toISOString();

  const order: Order = {
    id: `order_${Date.now().toString(36)}`,
    orderNumber: createOrderNumber(),
    userEmail: (input.userEmail || input.address.email).toLowerCase(),
    address: input.address,
    items: lines,
    subtotal,
    shipping,
    total: subtotal + shipping,
    status: "placed",
    paymentMode: input.paymentMode,
    createdAt: now.toISOString(),
    estimatedDelivery
  };

  if (!isDatabaseConfigured()) {
    memoryOrders = [order, ...memoryOrders];
    return order;
  }

  await connectToDatabase();
  const createdOrder = await OrderModel.create(order);
  return serializeOrder(createdOrder.toObject() as Partial<Order> & Record<string, unknown>);
}

export async function getOrdersByEmail(email?: string | null) {
  if (!email) {
    return [];
  }

  const normalizedEmail = email.toLowerCase();

  if (!isDatabaseConfigured()) {
    return memoryOrders.filter((order) => order.userEmail === normalizedEmail);
  }

  await connectToDatabase();
  const orders = await OrderModel.find({ userEmail: normalizedEmail }).sort({ createdAt: -1 }).lean();
  return orders.map((order) => serializeOrder(order as Partial<Order> & Record<string, unknown>));
}

export async function getOrderByNumber(orderNumber: string, email?: string | null) {
  if (!isDatabaseConfigured()) {
    return (
      memoryOrders.find(
        (order) =>
          order.orderNumber.toLowerCase() === orderNumber.toLowerCase() &&
          (!email || order.userEmail === email.toLowerCase())
      ) ?? null
    );
  }

  await connectToDatabase();
  const filter: Record<string, unknown> = { orderNumber };
  if (email) {
    filter.userEmail = email.toLowerCase();
  }

  const order = await OrderModel.findOne(filter).lean();
  return order ? serializeOrder(order as Partial<Order> & Record<string, unknown>) : null;
}
