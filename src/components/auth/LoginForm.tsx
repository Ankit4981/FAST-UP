"use client";

import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@fastup.dev");
  const [password, setPassword] = useState("Demo@1234");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-sm">
      <p className="compact-label">Welcome back</p>
      <h1 className="mt-2 font-display text-5xl font-black uppercase text-brand-black">Login</h1>
      <p className="mt-2 text-sm text-neutral-500">Use the demo account or sign in with an account you create.</p>

      <div className="mt-6 grid gap-4">
        <input className="field" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
        <input className="field" type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
      </div>

      {error ? <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      <button className="btn-primary mt-6 w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
        Login
      </button>

      <p className="mt-5 text-center text-sm text-neutral-500">
        New here?{" "}
        <Link href="/signup" className="font-bold text-brand-orange">
          Create account
        </Link>
      </p>
    </form>
  );
}
