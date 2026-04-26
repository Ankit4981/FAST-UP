import { seedProducts } from "@/data/seed";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db";
import { ProductModel } from "@/models/Product";
import type { Product, ProductQuery } from "@/types";
import type { SortOrder } from "mongoose";

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 120;

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeProduct(raw: Partial<Product> & Record<string, unknown>): Product {
  return {
    id: String(raw.id),
    slug: String(raw.slug),
    name: String(raw.name),
    price: Number(raw.price),
    mrp: Number(raw.mrp),
    description: String(raw.description),
    longDescription: String(raw.longDescription),
    images: (raw.images ?? []) as string[],
    category: raw.category as Product["category"],
    rating: Number(raw.rating),
    reviewCount: Number(raw.reviewCount),
    tags: (raw.tags ?? []) as string[],
    goalTags: (raw.goalTags ?? []) as string[],
    flavours: (raw.flavours ?? []) as Product["flavours"],
    badge: raw.badge ? String(raw.badge) : undefined,
    nutrition: (raw.nutrition ?? []) as string[],
    howToUse: String(raw.howToUse),
    stock: Number(raw.stock),
    featured: Boolean(raw.featured),
    imageAccent: String(raw.imageAccent)
  };
}

async function ensureProductsSeeded() {
  if (!isDatabaseConfigured()) {
    return;
  }

  await connectToDatabase();
  const count = await ProductModel.countDocuments();

  if (count === 0) {
    await ProductModel.insertMany(seedProducts);
  }
}

function normalizeLimit(limit?: number) {
  const parsed = Number(limit);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.floor(parsed), MAX_LIMIT);
}

function normalizeOffset(offset?: number) {
  const parsed = Number(offset);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return Math.floor(parsed);
}

function applyMemoryFilters(products: Product[], query: ProductQuery) {
  let result = [...products];

  if (query.search) {
    const search = query.search.toLowerCase();
    result = result.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        product.category,
        ...product.tags,
        ...product.goalTags
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (query.category) {
    result = result.filter((product) => product.category === query.category);
  }

  if (query.tags?.length) {
    result = result.filter((product) =>
      query.tags?.every((tag) => product.tags.includes(tag) || product.goalTags.includes(tag))
    );
  }

  if (typeof query.minPrice === "number") {
    result = result.filter((product) => product.price >= Number(query.minPrice));
  }

  if (typeof query.maxPrice === "number") {
    result = result.filter((product) => product.price <= Number(query.maxPrice));
  }

  return result;
}

function sortProducts(products: Product[], sort?: ProductQuery["sort"]) {
  const result = [...products];

  switch (sort) {
    case "price-asc":
      result.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      result.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      result.sort((a, b) => b.rating - a.rating);
      break;
    case "newest":
      result.reverse();
      break;
    default:
      result.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }

  return result;
}

function paginateProducts(products: Product[], query: ProductQuery) {
  const limit = normalizeLimit(query.limit);
  const offset = normalizeOffset(query.offset);

  return products.slice(offset, offset + limit);
}

function buildMongoFilter(query: ProductQuery) {
  const filter: Record<string, unknown> = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.tags?.length) {
    filter.$and = query.tags.map((tag) => ({
      $or: [{ tags: tag }, { goalTags: tag }]
    }));
  }

  if (typeof query.minPrice === "number" || typeof query.maxPrice === "number") {
    const price: Record<string, number> = {};
    if (typeof query.minPrice === "number") {
      price.$gte = query.minPrice;
    }
    if (typeof query.maxPrice === "number") {
      price.$lte = query.maxPrice;
    }
    filter.price = price;
  }

  if (query.search) {
    const regex = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [
      { name: regex },
      { description: regex },
      { category: regex },
      { tags: regex },
      { goalTags: regex }
    ];
  }

  return filter;
}

function applyMemorySortAndPagination(products: Product[], query: ProductQuery) {
  const sorted = sortProducts(products, query.sort);
  return paginateProducts(sorted, query);
}

function getMongoSort(sort?: ProductQuery["sort"]): Record<string, SortOrder> {
  switch (sort) {
    case "price-asc":
      return { price: 1 };
    case "price-desc":
      return { price: -1 };
    case "rating-desc":
      return { rating: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { featured: -1, rating: -1 };
  }
}

export async function getProducts(query: ProductQuery = {}) {
  if (!isDatabaseConfigured()) {
    const filtered = applyMemoryFilters(seedProducts, query);
    return applyMemorySortAndPagination(filtered, query);
  }

  await ensureProductsSeeded();

  const filter = buildMongoFilter(query);
  const limit = normalizeLimit(query.limit);
  const offset = normalizeOffset(query.offset);

  const products = await ProductModel.find(filter)
    .sort(getMongoSort(query.sort))
    .skip(offset)
    .limit(limit)
    .lean();

  return products.map((product) =>
    serializeProduct(product as Partial<Product> & Record<string, unknown>)
  );
}

export async function getProductsCount(query: ProductQuery = {}) {
  if (!isDatabaseConfigured()) {
    return applyMemoryFilters(seedProducts, query).length;
  }

  await ensureProductsSeeded();
  const filter = buildMongoFilter(query);
  return ProductModel.countDocuments(filter);
}

export async function getProductById(idOrSlug: string) {
  if (!isDatabaseConfigured()) {
    return seedProducts.find((product) => product.id === idOrSlug || product.slug === idOrSlug) ?? null;
  }

  await ensureProductsSeeded();
  const product = await ProductModel.findOne({
    $or: [{ id: idOrSlug }, { slug: idOrSlug }]
  }).lean();

  return product
    ? serializeProduct(product as Partial<Product> & Record<string, unknown>)
    : null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const products = await getProducts({
    category: product.category,
    limit: limit + 1,
    sort: "rating-desc"
  });

  return products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getProductFacets() {
  const products = await getProducts({ limit: 500 });

  return {
    categories: Array.from(new Set(products.map((product) => product.category))).sort(),
    tags: Array.from(new Set(products.flatMap((product) => product.tags))).sort()
  };
}
