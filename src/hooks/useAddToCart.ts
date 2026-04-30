"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { useAuthModal } from "@/components/auth/AuthModalContext";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types";

type AddToCartState = "idle" | "adding" | "added" | "error";

export function useAddToCart() {
  const { data: session, status } = useSession();
  const { openModal, pendingAction, clearPendingAction } = useAuthModal();
  const addItem = useCartStore((state) => state.addItem);
  const [addState, setAddState] = useState<AddToCartState>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // After login completes, if there's a pending action and we're now authenticated, execute it
  useEffect(() => {
    if (status === "authenticated" && pendingAction?.type === "add_to_cart") {
      addItem(pendingAction.item, pendingAction.item.quantity);
      clearPendingAction();
      flashAdded();
    }
  }, [status, pendingAction, addItem, clearPendingAction]);

  function flashAdded() {
    setAddState("added");
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setAddState("idle"), 2000);
  }

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      if (status === "loading") return;

      if (!session?.user) {
        // Save intended action, open modal
        openModal({
          type: "add_to_cart",
          item: { ...product, quantity },
        });
        return;
      }

      // Already authenticated — add directly
      setAddState("adding");
      setTimeout(() => {
        addItem(product, quantity);
        flashAdded();
      }, 150); // small delay for perceived feedback
    },
    [session, status, openModal, addItem]
  );

  return { addToCart, addState, isLoading: status === "loading" };
}
