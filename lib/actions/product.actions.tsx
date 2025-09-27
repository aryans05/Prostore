// lib/actions/product.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { convertToPlainObject } from "../utils";

// Get the latest 10 products
export async function getLatestProducts() {
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

    return convertToPlainObject(
      products.map((p) => ({
        ...p,
        price: Number(p.price), // Convert Prisma.Decimal → number
      }))
    );
  } catch (error) {
    console.error("Failed to fetch latest products:", error);
    return [];
  }
}

// Get a single product by its slug
export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug },
    });

    if (!product) return null;

    return convertToPlainObject({
      ...product,
      price: Number(product.price), // Convert price to number
    });
  } catch (error) {
    console.error(`Failed to fetch product with slug "${slug}":`, error);
    return null;
  }
}
