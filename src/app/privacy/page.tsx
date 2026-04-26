import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy notice for this Fast&Up inspired storefront."
};

export default function PrivacyPage() {
  return (
    <section className="bg-brand-grey py-10 sm:py-14">
      <div className="container-page">
        <article className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="compact-label">Legal</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black">
            Privacy <span className="text-brand-orange">Notice</span>
          </h1>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-neutral-600 sm:text-base">
            <p>
              We collect basic account and order information needed to process purchases, provide
              support and improve the shopping experience.
            </p>
            <p>
              Chat messages may be processed by AI systems to generate recommendations and support
              responses. Avoid sharing sensitive personal data in chat.
            </p>
            <p>
              For privacy-related requests, contact support through the official customer care
              channels listed in the footer.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
