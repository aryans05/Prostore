// lib/actions/product.actions.ts
"use server";

import { prisma } from "@/lib/prisma";
import { convertToPlainObject } from "../utils";

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
        price: Number(p.price),
      }))
    );
  } catch (error) {
    console.error("Failed to fetch latest products:", error);
    return [];
  }
}

// Get Single Product by it,s slug

export async function getProductBySlug(slug: string) {
  return await prisma.product.findFirst({
    where: { slug: slug },
  });
}
