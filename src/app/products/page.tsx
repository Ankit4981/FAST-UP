import type { Metadata } from "next";
import { Suspense } from "react";

import { ProductListing } from "@/components/products/ProductListing";
import { getProductFacets } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse sports nutrition products with filtering, sorting and dynamic API-backed data."
};

export default async function ProductsPage() {
  const facets = await getProductFacets();

  return (
    <Suspense fallback={<div className="container-page py-16">Loading catalogue...</div>}>
      <ProductListing initialFacets={facets} />
    </Suspense>
  );
}
