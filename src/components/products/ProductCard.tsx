"use client";

import { Check, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";
import { formatPrice, getDiscount } from "@/lib/utils";

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const addItem = useCartStore((state) => state.addItem);
  const [justAdded, setJustAdded] = useState(false);
  const discount = getDiscount(product.price, product.mrp);

  function handleAddToCart() {
    addItem(product);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  }

  return (
    <article className="group overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lift focus-within:border-brand-orange">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative flex aspect-[1.15] items-center justify-center overflow-hidden bg-neutral-100">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 50% 40%, ${product.imageAccent}, transparent 55%)`
            }}
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-white">
              {product.badge}
            </span>
          ) : null}
          <Image
            src={product.images[0]}
            alt={product.name}
            width={360}
            height={360}
            className="relative h-[78%] w-[78%] object-contain transition duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      <div className="p-4">
        <div className="mb-2 flex items-center gap-1 text-amber-500" aria-label={`${product.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={14}
              aria-hidden
              className={index < Math.round(product.rating) ? "fill-current" : "text-neutral-300"}
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-neutral-400">
            ({product.reviewCount.toLocaleString("en-IN")})
          </span>
        </div>

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-display text-xl font-black uppercase leading-none text-brand-black transition hover:text-brand-orange">
            {product.name}
          </h3>
        </Link>
        {!compact ? (
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-neutral-500">
            {product.description}
          </p>
        ) : null}

        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.flavours.slice(0, 4).map((flavour) => (
            <span
              key={flavour.name}
              title={flavour.name}
              aria-label={`${flavour.name} flavour`}
              className="h-5 w-5 rounded-full border-2 border-neutral-200"
              style={{ backgroundColor: flavour.color }}
            />
          ))}
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-neutral-200 pt-3">
          <div>
            <div className="font-display text-2xl font-black text-brand-black">
              {formatPrice(product.price)}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-400 line-through">{formatPrice(product.mrp)}</span>
              {discount > 0 ? (
                <span className="font-bold text-brand-green">{discount}% OFF</span>
              ) : null}
            </div>
          </div>
          <button
            className="btn-primary min-w-24"
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            aria-live="polite"
          >
            {justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
            {justAdded ? "Added" : "Add"}
          </button>
        </div>
      </div>
    </article>
  );
}
