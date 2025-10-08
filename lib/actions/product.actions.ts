"use server";

import { prisma } from "@/lib/prisma";
import { convertToPlainObject } from "@/lib/utils";
import type { Product } from "@/types";

/* ============================================================
   📦 Define a lightweight product type for homepage listings
   ============================================================ */
export type BasicProduct = Pick<Product, "slug" | "name" | "price" | "images">;

/* ============================================================
   🧩 Helper: Safely convert Prisma.Decimal → number
   ============================================================ */
function toPlainNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof (value as any).toNumber === "function") {
    return (value as any).toNumber();
  }
  return Number(value);
}

/* ============================================================
   🛍️ GET LATEST PRODUCTS (Lightweight for homepage listings)
   ============================================================ */
export async function getLatestProducts(): Promise<BasicProduct[]> {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        slug: true,
        name: true,
        price: true,
        images: true,
      },
    });

    // ✅ Convert Prisma.Decimal → number (safe for Next.js)
    const formatted: BasicProduct[] = products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: toPlainNumber(p.price),
      images: p.images,
    }));

    return convertToPlainObject(formatted);
  } catch (error) {
    console.error("❌ Failed to fetch latest products:", error);
    return [];
  }
}

/* ============================================================
   📦 GET SINGLE PRODUCT BY SLUG (Detailed for product page)
   ============================================================ */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
    });

    if (!product) return null;

    // ✅ Convert Prisma.Decimal → number (and handle nullable fields)
    const formatted: Product = {
      ...product,
      price: toPlainNumber(product.price),
      rating: Number(product.rating ?? 0),
      numReviews: Number(product.numReviews ?? 0),
    };

    // ✅ Convert for safe serialization in Next.js Server Actions
    return convertToPlainObject(formatted);
  } catch (error) {
    console.error(`❌ Failed to fetch product with slug "${slug}":`, error);
    return null;
  }
}
