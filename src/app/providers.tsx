"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";

import { AuthModal } from "@/components/auth/AuthModal";
import { AuthModalProvider } from "@/components/auth/AuthModalContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthModalProvider>
        {children}
        {/* Auth modal is mounted globally so it works from any page */}
        <AuthModal />
      </AuthModalProvider>
    </SessionProvider>
  );
}