"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "New Launch 2026",
    title: ["Drop.", "Fizz.", "Drink."],
    copy: "India-style effervescent sports nutrition with vegan hydration, recovery and daily wellness support.",
    cta: "Shop Now",
    secondaryCta: "Explore hydration",
    href: "/products",
    secondaryHref: "/products?search=hydration",
    image: "/products/reload-electrolyte.webp",
    imageAlt: "Reload Electrolyte tube",
    className: "from-brand-black via-neutral-950 to-[#2a1409]"
  },
  {
    eyebrow: "Best Seller",
    title: ["Reload", "Electro-", "lyte"],
    copy: "Replenish lost minerals, sustain output and recover smarter through long, sweaty sessions.",
    cta: "Buy Reload",
    secondaryCta: "Build a stack",
    href: "/products/reload-electrolyte",
    secondaryHref: "/products?category=Bundles",
    image: "/products/marathon-bundle.webp",
    imageAlt: "Marathon hydration bundle",
    className: "from-[#06291c] via-[#0c3f2b] to-[#062a33]"
  },
  {
    eyebrow: "Fuel Your Fit",
    title: ["Train.", "Recover.", "Repeat."],
    copy: "From race day to yoga mornings, get recommendations based on your goal, activity and preferences.",
    cta: "Ask AI Coach",
    secondaryCta: "Shop protein",
    href: "#ai-coach",
    secondaryHref: "/products?search=protein",
    image: "/products/plant-protein.webp",
    imageAlt: "Plant Protein Performance pack",
    className: "from-[#111111] via-[#30210d] to-[#6b2108]"
  }
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyPreference = () => {
      setPrefersReducedMotion(media.matches);
      if (media.matches) {
        setPaused(true);
      }
    };

    applyPreference();
    media.addEventListener("change", applyPreference);

    return () => media.removeEventListener("change", applyPreference);
  }, []);

  useEffect(() => {
    if (paused || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [paused, prefersReducedMotion]);

  const slide = slides[active];

  return (
    <section
      className={`relative isolate overflow-hidden bg-gradient-to-br ${slide.className}`}
      aria-roledescription="carousel"
      aria-label="Featured products"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        if (!prefersReducedMotion) {
          setPaused(false);
        }
      }}
    >
      <div className="container-page grid min-h-[560px] items-center gap-8 py-10 sm:min-h-[620px] lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:py-0">
        <div className="relative z-10 max-w-2xl text-white" aria-live={paused ? "polite" : "off"}>
          <p className="mb-5 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-brand-orange ring-1 ring-white/15">
            {slide.eyebrow}
          </p>
          <h1 className="font-display text-[clamp(4rem,17vw,8.5rem)] font-black uppercase leading-[0.82] tracking-normal">
            {slide.title.map((line, index) => (
              <span key={line} className={index === 2 ? "block text-brand-orange" : "block"}>
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-7 text-white/78 sm:text-lg">
            {slide.copy}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={slide.href} className="btn-primary">
              {slide.cta}
            </Link>
            <Link
              href={slide.secondaryHref}
              className="btn-secondary border-white/30 bg-white/10 text-white hover:border-white hover:bg-white hover:text-brand-black"
            >
              {slide.secondaryCta}
            </Link>
          </div>

          <div className="mt-8 hidden max-w-xl grid-cols-3 gap-4 text-white sm:grid">
            {[
              ["4.8/5", "Rated"],
              ["10M+", "Athletes"],
              ["Free", "Shipping 599+"]
            ].map(([value, label]) => (
              <div key={label} className="border-l border-white/20 pl-3">
                <div className="font-display text-2xl font-black leading-none">{value}</div>
                <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white/55">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex min-h-[300px] items-center justify-center lg:min-h-[560px]">
          <Image
            src={slide.image}
            alt={slide.imageAlt}
            width={540}
            height={540}
            priority
            className="relative max-h-[470px] w-full object-contain drop-shadow-[0_34px_60px_rgba(0,0,0,0.42)] transition duration-500"
          />
        </div>
      </div>

      <button
        aria-label="Previous slide"
        className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-brand-orange sm:flex"
        onClick={() => setActive((current) => (current - 1 + slides.length) % slides.length)}
      >
        <ChevronLeft />
      </button>
      <button
        aria-label="Next slide"
        className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-brand-orange sm:flex"
        onClick={() => setActive((current) => (current + 1) % slides.length)}
      >
        <ChevronRight />
      </button>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2" role="tablist" aria-label="Hero slides">
        {slides.map((item, index) => (
          <button
            key={item.eyebrow}
            role="tab"
            aria-label={`Go to slide ${index + 1}`}
            aria-selected={index === active}
            className={`h-2.5 rounded-full transition ${
              index === active ? "w-8 bg-brand-orange" : "w-2.5 bg-white/50"
            }`}
            onClick={() => setActive(index)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/30 bg-black/25 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-white backdrop-blur transition hover:border-white"
        aria-label={paused ? "Resume carousel autoplay" : "Pause carousel autoplay"}
      >
        {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        {paused ? "Play" : "Pause"}
      </button>
    </section>
  );
}
