import { ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { brandProfile, brandSocialLinks } from "@/lib/brand";

const footerLinks = {
  Shop: ["Sports Nutrition", "Daily Nutrition", "Plant Power", "Bundles"],
  Support: ["Track Order", "Refunds", "Shipping", "FAQ"],
  Company: ["About", "Partners", "Bulk Order", "Blogs"]
};

export function Footer() {
  return (
    <footer className="bg-brand-black text-white">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.1fr_2fr] lg:py-16">
        <div>
          <Link href="/" className="font-display text-3xl font-black uppercase tracking-normal">
            Fast<span className="text-brand-orange">&</span>Up
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
            Fast acting nutrition for active routines, supported by guided product discovery and order-aware help.
          </p>

          <div className="mt-6 grid gap-2 text-sm text-white/60">
            <a
              href={`mailto:${brandProfile.customerCareEmail}`}
              className="inline-flex items-center gap-2 transition hover:text-brand-orange"
            >
              <Mail size={16} aria-hidden />
              {brandProfile.customerCareEmail}
            </a>
            <a
              href={`tel:${brandProfile.customerCarePhone.replaceAll("-", "")}`}
              className="inline-flex items-center gap-2 transition hover:text-brand-orange"
            >
              <Phone size={16} aria-hidden />
              {brandProfile.customerCarePhone}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {brandSocialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="chip border-white/10 bg-white/5 text-white/70 hover:border-brand-orange hover:bg-brand-orange hover:text-white"
              >
                {item.label}
                <ExternalLink size={12} aria-hidden />
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-brand-orange">
                {group}
              </h3>
              <div className="mt-4 grid gap-3">
                {links.map((link) => (
                  <Link
                    key={link}
                    href={group === "Shop" ? `/products?search=${encodeURIComponent(link)}` : "/dashboard"}
                    className="text-sm font-medium text-white/55 transition hover:text-brand-orange"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-2 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>{brandProfile.legalName}</span>
          <span>Privacy | Terms | Nutrition disclaimer</span>
        </div>
      </div>
    </footer>
  );
}
