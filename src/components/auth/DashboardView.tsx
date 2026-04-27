"use client";

import { Loader2, PackageCheck, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Order } from "@/types";
import { formatPrice, getInitials } from "@/lib/utils";
import { createProgressInsight, goalMeta, type SavedHealthSnapshot } from "@/lib/wellnessEngine";

const REPORT_STORAGE_KEY = "fastup-health-reports-v1";

export function DashboardView() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [healthReports, setHealthReports] = useState<SavedHealthSnapshot[]>([]);

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    setIsLoading(true);
    fetch("/api/orders")
      .then((response) => response.json())
      .then((payload) => setOrders(payload.orders ?? []))
      .finally(() => setIsLoading(false))
      .catch(() => setIsLoading(false));
  }, [status]);

  useEffect(() => {
    const raw = window.localStorage.getItem(REPORT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as SavedHealthSnapshot[];
      if (Array.isArray(parsed)) {
        setHealthReports(parsed);
      }
    } catch {
      setHealthReports([]);
    }
  }, []);

  const progress = useMemo(() => createProgressInsight(healthReports), [healthReports]);

  if (status === "loading") {
    return (
      <section className="bg-brand-grey py-12">
        <div className="container-page flex justify-center">
          <Loader2 className="animate-spin text-brand-orange" />
        </div>
      </section>
    );
  }

  if (!session?.user) {
    return (
      <section className="bg-brand-grey py-12">
        <div className="container-page">
          <div className="mx-auto max-w-xl rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
            <h1 className="font-display text-5xl font-black uppercase text-brand-black">
              Login Required
            </h1>
            <p className="mt-3 text-neutral-500">
              Sign in to see profile information, support-ready order data and tracking status.
            </p>
            <Link href="/login" className="btn-primary mt-6">
              Login
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-brand-grey py-8 sm:py-12">
      <div className="container-page">
        <div className="mb-6">
          <p className="compact-label">Account center</p>
          <h1 className="font-display text-5xl font-black uppercase leading-none text-brand-black">
            User <span className="text-brand-orange">Dashboard</span>
          </h1>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-orange font-display text-2xl font-black text-white">
                {getInitials(session.user.name)}
              </div>
              <div>
                <h2 className="font-display text-2xl font-black uppercase text-brand-black">
                  {session.user.name}
                </h2>
                <p className="text-sm text-neutral-500">{session.user.email}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-md bg-brand-grey p-4 text-sm">
              <div className="flex items-center gap-2 font-bold text-neutral-700">
                <UserRound size={18} className="text-brand-orange" />
                Profile synced through NextAuth session
              </div>
              <div className="flex items-center gap-2 font-bold text-neutral-700">
                <PackageCheck size={18} className="text-brand-orange" />
                Orders feed chatbot support context
              </div>
            </div>
          </aside>

          <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-black uppercase text-brand-black">Orders</h2>
              <Link href="/products" className="btn-secondary px-4 py-2 text-sm">
                Shop more
              </Link>
            </div>

            <div className="mt-5 rounded-lg border border-neutral-200 bg-brand-grey p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-2xl font-black uppercase text-brand-black">
                  Health Dashboard
                </h3>
                <Link href="/#smart-calculator" className="btn-secondary h-8 px-3 text-xs">
                  Update Plan
                </Link>
              </div>

              {healthReports.length > 0 ? (
                <>
                  <p className="mt-2 text-sm text-neutral-600">{progress.trend}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    <div className="rounded bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Score Delta
                      </p>
                      <p className="font-display text-3xl font-black text-brand-black">
                        {progress.scoreDelta >= 0 ? "+" : ""}
                        {progress.scoreDelta}
                      </p>
                    </div>
                    <div className="rounded bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                        Weight Delta
                      </p>
                      <p className="font-display text-3xl font-black text-brand-black">
                        {progress.weightDelta >= 0 ? "+" : ""}
                        {progress.weightDelta}
                      </p>
                    </div>
                    <div className="rounded bg-white p-3">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Latest Goal</p>
                      <p className="font-display text-2xl font-black text-brand-black">
                        {goalMeta[healthReports[0].goal].label}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-neutral-500">
                  No saved health reports yet. Run the Smart Health Calculator and save your first plan.
                </p>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-brand-orange" />
              </div>
            ) : orders.length > 0 ? (
              <div className="mt-5 grid gap-4">
                {orders.map((order) => (
                  <article key={order.id} className="rounded-lg border border-neutral-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="compact-label">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                        <h3 className="font-display text-2xl font-black uppercase text-brand-black">
                          {order.orderNumber}
                        </h3>
                      </div>
                      <span className="w-fit rounded bg-brand-grey px-3 py-1 text-xs font-black uppercase text-neutral-700">
                        {order.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-neutral-600">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.productId}`} className="flex justify-between">
                          <span>
                            {item.name} x{item.quantity}
                          </span>
                          <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between border-t border-neutral-200 pt-3 font-bold">
                      <span>Order total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-neutral-300 bg-brand-grey p-8 text-center">
                <h3 className="font-display text-3xl font-black uppercase text-brand-black">No orders yet</h3>
                <p className="mt-2 text-sm text-neutral-500">Place an order to unlock order-aware support in the chatbot.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
