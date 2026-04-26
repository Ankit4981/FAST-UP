"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { ProductCard } from "@/components/products/ProductCard";
import type { Product } from "@/types";

type Facets = {
  categories: string[];
  tags: string[];
};

type ApiResponse = {
  products: Product[];
  facets: Facets;
  count: number;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const priceRanges = [
  { label: "All prices", min: "", max: "" },
  { label: "Under INR 500", min: "", max: "500" },
  { label: "INR 500 - 999", min: "500", max: "999" },
  { label: "INR 1000+", min: "1000", max: "" }
];

function toPositiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function ProductListing({ initialFacets }: { initialFacets: Facets }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [data, setData] = useState<ApiResponse>({
    products: [],
    facets: initialFacets,
    count: 0,
    total: 0,
    page: 1,
    pageSize: 12,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") ?? "");

  const currentPageSize = Math.min(48, toPositiveInteger(searchParams.get("pageSize"), 12));
  const selectedTags = useMemo(() => searchParams.getAll("tags"), [searchParams]);
  const selectedCategory = searchParams.get("category") ?? "";
  const queryString = searchParams.toString();

  useEffect(() => {
    setSearchDraft(searchParams.get("search") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);

    fetch(`/api/products?${queryString}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((payload: ApiResponse) => setData(payload))
      .finally(() => setIsLoading(false))
      .catch(() => undefined);

    return () => controller.abort();
  }, [queryString]);

  function pushParams(
    mutate: (params: URLSearchParams) => void,
    options?: { keepPage?: boolean }
  ) {
    const params = new URLSearchParams(searchParams.toString());

    mutate(params);

    if (!options?.keepPage) {
      params.delete("page");
    }

    const nextQuery = params.toString();
    router.push(nextQuery ? `${pathname}?${nextQuery}` : pathname);
    setMobileFiltersOpen(false);
  }

  function updateParam(key: string, value?: string) {
    pushParams((params) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
  }

  function toggleTag(tag: string) {
    pushParams((params) => {
      const current = params.getAll("tags");
      params.delete("tags");
      const next = current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag];
      next.forEach((item) => params.append("tags", item));
    });
  }

  function applyPriceRange(value: string) {
    const range = priceRanges[Number(value)] ?? priceRanges[0];
    pushParams((params) => {
      if (range.min) {
        params.set("minPrice", range.min);
      } else {
        params.delete("minPrice");
      }
      if (range.max) {
        params.set("maxPrice", range.max);
      } else {
        params.delete("maxPrice");
      }
    });
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateParam("search", searchDraft.trim());
  }

  function clearFilters() {
    setMobileFiltersOpen(false);
    router.push(pathname);
  }

  function goToPage(page: number) {
    const safePage = Math.max(1, Math.min(page, data.totalPages));
    pushParams(
      (params) => {
        if (safePage <= 1) {
          params.delete("page");
        } else {
          params.set("page", String(safePage));
        }
        params.set("pageSize", String(currentPageSize));
      },
      { keepPage: true }
    );
  }

  const activePriceIndex = priceRanges.findIndex(
    (range) =>
      range.min === (searchParams.get("minPrice") ?? "") &&
      range.max === (searchParams.get("maxPrice") ?? "")
  );

  const filters = (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-black uppercase text-brand-black">Filters</h2>
        <button
          className="text-xs font-bold uppercase text-brand-orange"
          onClick={clearFilters}
          type="button"
        >
          Clear
        </button>
      </div>

      <form onSubmit={submitSearch}>
        <label className="compact-label mb-2 block">Search</label>
        <div className="flex gap-2">
          <input
            className="field"
            value={searchDraft}
            onChange={(event) => setSearchDraft(event.target.value)}
            placeholder="hydration, vegan..."
          />
          <button className="btn-primary px-4 py-2 text-sm">Go</button>
        </div>
      </form>

      <div>
        <label className="compact-label mb-2 block">Category</label>
        <select
          className="field"
          value={selectedCategory}
          onChange={(event) => updateParam("category", event.target.value)}
        >
          <option value="">All categories</option>
          {data.facets.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="compact-label mb-2 block">Price</label>
        <select
          className="field"
          value={activePriceIndex === -1 ? 0 : activePriceIndex}
          onChange={(event) => applyPriceRange(event.target.value)}
        >
          {priceRanges.map((range, index) => (
            <option key={range.label} value={index}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="compact-label mb-3 block">Tags</label>
        <div className="flex flex-wrap gap-2">
          {data.facets.tags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`rounded-full border px-3 py-1.5 text-xs font-bold uppercase transition ${
                  active
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-neutral-200 bg-white text-neutral-600 hover:border-brand-orange hover:text-brand-orange"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-brand-grey py-8 sm:py-12">
      <div className="container-page">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="compact-label">Dynamic catalogue</p>
            <h1 className="font-display text-5xl font-black uppercase leading-none text-brand-black">
              Shop <span className="text-brand-orange">Products</span>
            </h1>
            <p className="mt-2 text-sm font-medium text-neutral-500">
              API-backed filtering, sorting and product detail pages.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary px-4 py-2 lg:hidden"
              onClick={() => setMobileFiltersOpen(true)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </button>
            <select
              className="field min-w-52"
              value={searchParams.get("sort") ?? ""}
              onChange={(event) => updateParam("sort", event.target.value)}
            >
              <option value="">Featured</option>
              <option value="price-asc">Price low to high</option>
              <option value="price-desc">Price high to low</option>
              <option value="rating-desc">Top rated</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden rounded-lg border border-neutral-200 bg-white p-5 lg:block">
            {filters}
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between text-sm font-semibold text-neutral-500">
              <span>
                {isLoading
                  ? "Loading products..."
                  : data.total > 0
                    ? `${Math.max(1, (data.page - 1) * data.pageSize + 1)}-${(data.page - 1) * data.pageSize + data.count} of ${data.total} products`
                    : "0 products found"}
              </span>
            </div>
            {data.products.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {data.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 bg-white p-10 text-center">
                <h2 className="font-display text-3xl font-black uppercase text-brand-black">
                  No products found
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Try clearing filters or searching another goal.</p>
                <button className="btn-primary mt-5" onClick={clearFilters}>
                  Reset catalogue
                </button>
              </div>
            )}

            {data.totalPages > 1 ? (
              <div className="mt-8 flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToPage(data.page - 1)}
                  disabled={data.page <= 1 || isLoading}
                >
                  Previous
                </button>
                <p className="text-sm font-bold text-neutral-600">
                  Page {data.page} of {data.totalPages}
                </p>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => goToPage(data.page + 1)}
                  disabled={data.page >= data.totalPages || isLoading}
                >
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {mobileFiltersOpen ? (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden">
          <div className="ml-auto h-full w-[88vw] max-w-sm overflow-y-auto bg-white p-5 shadow-lift">
            <button
              className="mb-4 ml-auto flex h-10 w-10 items-center justify-center rounded-md bg-brand-grey"
              onClick={() => setMobileFiltersOpen(false)}
              aria-label="Close filters"
            >
              <X size={20} />
            </button>
            {filters}
          </div>
        </div>
      ) : null}
    </section>
  );
}
