import { NextResponse } from "next/server";

import { getProductFacets, getProducts, getProductsCount } from "@/lib/catalog";
import type { ProductQuery } from "@/types";

function toNumber(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseTags(params: URLSearchParams) {
  return params
    .getAll("tags")
    .flatMap((tag) => tag.split(","))
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sortParam = searchParams.get("sort") as ProductQuery["sort"] | null;
  const page = Math.max(1, toNumber(searchParams.get("page")) ?? 1);
  const pageSize = Math.min(48, Math.max(1, toNumber(searchParams.get("pageSize")) ?? 12));

  const baseQuery: ProductQuery = {
    category: searchParams.get("category") ?? undefined,
    tags: parseTags(searchParams),
    minPrice: toNumber(searchParams.get("minPrice")),
    maxPrice: toNumber(searchParams.get("maxPrice")),
    search: searchParams.get("search") ?? undefined,
    sort: sortParam ?? undefined
  };

  const countQuery: ProductQuery = {
    category: baseQuery.category,
    tags: baseQuery.tags,
    minPrice: baseQuery.minPrice,
    maxPrice: baseQuery.maxPrice,
    search: baseQuery.search
  };

  const [facets, total] = await Promise.all([getProductFacets(), getProductsCount(countQuery)]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const query: ProductQuery = {
    ...baseQuery,
    limit: pageSize,
    offset: (safePage - 1) * pageSize
  };

  const products = await getProducts(query);

  return NextResponse.json({
    products,
    facets,
    count: products.length,
    total,
    page: safePage,
    pageSize,
    totalPages
  });
}
