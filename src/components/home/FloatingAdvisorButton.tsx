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
        href="/fastandup-advisor.html"
        className="btn-primary mt-8 inline-flex items-center gap-2 px-8 py-3 text-base"
      >
        <Zap size={18} />
        Start AI Advisor
      </Link>
    );
  }

  return (
    <Link
      href="/fastandup-advisor.html"
      aria-label="Open AI Product Advisor"
      className="group fixed bottom-6 left-4 z-40 inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-3 text-sm font-bold text-white shadow-lift transition hover:-translate-y-0.5 hover:bg-brand-orangeDark sm:bottom-6 sm:left-6"
    >
      <Zap size={20} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-44 group-hover:opacity-100 sm:max-w-44 sm:opacity-100">
        Get Recommendation
      </span>
    </Link>
  );
}
