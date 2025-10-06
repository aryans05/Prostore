"use server";

import { prisma } from "@/db/prisma";
import { convertToPlainObject } from "@/lib/utils";
import type { Product } from "@/types";

/* ============================================================
   📦 Define a lightweight product type for homepage listings
   ============================================================ */
export type BasicProduct = Pick<Product, "slug" | "name" | "price" | "images">;

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

    // 🧠 Convert Prisma.Decimal → string (to match your `Product.price: string`)
    const formatted = products.map((p) => ({
      ...p,
      price: String(p.price),
    }));

    return convertToPlainObject(formatted) as BasicProduct[];
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

    // ✅ Convert Prisma.Decimal → string to match your type
    const formatted = {
      ...product,
      price: String(product.price),
      rating: Number(product.rating ?? 0),
      numReviews: Number(product.numReviews ?? 0),
    };

    // ✅ Convert and return as Product
    return convertToPlainObject(formatted) as unknown as Product;
  } catch (error) {
    console.error(`❌ Failed to fetch product with slug "${slug}":`, error);
    return null;
  }
}
