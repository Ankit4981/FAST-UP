import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Signup",
  description: "Create a new ecommerce account."
};

export default function SignupPage() {
  return (
    <section className="bg-brand-grey py-12">
      <div className="container-page">
        <SignupForm />
      </div>
    </section>
  );
}
