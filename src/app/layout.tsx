import type { Metadata } from "next";
import { Rajdhani, Sora } from "next/font/google";
import type { ReactNode } from "react";

import { ChatWidgetClient } from "@/components/chat/ChatWidgetClient";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/app/providers";
import "./globals.css";

const bodyFont = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["400", "500", "600", "700"]
});

const displayFont = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["500", "600", "700"]
});

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
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <Providers>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
          <ChatWidgetClient />
        </Providers>
      </body>
    </html>
  );
}
