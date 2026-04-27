"use client";

import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "10M+", label: "Happy athletes" },
  { value: "100+", label: "Products" },
  { value: "50+",  label: "Sport events" },
  { value: "20+",  label: "Countries" },
  { value: "2015", label: "Est. year" },
];

export function StatsStrip() {
  // Single shared visibility flag — one IntersectionObserver on the strip itself
  const [visible, setVisible] = useState(false);
  const stripRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={stripRef}
      className="relative overflow-hidden bg-neutral-950 text-white"
      aria-label="Brand highlights"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, #F2652220, transparent)",
        }}
        aria-hidden
      />

      <div className="container-page relative grid grid-cols-2 gap-px sm:grid-cols-5">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`group relative overflow-hidden bg-white/[0.04] px-4 py-7 text-center transition-all duration-700 hover:bg-white/[0.08] ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
          >
            <div className="absolute inset-x-0 bottom-0 h-0.5 scale-x-0 bg-brand-orange transition-transform duration-300 group-hover:scale-x-100" aria-hidden />
            <div
              className={`font-display text-4xl font-black text-brand-orange transition-all duration-700 sm:text-5xl ${
                visible ? "scale-100" : "scale-75"
              }`}
              style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
            >
              {stat.value}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/50">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
