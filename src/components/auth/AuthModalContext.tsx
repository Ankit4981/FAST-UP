"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
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

const VISITED_KEY = "fastandup_visited";

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pendingRef = useRef<PendingAction | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const { status } = useSession();

  // Auto-open signup modal on first visit if the user is not logged in
  useEffect(() => {
    // Wait until NextAuth has resolved the session
    if (status === "loading") return;

    // If already logged in, don't show the modal
    if (status === "authenticated") return;

    // If they've visited before, don't show it again
    const hasVisited = sessionStorage.getItem(VISITED_KEY);
    if (hasVisited) return;

    // Mark as visited so it only shows once per browser session
    sessionStorage.setItem(VISITED_KEY, "1");

    // Small delay so the page renders before the modal pops up
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 600);

    return () => clearTimeout(timer);
  }, [status]);

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
    <AuthModalContext.Provider
      value={{ isOpen, openModal, closeModal, pendingAction, clearPendingAction }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
