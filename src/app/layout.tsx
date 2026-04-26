import type { Metadata } from "next";
import type { ReactNode } from "react";

import { ChatWidgetClient } from "@/components/chat/ChatWidgetClient";
import { VoiceAgent } from "@/components/voice/VoiceAgent"
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/app/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Fast&Up Inspired Store | Intelligent Sports Nutrition",
    template: "%s | Fast&Up Inspired Store"
  },
  description:
    "A production-grade sports nutrition ecommerce experience with dynamic products, cart, checkout, dashboard and an AI shopping assistant.",
  metadataBase: new URL("https://fastandup-commerce.vercel.app"),
  openGraph: {
    title: "Fast&Up Inspired Store",
    description: "Shop hydration, recovery, protein and daily nutrition with an AI product coach.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <ChatWidgetClient />
          <VoiceAgent />
        </Providers>
      </body>
    </html>
  );
}
