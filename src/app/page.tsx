// src/app/page.tsx  — SERVER COMPONENT (no "use client" needed)
import Link from "next/link";
import { ArrowRight, Brain, CheckCircle2, MessageCircle, ShieldCheck, Sparkles, Star, Zap } from "lucide-react";

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

      {/* ── AI Coach CTA ─────────────────────────────────────────────────── */}
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
          {/* ✅ FIXED: was incorrectly linking to /products */}
          <Link
            href="/fastandup-advisor.html"
            className="btn-secondary shrink-0 border-white bg-white text-brand-orange hover:border-white"
          >
            <Zap size={18} />
            Try AI Advisor
          </Link>
        </div>
      </section>

      {/* ── NEW: How the AI Advisor Works (3-step) ───────────────────────── */}
      <section className="section-shell bg-brand-grey" aria-label="How the AI Advisor works">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto">Simple & fast</p>
            <h2 className="section-heading mt-4">
              How the <span>AI Advisor</span> works
            </h2>
            <div className="orange-rule" />
            <p className="section-kicker mt-4">
              Three steps to your perfect supplement stack — takes under 60 seconds.
            </p>
          </div>

          <div className="relative mt-20">
            {/* Connector line — vertically centred on the circles (circle is h-20 = 80px, badge above adds ~24px, so centre = 24 + 40 = 64px from top of wrapper) */}
            <div className="absolute left-[16.66%] right-[16.66%] top-16 hidden h-0.5 bg-gradient-to-r from-brand-orange/30 via-brand-orange to-brand-orange/30 md:block" aria-hidden />

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: MessageCircle,
                  title: "Answer 4 questions",
                  copy: "Tell us your fitness goal, activity level, diet preference and any specific health focus. No sign-up required.",
                  badge: "~30 seconds",
                },
                {
                  step: "02",
                  icon: Brain,
                  title: "AI analyses your profile",
                  copy: "Our AI cross-references your answers with 100+ products and clinically-informed formulations to find the best match.",
                  badge: "Instant",
                },
                {
                  step: "03",
                  icon: Zap,
                  title: "Get your personalised stack",
                  copy: "Receive product recommendations with AI confidence scores, usage guidance and direct add-to-cart shortcuts.",
                  badge: "With confidence scores",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.step} className="relative flex flex-col items-center text-center">
                    {/* Step badge — sits clearly above the circle with enough clearance */}
                    <span className="mb-3 inline-flex rounded-full bg-brand-black px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white">
                      Step {item.step}
                    </span>
                    {/* Step bubble */}
                    <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-brand-orange shadow-lift ring-4 ring-white">
                      <Icon size={28} className="text-white" aria-hidden />
                    </div>
                    <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                      <h3 className="font-display text-2xl font-black uppercase leading-none text-brand-black">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-neutral-500">{item.copy}</p>
                      <span className="mt-4 inline-flex items-center rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-bold text-brand-orange">
                        {item.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/fastandup-advisor.html"
                className="btn-primary px-8 py-3 text-base"
              >
                <Zap size={18} />
                Start AI Advisor — It&apos;s Free
              </Link>
              <p className="mt-3 text-xs text-neutral-400">
                No sign-up needed · Personalised in under 60 seconds
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEW: Why Fast&Up (Differentiation) ──────────────────────────── */}
      <section className="section-shell bg-neutral-950 text-white" aria-label="Why Fast&Up">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto border-brand-orange/30 bg-brand-orange/20 text-brand-orange">
              Why Fast&amp;Up
            </p>
            <h2 className="mt-4 text-center font-display text-4xl font-black uppercase leading-[0.92] text-white sm:text-5xl lg:text-6xl">
              Not just another <span className="text-brand-orange">supplement brand</span>
            </h2>
            <div className="orange-rule" />
            <p className="mt-4 text-center text-sm font-medium leading-6 text-white/60 sm:text-base">
              While others give you pill overload and confusing labels, Fast&amp;Up delivers Swiss-tech effervescent nutrition that your body absorbs faster — backed by science, guided by AI.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Swiss Effervescent Technology",
                copy: "Effervescent tablets dissolve instantly for faster nutrient absorption vs. traditional capsules and powders. No chalky aftertaste.",
                highlight: "3× faster absorption",
              },
              {
                title: "AI-Powered Product Matching",
                copy: "Our AI Advisor analyses your goals, activity level and diet to recommend the exact products your body needs — not generic stacks.",
                highlight: "Personalised to you",
              },
              {
                title: "Clinically Informed Formulas",
                copy: "Every product is developed with sports nutritionists and dietitians. No proprietary blends — full transparency on every label.",
                highlight: "Science-backed",
              },
              {
                title: "100% Vegan Across Ranges",
                copy: "From protein to multivitamins, every Fast&Up product is plant-friendly, free from animal-derived ingredients and cruelty-free.",
                highlight: "Fully plant-friendly",
              },
              {
                title: "Made in India, Trusted Globally",
                copy: "Manufactured in GMP-certified facilities in India, exported to 20+ countries and trusted by 10 million athletes worldwide.",
                highlight: "20+ countries",
              },
              {
                title: "Goal-First Discovery",
                copy: "Shop by your goal — not by product category. Our AI coach, smart filters and category guides help you find the right thing fast.",
                highlight: "No more guesswork",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group rounded-xl border border-white/10 bg-white/5 p-6 transition duration-200 hover:border-brand-orange/50 hover:bg-white/8"
              >
                <span className="inline-flex items-center rounded-full bg-brand-orange/20 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-orange">
                  {item.highlight}
                </span>
                <h3 className="mt-4 font-display text-xl font-black uppercase leading-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/55">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEW: Testimonials ────────────────────────────────────────────── */}
      <section className="section-shell bg-white" aria-label="Customer testimonials">
        <div className="container-page">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow mx-auto">Real athletes, real results</p>
            <h2 className="section-heading mt-4">
              Trusted by <span>10 million</span>
            </h2>
            <div className="orange-rule" />
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Priya Sharma",
                role: "Marathon Runner, Mumbai",
                rating: 5,
                text: "The Reload Electrolyte is my race-day essential. The AI Advisor recommended the marathon bundle based on my training schedule and it was spot on. Absorbed instantly, no stomach issues.",
                product: "Reload Electrolyte + Marathon Bundle",
              },
              {
                name: "Arjun Mehta",
                role: "Fitness Coach, Bangalore",
                rating: 5,
                text: "I recommend Fast&Up to all my clients now. The AI Advisor is genuinely impressive — it gave confidence scores for each recommendation and explained exactly why each product fits their profile.",
                product: "Recover BCAA + Plant Protein",
              },
              {
                name: "Sneha Kapoor",
                role: "Yoga Instructor, Delhi",
                rating: 5,
                text: "As a vegan, finding complete nutrition used to be hard. Fast&Up's plant-based range is incredible. Took the AI quiz and had my perfect stack in under a minute. Fizz tablets are a game changer.",
                product: "Plant Protein + Vitalize Multivitamin",
              },
              {
                name: "Rohan Verma",
                role: "Competitive Cyclist, Pune",
                rating: 5,
                text: "Swiss effervescent technology isn't just marketing — you genuinely feel the difference in how quickly your body recovers. The AI coach suggested I try the energy drinks during rides. Never looked back.",
                product: "Energy Drinks + Recover BCAA",
              },
              {
                name: "Ananya Iyer",
                role: "Working Professional, Chennai",
                rating: 5,
                text: "Used the AI Advisor expecting generic advice. Instead, it matched me specifically to women's nutrition products based on my lifestyle. The Collagen Glow has been amazing. Super fast delivery too.",
                product: "Collagen Glow + Daily Nutrition",
              },
              {
                name: "Vikram Singh",
                role: "College Athlete, Hyderabad",
                rating: 5,
                text: "Budget-friendly compared to international brands but the quality is on par. The BCAA formula and the AI stack builder helped me prep for nationals. I could actually notice the recovery difference.",
                product: "Recover BCAA + Activate Pre-Workout",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="flex flex-col rounded-xl border border-neutral-100 bg-brand-grey p-6 shadow-sm"
              >
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand-orange text-brand-orange" aria-hidden />
                  ))}
                </div>
                <p className="mt-3 flex-1 text-sm leading-7 text-neutral-600">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="mt-5 border-t border-neutral-200 pt-4">
                  <p className="text-sm font-black uppercase text-brand-black">{testimonial.name}</p>
                  <p className="text-xs font-medium text-neutral-400">{testimonial.role}</p>
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-2 py-1 text-[10px] font-bold text-brand-orange">
                    <CheckCircle2 size={10} />
                    {testimonial.product}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AI Advisor feature section ────────────────────────────────────── */}
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
            <FloatingAdvisorButton asCtaButton />
            <p className="mt-3 text-xs text-neutral-400">
              Takes less than 60 seconds · 100% free
            </p>
          </div>

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

      {/* ── Final CTA Strip ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-brand-black via-neutral-900 to-[#2a1409] py-16 sm:py-20">
        <div className="container-page text-center">
          <p className="eyebrow mx-auto border-brand-orange/30 bg-brand-orange/20 text-brand-orange">
            Start today
          </p>
          <h2 className="mt-5 font-display text-4xl font-black uppercase leading-[0.92] text-white sm:text-5xl lg:text-6xl">
            Fuel smarter.<br />
            <span className="text-brand-orange">Recover faster.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-white/65">
            Join 10 million athletes who&apos;ve made the switch to Swiss effervescent nutrition — personalised by AI, delivered to your door.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/fastandup-advisor.html" className="btn-primary px-8 py-3 text-base">
              <Zap size={18} />
              Get My AI Recommendation
            </Link>
            <Link
              href="/products"
              className="btn-secondary border-white/30 bg-white/10 px-8 py-3 text-base text-white hover:border-white hover:bg-white hover:text-brand-black"
            >
              Browse All Products
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="mt-4 text-xs text-white/35">
            Free shipping above ₹599 · Easy 7-day returns · 10M+ happy athletes
          </p>
        </div>
      </section>

      {/* ── Floating button (fixed bottom-right, client island) ───────────── */}
      <FloatingAdvisorButton />
    </>
  );
}
