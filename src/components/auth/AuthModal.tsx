"use client";

import { X, Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { useAuthModal } from "./AuthModalContext";
import { useCartStore } from "@/store/cartStore";

type Tab = "login" | "signup";

export function AuthModal() {
  const { isOpen, closeModal, pendingAction, clearPendingAction } = useAuthModal();
  const addItem = useCartStore((state) => state.addItem);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");
  const [isSignupSubmitting, setIsSignupSubmitting] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setTab("login");
      setLoginError("");
      setSignupError("");
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeModal]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  function handleOverlayClick(e: React.MouseEvent) {
    if (e.target === overlayRef.current) closeModal();
  }

  function completePendingAction() {
    if (pendingAction?.type === "add_to_cart") {
      addItem(pendingAction.item);
    }
    clearPendingAction();
    closeModal();
  }

  async function submitLogin(e: FormEvent) {
    e.preventDefault();
    setIsLoginSubmitting(true);
    setLoginError("");

    const result = await signIn("credentials", {
      email: loginEmail,
      password: loginPassword,
      redirect: false,
    });

    setIsLoginSubmitting(false);

    if (result?.error) {
      setLoginError("Invalid email or password.");
      return;
    }

    completePendingAction();
  }

  async function submitSignup(e: FormEvent) {
    e.preventDefault();
    setIsSignupSubmitting(true);
    setSignupError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword }),
    });
    const payload = await response.json();

    if (!response.ok) {
      setIsSignupSubmitting(false);
      setSignupError(payload.message ?? "Unable to create account.");
      return;
    }

    await signIn("credentials", {
      email: signupEmail,
      password: signupPassword,
      redirect: false,
    });

    setIsSignupSubmitting(false);
    completePendingAction();
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Login to continue"
    >
      <div className="relative w-full max-w-md animate-modal-in rounded-2xl border border-neutral-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-neutral-100 p-6 pb-5">
          <button
            onClick={closeModal}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 transition hover:bg-neutral-200"
            aria-label="Close"
          >
            <X size={16} />
          </button>

          {pendingAction?.type === "add_to_cart" && (
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-brand-grey p-3">
              <span className="text-lg">🛒</span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Item waiting</p>
                <p className="text-sm font-bold text-brand-black">{pendingAction.item.name}</p>
              </div>
            </div>
          )}

          <h2 className="font-display text-4xl font-black uppercase text-brand-black">
            Login to continue
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Please log in to add items to your cart and continue.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100">
          <button
            onClick={() => setTab("login")}
            className={`flex-1 py-3 text-sm font-bold transition ${
              tab === "login"
                ? "border-b-2 border-brand-orange text-brand-orange"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setTab("signup")}
            className={`flex-1 py-3 text-sm font-bold transition ${
              tab === "signup"
                ? "border-b-2 border-brand-orange text-brand-orange"
                : "text-neutral-400 hover:text-neutral-700"
            }`}
          >
            Create account
          </button>
        </div>

        {/* Login form */}
        {tab === "login" && (
          <form onSubmit={submitLogin} className="p-6">
            <div className="grid gap-4">
              <div>
                <label htmlFor="modal-login-email" className="compact-label mb-2 block">
                  Email
                </label>
                <input
                  id="modal-login-email"
                  className="field"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="modal-login-password" className="compact-label mb-2 block">
                  Password
                </label>
                <input
                  id="modal-login-password"
                  className="field"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
            </div>

            {loginError && (
              <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">
                {loginError}
              </p>
            )}

            <button className="btn-primary mt-5 w-full" disabled={isLoginSubmitting}>
              {isLoginSubmitting && <Loader2 className="animate-spin" size={16} />}
              Login{pendingAction ? " & add to cart" : ""}
            </button>

            <p className="mt-4 text-center text-xs text-neutral-400">
              Demo account:{" "}
              <button
                type="button"
                className="font-semibold text-brand-orange underline"
                onClick={() => { setLoginEmail("demo@fastup.dev"); setLoginPassword("Demo@1234"); }}
              >
                Fill demo credentials
              </button>
            </p>
          </form>
        )}

        {/* Signup form */}
        {tab === "signup" && (
          <form onSubmit={submitSignup} className="p-6">
            <div className="grid gap-4">
              <div>
                <label htmlFor="modal-signup-name" className="compact-label mb-2 block">
                  Full name
                </label>
                <input
                  id="modal-signup-name"
                  className="field"
                  autoComplete="name"
                  required
                  placeholder="Full name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="modal-signup-email" className="compact-label mb-2 block">
                  Email
                </label>
                <input
                  id="modal-signup-email"
                  className="field"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="modal-signup-password" className="compact-label mb-2 block">
                  Password
                </label>
                <input
                  id="modal-signup-password"
                  className="field"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  placeholder="Minimum 8 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                />
              </div>
            </div>

            {signupError && (
              <p className="mt-4 rounded bg-red-50 p-3 text-sm font-semibold text-red-700">
                {signupError}
              </p>
            )}

            <button className="btn-primary mt-5 w-full" disabled={isSignupSubmitting}>
              {isSignupSubmitting && <Loader2 className="animate-spin" size={16} />}
              Create account{pendingAction ? " & add to cart" : ""}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
