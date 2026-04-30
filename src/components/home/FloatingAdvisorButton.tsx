"use client";

import { Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  asCtaButton?: boolean;
}

export function FloatingAdvisorButton({ asCtaButton = false }: Props) {
  if (asCtaButton) {
    return (
      <Link
        href="/#smart-calculator"
        className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3 text-base"
      >
        <Zap size={18} />
        Open Health Calculator
      </Link>
    );
  }

  return (
    <Link
      id="feature-ai-advisor"
      href="/#smart-calculator"
      aria-label="Open Health Calculator"
      className="group fixed bottom-6 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-3 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-orangeDark sm:bottom-6 sm:left-6"
    >
      <span
        className="absolute inset-0 -z-10 rounded-full bg-brand-orange/20 ring-2 ring-brand-orange/30"
        aria-hidden
      />
      <Zap size={20} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-44 group-hover:opacity-100 sm:max-w-44 sm:opacity-100">
        Calculate Your Plan
      </span>
    </Link>
  );
}
