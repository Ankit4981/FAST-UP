"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { getCartTotals, useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export function CartView() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const totals = getCartTotals(items);

  return (
    <section className="bg-brand-grey py-8 sm:py-12">
      <div className="container-page">
        <div className="mb-6">
          <p className="compact-label">Persistent localStorage cart</p>
          <h1 className="font-display text-5xl font-black uppercase leading-none text-brand-black">
            Your <span className="text-brand-orange">Cart</span>
          </h1>
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
            <h2 className="font-display text-4xl font-black uppercase text-brand-black">
              Cart is empty
            </h2>
            <p className="mt-2 text-neutral-500">Build your hydration or recovery stack from the catalogue.</p>
            <Link href="/products" className="btn-primary mt-6">
              Shop products
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-4">
              {items.map((item) => (
                <article key={item.id} className="grid gap-4 rounded-lg border border-neutral-200 bg-white p-4 sm:grid-cols-[120px_1fr_auto]">
                  <Link href={`/products/${item.slug}`} className="flex aspect-square items-center justify-center rounded-md bg-brand-grey">
                    <Image src={item.images[0]} alt={item.name} width={110} height={110} className="h-24 w-24 object-contain" />
                  </Link>

                  <div>
                    <p className="compact-label">{item.category}</p>
                    <Link href={`/products/${item.slug}`} className="font-display text-2xl font-black uppercase leading-none text-brand-black hover:text-brand-orange">
                      {item.name}
                    </Link>
                    <p className="mt-2 max-w-lg text-sm leading-6 text-neutral-500">{item.description}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        aria-label="Decrease quantity"
                        className="flex h-9 w-9 items-center justify-center rounded bg-brand-grey"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="flex h-9 min-w-12 items-center justify-center rounded border border-neutral-200 font-display text-xl font-black">
                        {item.quantity}
                      </span>
                      <button
                        aria-label="Increase quantity"
                        className="flex h-9 w-9 items-center justify-center rounded bg-brand-grey"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-right">
                      <div className="font-display text-3xl font-black text-brand-black">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      <div className="text-xs font-semibold text-neutral-400">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                    <button
                      className="flex h-10 w-10 items-center justify-center rounded-md bg-red-50 text-red-600 transition hover:bg-red-100"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-3xl font-black uppercase text-brand-black">Order Summary</h2>
              <div className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">MRP total</span>
                  <span className="font-bold">{formatPrice(totals.mrpTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Discount</span>
                  <span className="font-bold text-brand-green">-{formatPrice(totals.discount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="font-bold">{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between font-display text-3xl font-black text-brand-black">
                    <span>Total</span>
                    <span>{formatPrice(totals.total)}</span>
                  </div>
                </div>
              </div>
              <Link href="/checkout" className="btn-primary mt-6 w-full">
                Checkout
              </Link>
              <Link href="/products" className="btn-secondary mt-3 w-full">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
