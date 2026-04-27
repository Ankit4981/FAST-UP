"use client";

import { CheckCircle2, Loader2, ShoppingCart } from "lucide-react";
import type { Product } from "@/types";
import { useAddToCart } from "@/hooks/useAddToCart";

type Props = {
  product: Product;
  quantity?: number;
  /** Tailwind class overrides — defaults to btn-primary */
  className?: string;
  /** Label override */
  label?: string;
};

export function AddToCartButton({ product, quantity = 1, className, label }: Props) {
  const { addToCart, addState, isLoading } = useAddToCart();

  const baseClass = className ?? "btn-primary";

  const isAdded = addState === "added";
  const isAdding = addState === "adding";
  const disabled = isLoading || isAdding || isAdded;

  return (
    <button
      className={`${baseClass} flex items-center justify-center gap-2 transition-all`}
      disabled={disabled}
      onClick={() => addToCart(product, quantity)}
      aria-label={isAdded ? "Item added to cart" : `Add ${product.name} to cart`}
    >
      {isAdding && <Loader2 size={16} className="animate-spin" />}
      {isAdded && <CheckCircle2 size={16} className="text-green-500" />}
      {!isAdding && !isAdded && <ShoppingCart size={16} />}

      <span>
        {isAdding ? "Adding…" : isAdded ? "Added to cart!" : (label ?? "Add to cart")}
      </span>
    </button>
  );
}
