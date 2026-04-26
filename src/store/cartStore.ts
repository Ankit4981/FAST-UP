import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { CartItem, Product } from "@/types";

type CartState = {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: Math.min(item.quantity + quantity, 99) }
                  : item
              )
            };
          }

          return {
            items: [...state.items, { ...product, quantity }]
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId)
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item
            )
            .filter((item) => item.quantity > 0)
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: "fastandup-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
);

export function getCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 599 ? 0 : 49;

  return {
    subtotal,
    mrpTotal,
    discount: Math.max(0, mrpTotal - subtotal),
    shipping,
    total: subtotal + shipping
  };
}
