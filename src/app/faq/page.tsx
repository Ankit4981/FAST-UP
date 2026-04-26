import type { Metadata } from "next";

import { faqData } from "@/lib/faq";

const faqAnchorMap: Record<string, string> = {
  "How long does delivery take?": "shipping-delivery",
  "Can I return nutrition products?": "returns-refunds"
};

export const metadata: Metadata = {
  title: "FAQ",
  description: "Shipping, returns, usage and order support FAQs."
};

export default function FaqPage() {
  return (
    <section className="bg-brand-grey py-10 sm:py-14">
      <div className="container-page">
        <article className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="compact-label">Support</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black">
            Help <span className="text-brand-orange">Center</span>
          </h1>
          <p className="mt-4 text-sm leading-7 text-neutral-600 sm:text-base">
            Quick answers for shipping, returns, usage and order support.
          </p>

          <div className="mt-8 grid gap-4">
            {faqData.map((faq) => {
              const anchor = faqAnchorMap[faq.question];
              return (
                <article
                  key={faq.question}
                  id={anchor}
                  className="rounded-lg border border-neutral-200 p-4"
                >
                  <h2 className="font-display text-2xl font-black uppercase text-brand-black">
                    {faq.question}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-neutral-600 sm:text-base">
                    {faq.answer}
                  </p>
                </article>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}
