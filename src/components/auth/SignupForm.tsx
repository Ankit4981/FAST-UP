"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextPath = searchParams.get("next");
  const redirectPath = nextPath?.startsWith("/") ? nextPath : "/dashboard";
  const loginHref = nextPath?.startsWith("/") ? `/login?next=${encodeURIComponent(nextPath)}` : "/login";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });
    const payload = await response.json();

    if (!response.ok) {
      setIsSubmitting(false);
      setError(payload.message ?? "Unable to create account.");
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsSubmitting(false);
    router.push(redirectPath);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="compact-label">Join the club</p>
      <h1 className="mt-2 font-display text-5xl font-black uppercase text-brand-black">Signup</h1>
      <p className="mt-2 text-sm text-neutral-500">Create an account to persist profile and order history in MongoDB.</p>

      <div className="mt-6 grid gap-4">
        <div>
          <label htmlFor="signup-name" className="compact-label mb-2 block">
            Full name
          </label>
          <input
            id="signup-name"
            className="field"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Full name"
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="compact-label mb-2 block">
            Email
          </label>
          <input
            id="signup-email"
            className="field"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="signup-password" className="compact-label mb-2 block">
            Password
          </label>
          <input
            id="signup-password"
            className="field"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>
      </div>

      {error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        Create account
      </button>

      <p className="mt-5 text-center text-sm text-neutral-500">
        Already registered?{" "}
        <Link href={loginHref} className="font-bold text-brand-orange">
          Login
        </Link>
      </p>
    </form>
  );
}
