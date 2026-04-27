import { Mail, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

import { brandProfile, brandSocialLinks } from "@/lib/brand";

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const InstagramIcon = (props: any) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const FacebookIcon = (props: any) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const LinkedinIcon = (props: any) => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const socialIconMap: Record<string, any> = {
  Instagram: InstagramIcon,
  Facebook: FacebookIcon,
  LinkedIn: LinkedinIcon,
  WhatsApp: MessageCircle,
};

const socialColorMap: Record<string, string> = {
  Instagram: "hover:bg-[#E1306C] hover:border-[#E1306C]",
  Facebook: "hover:bg-[#1877F2] hover:border-[#1877F2]",
  LinkedIn: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
  WhatsApp: "hover:bg-[#25D366] hover:border-[#25D366]",
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

          <div className="mt-6 flex flex-wrap gap-3">
            {brandSocialLinks.map((item) => {
              const Icon = socialIconMap[item.label];
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Fast&Up on ${item.label}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/70 transition-all duration-200 hover:scale-110 hover:text-white ${socialColorMap[item.label] ?? "hover:bg-brand-orange hover:border-transparent"}`}
                >
                  {Icon ? <Icon /> : item.label}
                </a>
              );
            })}
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
