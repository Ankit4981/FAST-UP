import { CheckCircle2, Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { ProductDetailActions } from "@/components/products/ProductDetailActions";
import { ProductCard } from "@/components/products/ProductCard";
import { getProductById, getProducts, getRelatedProducts } from "@/lib/catalog";
import { formatPrice, getDiscount } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts({ limit: 100 });
  return products.map((product) => ({ id: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product not found"
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images
    }
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);
  const discount = getDiscount(product.price, product.mrp);

  return (
    <section className="bg-brand-grey py-8 sm:py-12">
      <div className="container-page">
        <div className="grid gap-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[0.9fr_1fr] lg:p-8">
          <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-lg bg-neutral-100">
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(circle at 50% 40%, ${product.imageAccent}, transparent 58%)`
              }}
            />
            <Image
              src={product.images[0]}
              alt={product.name}
              width={620}
              height={620}
              priority
              className="relative h-full max-h-[560px] w-full object-contain p-6"
            />
          </div>

          <div className="py-2">
            <p className="compact-label">{product.category}</p>
            <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-brand-black sm:text-6xl">
              {product.name}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={index < Math.round(product.rating) ? "fill-current" : "text-neutral-300"}
                  />
                ))}
                <span className="ml-1 text-sm font-bold text-neutral-500">
                  {product.rating} ({product.reviewCount.toLocaleString("en-IN")} reviews)
                </span>
              </div>
              {product.badge ? (
                <span className="rounded bg-brand-orange px-3 py-1 text-xs font-black uppercase text-white">
                  {product.badge}
                </span>
              ) : null}
            </div>

            <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-600">{product.longDescription}</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="font-display text-5xl font-black text-brand-black">
                {formatPrice(product.price)}
              </span>
              <span className="pb-2 text-lg font-semibold text-neutral-400 line-through">
                {formatPrice(product.mrp)}
              </span>
              {discount > 0 ? (
                <span className="mb-2 rounded bg-brand-green px-2 py-1 text-xs font-black uppercase text-white">
                  {discount}% off
                </span>
              ) : null}
            </div>

            <div className="mt-6">
              <p className="compact-label mb-2">Flavours</p>
              <div className="flex flex-wrap gap-2">
                {product.flavours.map((flavour) => (
                  <span
                    key={flavour.name}
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-3 py-1.5 text-sm font-bold text-neutral-700"
                  >
                    <span
                      className="h-4 w-4 rounded-full border border-neutral-200"
                      style={{ backgroundColor: flavour.color }}
                    />
                    {flavour.name}
                  </span>
                ))}
              </div>
            </div>

            <ProductDetailActions product={product} />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {product.nutrition.map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-md bg-brand-grey px-3 py-2 text-sm font-bold text-neutral-700">
                  <CheckCircle2 size={18} className="text-brand-green" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-lg bg-brand-grey p-4">
              <p className="compact-label">How to use</p>
              <p className="mt-1 text-sm leading-6 text-neutral-600">{product.howToUse}</p>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="font-display text-4xl font-black uppercase text-brand-black">
            Related <span className="text-brand-orange">Products</span>
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
