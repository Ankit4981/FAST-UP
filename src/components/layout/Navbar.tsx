"use client";

import {
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  UserRound,
  X
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { useCartStore } from "@/store/cartStore";

const navItems = [
  {
    label: "Sports",
    href: "/products?category=Sports+Nutrition",
    children: ["Hydration", "Recovery", "BCAA", "Endurance"]
  },
  {
    label: "Daily",
    href: "/products?category=Daily+Nutrition",
    children: ["Multivitamin", "Immunity", "Wellness"]
  },
  {
    label: "Women",
    href: "/products?category=Women%27s+Nutrition",
    children: ["Beauty", "Collagen", "Daily Care"]
  },
  {
    label: "Protein",
    href: "/products?category=Plant+Power",
    children: ["Protein", "Vegan", "Muscle"]
  },
  {
    label: "Bundles",
    href: "/products?category=Bundles",
    children: ["Race Day", "Value Packs", "Starter Kits"]
  }
];

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const items = useCartStore((state) => state.items);

  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/products?search=${encodeURIComponent(trimmed)}` : "/products");
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-brand-black focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <div className="hidden overflow-hidden bg-brand-black py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white sm:block">
        <div className="flex w-max animate-[marquee_28s_linear_infinite] gap-12 whitespace-nowrap px-4 motion-reduce:animate-none">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="flex gap-12">
              <span>
                Free shipping above <strong className="text-brand-orange">INR 599</strong>
              </span>
              <span>
                Swiss effervescent technology <strong className="text-brand-orange">for active days</strong>
              </span>
              <span>
                Fuel your fit with <strong className="text-brand-orange">AI recommendations</strong>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-3">
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          className="btn-icon lg:hidden"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <Link
          href="/"
          className="shrink-0 font-display text-3xl font-black uppercase tracking-normal text-brand-black sm:text-4xl"
          aria-label="Fast and Up home"
        >
          Fast<span className="text-brand-orange">&</span>Up
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="hidden h-10 min-w-0 flex-1 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50 transition focus-within:border-brand-orange focus-within:bg-white md:flex"
        >
          <label htmlFor="site-search" className="sr-label">
            Search products
          </label>
          <input
            id="site-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
            placeholder="Search products or goals"
          />
          <button
            aria-label="Search"
            className="btn-icon m-0 rounded-none bg-brand-orange text-white hover:bg-brand-orangeDark hover:text-white"
          >
            <Search size={18} />
          </button>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            href={session ? "/dashboard" : "/login"}
            className="btn-ghost hidden sm:flex"
            aria-label={session ? "Open dashboard" : "Login"}
          >
            <UserRound size={22} />
            <span className="hidden lg:inline">
              {status === "loading" ? "Account" : session ? "Dashboard" : "Login"}
            </span>
          </Link>
          {session ? (
            <button
              className="btn-ghost hidden lg:flex"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Logout
            </button>
          ) : null}
          <Link
            href="/cart"
            className="btn-ghost relative px-2 sm:px-3"
            aria-label={`Cart with ${cartCount} items`}
          >
            <ShoppingCart size={24} />
            <span className="hidden text-sm font-bold sm:inline">Cart</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-black text-white ring-2 ring-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <nav className="hidden border-t border-neutral-100 bg-white lg:block" aria-label="Primary navigation">
        <div className="container-page flex items-center justify-between">
          <div className="flex items-center">
            {navItems.map((item) => (
              <div key={item.label} className="group relative">
                <Link
                  href={item.href}
                  className={`flex h-12 items-center gap-1 px-3 text-sm font-bold transition ${
                    pathname === "/products"
                      ? "text-brand-black hover:text-brand-orange"
                      : "text-neutral-700 hover:text-brand-orange"
                  }`}
                >
                  {item.label}
                  <ChevronDown size={15} className="transition group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-20 min-w-60 translate-y-2 rounded-lg border border-neutral-200 bg-white py-2 opacity-0 shadow-lift transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      key={child}
                      href={`/products?search=${encodeURIComponent(child)}`}
                      className="block px-4 py-2.5 text-sm font-semibold text-neutral-700 transition hover:bg-brand-grey hover:text-brand-orange"
                    >
                      {child}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="btn-primary h-8"
          >
            Shop all
          </Link>
        </div>
      </nav>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="border-t border-neutral-200 bg-white p-4 shadow-lift lg:hidden"
        >
          <form
            onSubmit={handleSearch}
            role="search"
            className="mb-4 flex h-10 overflow-hidden rounded-md border border-neutral-200 bg-neutral-50"
          >
            <label htmlFor="mobile-search" className="sr-label">
              Search products
            </label>
            <input
              id="mobile-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              placeholder="Search products..."
            />
            <button className="btn-icon rounded-none bg-brand-orange text-white hover:bg-brand-orangeDark hover:text-white" aria-label="Search">
              <Search className="mx-auto" size={18} />
            </button>
          </form>
          <div className="grid gap-2" aria-label="Mobile navigation links">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md bg-neutral-50 px-4 py-3 text-sm font-bold text-brand-black transition hover:bg-neutral-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="btn-primary justify-start"
            >
              Shop all products
            </Link>
            <Link
              href={session ? "/dashboard" : "/login"}
              onClick={() => setMobileOpen(false)}
              className="btn-secondary justify-start border-brand-black bg-brand-black text-white hover:border-brand-black hover:text-white"
            >
              {session ? "Dashboard" : "Login / Signup"}
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
