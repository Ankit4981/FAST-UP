import { NextResponse } from "next/server";

import { getProductFacets, getProducts } from "@/lib/catalog";
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

  const query: ProductQuery = {
    category: searchParams.get("category") ?? undefined,
    tags: parseTags(searchParams),
    minPrice: toNumber(searchParams.get("minPrice")),
    maxPrice: toNumber(searchParams.get("maxPrice")),
    search: searchParams.get("search") ?? undefined,
    sort: sortParam ?? undefined,
    limit: toNumber(searchParams.get("limit"))
  };

  const [products, facets] = await Promise.all([getProducts(query), getProductFacets()]);

  return NextResponse.json({
    products,
    facets,
    count: products.length
  });
}
