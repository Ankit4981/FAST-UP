import type { Metadata } from "next";

import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review cart items with persistent quantities and real-time order totals."
};

export default function CartPage() {
  return <CartView />;
}
