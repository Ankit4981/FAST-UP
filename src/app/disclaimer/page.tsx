import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nutrition Disclaimer",
  description: "Nutrition and wellness disclaimer for product recommendations."
};

export default function DisclaimerPage() {
  return (
    <section className="bg-brand-grey py-10 sm:py-14">
      <div className="container-page">
        <article className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="compact-label">Legal</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black">
            Nutrition <span className="text-brand-orange">Disclaimer</span>
          </h1>
          <div className="mt-5 grid gap-4 text-sm leading-7 text-neutral-600 sm:text-base">
            <p>
              Product and AI guidance on this website is for general informational purposes and is
              not medical advice.
            </p>
            <p>
              Consult a qualified healthcare professional before using supplements, especially if
              you are pregnant, nursing, taking medication or have a medical condition.
            </p>
            <p>
              Always follow label instructions, and discontinue use if any adverse reaction occurs.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
