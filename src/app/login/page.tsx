import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your ecommerce account."
};

export default function LoginPage() {
  return (
    <section className="bg-brand-grey py-12">
      <div className="container-page">
        <LoginForm />
      </div>
    </section>
  );
}
