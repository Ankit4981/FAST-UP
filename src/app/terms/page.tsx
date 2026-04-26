import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms and conditions for this Fast&Up inspired storefront."
};

export default function TermsPage() {
  return (
    <section className="bg-brand-grey py-10 sm:py-14">
      <div className="container-page">
        <article className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="compact-label">Legal</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black">
            Terms <span className="text-brand-orange">& Conditions</span>
          </h1>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-neutral-600 sm:text-base">
            <p>
              Product details, pricing, shipping timelines and support availability are subject to
              change without prior notice.
            </p>
            <p>
              Orders are accepted after checkout confirmation and may be canceled in case of stock
              or payment verification issues.
            </p>
            <p>
              By using this storefront, you agree to provide accurate checkout and account
              information.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
