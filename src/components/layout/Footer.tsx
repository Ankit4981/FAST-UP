import { ExternalLink, Mail, Phone } from "lucide-react";
import Link from "next/link";

import { brandProfile, brandSocialLinks } from "@/lib/brand";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const footerLinks: Record<string, FooterLink[]> = {
  Shop: [
    { label: "Sports Nutrition", href: "/products?category=Sports+Nutrition" },
    { label: "Daily Nutrition", href: "/products?category=Daily+Nutrition" },
    { label: "Plant Power", href: "/products?category=Plant+Power" },
    { label: "Bundles", href: "/products?category=Bundles" }
  ],
  Support: [
    { label: "Track Order", href: "/dashboard" },
    { label: "Refunds", href: "/faq#returns-refunds" },
    { label: "Shipping", href: "/faq#shipping-delivery" },
    { label: "FAQ", href: "/faq" }
  ],
  Company: [
    { label: "About", href: "/about" },
    {
      label: "Partners",
      href: `mailto:${brandProfile.customerCareEmail}?subject=Partnership%20Enquiry`,
      external: true
    },
    {
      label: "Bulk Order",
      href: `mailto:${brandProfile.customerCareEmail}?subject=Bulk%20Order%20Enquiry`,
      external: true
    },
    { label: "Blogs", href: brandProfile.website, external: true }
  ]
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
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-sm font-medium text-white/55 transition hover:text-brand-orange"
                      rel="noreferrer"
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="text-sm font-medium text-white/55 transition hover:text-brand-orange"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-2 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>{brandProfile.legalName}</span>
          <span className="flex items-center gap-2">
            <Link href="/privacy" className="hover:text-brand-orange">
              Privacy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-brand-orange">
              Terms
            </Link>
            <span>|</span>
            <Link href="/disclaimer" className="hover:text-brand-orange">
              Nutrition disclaimer
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}
