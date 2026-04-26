// src/app/page.tsx  — SERVER COMPONENT (no "use client" needed)
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";

import { CategorySections } from "@/components/home/CategorySections";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { StatsStrip } from "@/components/home/StatsStrip";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts } from "@/lib/catalog";
import { FloatingAdvisorButton } from "@/components/home/FloatingAdvisorButton";

export default async function HomePage() {
  const featuredProducts = await getProducts({ limit: 8, sort: "rating-desc" });

  return (
    <>
      <HeroCarousel />
      <TrustBar />
      <StatsStrip />
      <CategorySections />

      {/* ── Bestsellers ─────────────────────────────────────────────────── */}
      <section className="section-shell bg-white">
        <div className="container-page">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Most ordered</p>
              <h2 className="section-heading mt-4 text-left">
                Best<span>sellers</span>
              </h2>
              <div className="orange-rule mx-0" />
              <p className="section-kicker max-w-2xl text-left">
                High-rated hydration, recovery and daily nutrition picks for active routines.
              </p>
            </div>
            <Link href="/products" className="btn-secondary w-fit">
              View all products
              <ArrowRight size={18} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Shopping confidence cards ────────────────────────────────────── */}
      <section className="bg-brand-grey py-12 sm:py-16" aria-label="Shopping confidence">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Goal-first shopping",
              copy: "Browse by hydration, muscle recovery, daily wellness or plant-based nutrition.",
            },
            {
              icon: Sparkles,
              title: "Clear choices",
              copy: "Compare benefits, flavours and prices without losing your place.",
            },
            {
              icon: MessageCircle,
              title: "Help when needed",
              copy: "Get guidance on usage, delivery questions and the right next product.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-orange/10 text-brand-orange">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="mt-4 font-display text-2xl font-black uppercase leading-none text-brand-black">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{item.copy}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── AI Coach CTA (existing — untouched) ─────────────────────────── */}
      <section id="ai-coach" className="bg-brand-orange py-12 text-white sm:py-16">
        <div className="container-page flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <p className="font-display text-sm font-extrabold uppercase tracking-[0.18em] text-white/75">
              Product coach
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-5xl font-black uppercase leading-none sm:text-6xl">
              Get matched to the right stack
            </h2>
            <p className="mt-3 max-w-2xl text-base font-medium text-white/85">
              Share your goal, activity level and preferences for a faster path to the right products.
            </p>
          </div>
          <Link
            href="/products"
            className="btn-secondary border-white bg-white text-brand-orange hover:border-white"
          >
            Browse while you chat
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── NEW: AI Advisor feature section ──────────────────────────────── */}
      <section className="section-shell bg-white" aria-label="AI Product Advisor">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto">Powered by AI</p>
            <h2 className="section-heading mt-4">
              Your personal<span> nutrition advisor</span>
            </h2>
            <div className="orange-rule" />
            <p className="section-kicker mt-4">
              Answer 4 quick questions about your goals, activity level and diet — and get a
              personalised supplement recommendation in seconds. No sign-up required.
            </p>
            {/* Client island just for the onClick */}
            <FloatingAdvisorButton asCtaButton />
            <p className="mt-3 text-xs text-neutral-400">
              Takes less than 60 seconds · 100% free
            </p>
          </div>

          {/* Feature tiles */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              {
                emoji: "🎯",
                title: "Goal-matched picks",
                copy: "Whether you're building muscle, boosting endurance or staying hydrated — the advisor narrows it down.",
              },
              {
                emoji: "⚡",
                title: "Instant results",
                copy: "No waiting. Your personalised product stack appears the moment you answer the final question.",
              },
              {
                emoji: "🔬",
                title: "AI confidence scores",
                copy: "Every recommendation shows an AI match score so you know exactly why a product fits your profile.",
              },
            ].map((tile) => (
              <div
                key={tile.title}
                className="rounded-lg border border-neutral-100 bg-brand-grey p-6"
              >
                <span className="text-2xl">{tile.emoji}</span>
                <h3 className="mt-3 font-display text-xl font-black uppercase text-brand-black">
                  {tile.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{tile.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Floating button (fixed bottom-right, client island) ───────────── */}
      <FloatingAdvisorButton />
    </>
  );
}