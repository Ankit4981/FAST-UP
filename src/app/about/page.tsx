import type { Metadata } from "next";

import { brandProfile } from "@/lib/brand";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Fast&Up inspired nutrition shopping and support."
};

export default function AboutPage() {
  return (
    <section className="bg-brand-grey py-10 sm:py-14">
      <div className="container-page">
        <article className="mx-auto max-w-3xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="compact-label">Company</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black">
            About <span className="text-brand-orange">Fast&Up</span>
          </h1>
          <p className="mt-5 text-sm leading-7 text-neutral-600 sm:text-base">
            This storefront is a modern Fast&Up-inspired demo experience built for sports
            nutrition discovery, shopping and guided support. It brings together product
            filtering, checkout and AI-assisted recommendations in one flow.
          </p>
          <div className="mt-6 grid gap-3 rounded-lg bg-brand-grey p-4 text-sm text-neutral-700">
            <p>
              <span className="font-bold">Legal name:</span> {brandProfile.legalName}
            </p>
            <p>
              <span className="font-bold">Website:</span>{" "}
              <a
                href={brandProfile.website}
                className="text-brand-orange hover:underline"
                rel="noreferrer"
                target="_blank"
              >
                {brandProfile.website}
              </a>
            </p>
            <p>
              <span className="font-bold">Support:</span> {brandProfile.customerCareEmail} ·{" "}
              {brandProfile.customerCarePhone}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
