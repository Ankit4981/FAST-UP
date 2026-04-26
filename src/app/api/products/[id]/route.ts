import { NextResponse } from "next/server";

import { getProductById, getRelatedProducts } from "@/lib/catalog";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ message: "Product not found." }, { status: 404 });
  }

  const related = await getRelatedProducts(product);

  return NextResponse.json({
    product,
    related
  });
}
