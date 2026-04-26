import type { Metadata } from "next";

import { CheckoutView } from "@/components/cart/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter delivery address and place an order through the ecommerce API."
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
