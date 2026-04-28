import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";

import { CategorySections } from "@/components/home/CategorySections";
import { FloatingAdvisorButton } from "@/components/home/FloatingAdvisorButton";
import { HealthCalculatorSection } from "@/components/home/HealthCalculatorSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { StatsStrip } from "@/components/home/StatsStrip";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductCard } from "@/components/products/ProductCard";
import { getProducts } from "@/lib/catalog";

function getFeaturedFocusProducts(products: Awaited<ReturnType<typeof getProducts>>) {
  const picks: typeof products = [];

  const patterns = [/reload/i, /whey/i, /vitamin c/i];
  patterns.forEach((pattern) => {
    const found = products.find((product) => pattern.test(product.name));
    if (found) {
      picks.push(found);
    }
  });

  for (const product of products) {
    if (picks.length >= 3) {
      break;
    }
    if (!picks.some((item) => item.id === product.id)) {
      picks.push(product);
    }
  }

  return picks.slice(0, 3);
}

export default async function HomePage() {
  const allProducts = await getProducts({ limit: 80, sort: "rating-desc" });
  const featuredProducts = allProducts.slice(0, 8);
  const focusProducts = getFeaturedFocusProducts(allProducts);

  return (
    <>
      <HeroCarousel />
      <TrustBar />
      <StatsStrip />
      <CategorySections />
      <HealthCalculatorSection products={allProducts} />

      <section className="section-shell bg-white" id="featured-products" aria-label="Featured products">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto">Featured Focus</p>
            <h2 className="section-heading mt-4">
              Fast&Up <span>Top Picks</span>
            </h2>
            <div className="orange-rule" />
            <p className="section-kicker mt-4">
              Highlighted products users ask for most: Reload, Whey Protein and Vitamin C.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {focusProducts.map((product) => (
              <ProductCard key={product.id} product={product} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell bg-brand-grey">
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

      <section className="bg-white py-12 sm:py-16" aria-label="Shopping confidence">
        <div className="container-page grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Goal-first shopping",
              copy: "Calculate your numbers first, then get relevant supplements instantly."
            },
            {
              icon: Sparkles,
              title: "Clear product choices",
              copy: "Compare outcomes using BMI, calories and protein needs instead of guesswork."
            },
            {
              icon: Star,
              title: "Trusted formulas",
              copy: "Use top-rated Fast&Up picks with direct links and practical usage guidance."
            }
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

      <section className="bg-gradient-to-br from-brand-black via-neutral-900 to-[#2a1409] py-16 sm:py-20">
        <div className="container-page text-center">
          <p className="eyebrow mx-auto border-brand-orange/30 bg-brand-orange/20 text-brand-orange">
            Start today
          </p>
          <h2 className="mt-5 font-display text-4xl font-black uppercase leading-[0.92] text-white sm:text-5xl lg:text-6xl">
            Calculate smarter.
            <br />
            <span className="text-brand-orange">Fuel better.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-white/65">
            Get your health metrics and supplement guidance in one flow.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#smart-calculator" className="btn-primary px-8 py-3 text-base">
              <Zap size={18} />
              Open Calculator
            </a>
            <Link
              href="/fastandup-advisor.html"
              className="btn-secondary border-white/30 bg-white/10 px-8 py-3 text-base text-white hover:border-white hover:bg-white hover:text-brand-black"
            >
              Open Advisor
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/products"
              className="btn-secondary border-white/30 bg-white/10 px-8 py-3 text-base text-white hover:border-white hover:bg-white hover:text-brand-black"
            >
              Browse Products
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <FloatingAdvisorButton />
    </>
  );
}
