"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { CartItem } from "@/types";

type PendingAction = {
  type: "add_to_cart";
  item: CartItem;
};

type AuthModalContextValue = {
  isOpen: boolean;
  openModal: (pending?: PendingAction) => void;
  closeModal: () => void;
  pendingAction: PendingAction | null;
  clearPendingAction: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingRef = useRef<PendingAction | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const openModal = useCallback((pending?: PendingAction) => {
    if (pending) {
      pendingRef.current = pending;
      setPendingAction(pending);
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const clearPendingAction = useCallback(() => {
    pendingRef.current = null;
    setPendingAction(null);
  }, []);

  return (
    <AuthModalContext.Provider value={{ isOpen, openModal, closeModal, pendingAction, clearPendingAction }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
