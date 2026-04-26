"use client";

import { Minus, Plus, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

export function ProductDetailActions({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function addToCart() {
    addItem(product, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-[150px_1fr]">
      <div className="flex h-12 items-center justify-between rounded-md border border-neutral-300 bg-white px-2">
        <button
          aria-label="Decrease quantity"
          className="flex h-9 w-9 items-center justify-center rounded bg-brand-grey"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        >
          <Minus size={16} />
        </button>
        <span className="font-display text-2xl font-black">{quantity}</span>
        <button
          aria-label="Increase quantity"
          className="flex h-9 w-9 items-center justify-center rounded bg-brand-grey"
          onClick={() => setQuantity((value) => Math.min(99, value + 1))}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button className="btn-primary h-12" onClick={addToCart}>
          <ShoppingCart size={18} />
          {added ? "Added" : "Add to Cart"}
        </button>
        <Link href="/cart" className="btn-secondary h-12">
          View Cart
        </Link>
      </div>
    </div>
  );
}
