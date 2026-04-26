"use client";

import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { getCartTotals, useCartStore } from "@/store/cartStore";
import type { Address, Order } from "@/types";
import { formatPrice } from "@/lib/utils";

const emptyAddress: Address = {
  fullName: "",
  phone: "",
  email: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: ""
};

export function CheckoutView() {
  const { data: session } = useSession();
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const totals = useMemo(() => getCartTotals(items), [items]);
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [paymentMode, setPaymentMode] = useState<"cod" | "upi">("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (session?.user) {
      setAddress((current) => ({
        ...current,
        fullName: current.fullName || session.user?.name || "",
        email: current.email || session.user?.email || ""
      }));
    }
  }, [session]);

  function updateField(field: keyof Address, value: string) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address,
        paymentMode,
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity
        }))
      })
    });

    const payload = await response.json();
    setIsSubmitting(false);

    if (!response.ok) {
      setError(payload.message ?? "Unable to place order.");
      return;
    }

    setPlacedOrder(payload.order);
    clearCart();
  }

  if (placedOrder) {
    return (
      <section className="bg-brand-grey py-12">
        <div className="container-page">
          <div className="mx-auto max-w-2xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <p className="compact-label">Order placed</p>
            <h1 className="mt-2 font-display text-5xl font-black uppercase text-brand-black">
              {placedOrder.orderNumber}
            </h1>
            <p className="mt-3 text-neutral-600">
              Your order is confirmed and has been added to the order system.
            </p>
            <div className="mt-6 rounded-md bg-brand-grey p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total</span>
                <span className="font-bold">{formatPrice(placedOrder.total)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-neutral-500">Estimated delivery</span>
                <span className="font-bold">
                  {new Date(placedOrder.estimatedDelivery).toLocaleDateString("en-IN")}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="btn-primary">
                View dashboard
              </Link>
              <Link href="/products" className="btn-secondary">
                Shop more
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="bg-brand-grey py-12">
        <div className="container-page">
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h1 className="font-display text-4xl font-black uppercase text-brand-black">
              Nothing to checkout
            </h1>
            <Link href="/products" className="btn-primary mt-6">
              Shop products
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-grey py-8 sm:py-12">
      <div className="container-page">
        <div className="mb-6">
          <p className="compact-label">Secure checkout</p>
          <h1 className="font-display text-5xl font-black uppercase leading-none text-brand-black">
            Checkout
          </h1>
        </div>

        <form onSubmit={submitOrder} className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-black uppercase text-brand-black">
              Delivery Address
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="checkout-fullname" className="compact-label mb-2 block">
                  Full name
                </label>
                <input
                  id="checkout-fullname"
                  className="field"
                  required
                  autoComplete="name"
                  placeholder="Full name"
                  value={address.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="checkout-phone" className="compact-label mb-2 block">
                  Phone
                </label>
                <input
                  id="checkout-phone"
                  className="field"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="Phone number"
                  value={address.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-email" className="compact-label mb-2 block">
                  Email
                </label>
                <input
                  id="checkout-email"
                  className="field"
                  required
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={address.email}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-line1" className="compact-label mb-2 block">
                  Address line 1
                </label>
                <input
                  id="checkout-line1"
                  className="field"
                  required
                  autoComplete="address-line1"
                  placeholder="Flat / house / street"
                  value={address.line1}
                  onChange={(event) => updateField("line1", event.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="checkout-line2" className="compact-label mb-2 block">
                  Address line 2 (optional)
                </label>
                <input
                  id="checkout-line2"
                  className="field"
                  autoComplete="address-line2"
                  placeholder="Area / landmark"
                  value={address.line2 ?? ""}
                  onChange={(event) => updateField("line2", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="checkout-city" className="compact-label mb-2 block">
                  City
                </label>
                <input
                  id="checkout-city"
                  className="field"
                  required
                  autoComplete="address-level2"
                  placeholder="City"
                  value={address.city}
                  onChange={(event) => updateField("city", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="checkout-state" className="compact-label mb-2 block">
                  State
                </label>
                <input
                  id="checkout-state"
                  className="field"
                  required
                  autoComplete="address-level1"
                  placeholder="State"
                  value={address.state}
                  onChange={(event) => updateField("state", event.target.value)}
                />
              </div>
              <div>
                <label htmlFor="checkout-pincode" className="compact-label mb-2 block">
                  Pincode
                </label>
                <input
                  id="checkout-pincode"
                  className="field"
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="Pincode"
                  value={address.pincode}
                  onChange={(event) => updateField("pincode", event.target.value)}
                />
              </div>
            </div>

            <div className="mt-8">
              <h2 className="font-display text-3xl font-black uppercase text-brand-black">
                Payment
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMode === "cod"}
                    onChange={() => setPaymentMode("cod")}
                  />
                  <span>
                    <span className="block font-bold">Cash on delivery</span>
                    <span className="text-xs text-neutral-500">Demo-safe checkout mode</span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-neutral-200 p-4">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMode === "upi"}
                    onChange={() => setPaymentMode("upi")}
                  />
                  <span>
                    <span className="block font-bold">UPI placeholder</span>
                    <span className="text-xs text-neutral-500">Ready for payment gateway integration</span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-3xl font-black uppercase text-brand-black">Summary</h2>
            <div className="mt-5 grid gap-3">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span className="text-neutral-600">
                    {item.name} x{item.quantity}
                  </span>
                  <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-neutral-200 pt-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="font-bold">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
                </div>
                <div className="mt-3 flex justify-between font-display text-3xl font-black">
                  <span>Total</span>
                  <span>{formatPrice(totals.total)}</span>
                </div>
              </div>
            </div>
            {error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}
            <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
              Place order
            </button>
          </aside>
        </form>
      </div>
    </section>
  );
}
