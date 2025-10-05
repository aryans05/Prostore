"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { round2 } from "../utils";

/**
 * Convert number -> Prisma.Decimal
 */
const toDecimal = (num: number) => new Prisma.Decimal(num);

/**
 * DTO: Safe product returned to frontend
 */
export type SafeProduct = {
  id: string;
  name: string;
  slug: string;
  category: string;
  images: string[];
  brand: string;
  description: string;
  stock: number;
  price: number;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  banner: string | null;
  createdAt: Date;
};

/**
 * DTO: Safe cart returned to frontend
 */
export type SafeCart = {
  id: string;
  userId: string | null;
  sessionCartId: string | null;
  createdAt: Date;
  itemsPrice: number;
  totalPrice: number;
  shippingPrice: number;
  taxPrice: number;
  items: {
    id: string;
    cartId: string;
    productId: string;
    quantity: number;
    price: number;
    createdAt: Date;
    updatedAt: Date;
    product: SafeProduct;
  }[];
};

/**
 * Input type for adding/updating cart items
 */
export type CartAddItemInput = {
  productId: string;
  quantity?: number;
  price?: number;
};

/**
 * Normalize input item
 */
function normalizeCartItem(item: CartAddItemInput) {
  if (!item.productId) {
    throw new Error("Cart item must have a productId");
  }
  return {
    productId: item.productId,
    quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
    price: item.price ? Number(item.price) : 0,
  };
}

/**
 * Calculate totals safely
 */
const calcPrice = (items: { price: number; quantity: number }[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  );
  const shippingPrice = round2(itemsPrice > 100 ? 0 : 100);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);
  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

/**
 * Get or create a cart for user/guest
 */
async function getOrCreateCart(
  userId: string | null,
  sessionCartId?: string | null
) {
  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : sessionCartId ? { sessionCartId } : undefined,
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    const newSessionCartId = sessionCartId ?? crypto.randomUUID();

    if (!userId) {
      const cookieStore = await cookies();
      cookieStore.set("sessionCartId", newSessionCartId, {
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }

    cart = await prisma.cart.create({
      data: {
        userId,
        sessionCartId: newSessionCartId,
        itemsPrice: toDecimal(0),
        totalPrice: toDecimal(0),
        shippingPrice: toDecimal(0),
        taxPrice: toDecimal(0),
      },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

/**
 * ✅ Add or update items in the cart
 */
export async function addItemToCart(
  data: CartAddItemInput | CartAddItemInput[]
): Promise<{ success: boolean; message: string }> {
  try {
    const items = Array.isArray(data) ? data : [data];
    const session = await auth();
    const userId = (session?.user as any)?.id ?? null;

    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value || null;

    if (!sessionCartId && !userId) throw new Error("No cart identifier found");

    const cart = await getOrCreateCart(userId, sessionCartId);

    for (const rawItem of items) {
      const item = normalizeCartItem(rawItem);

      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.productId },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + item.quantity },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity,
            price: toDecimal(item.price),
          },
        });
      }
    }

    // recalc totals
    const updatedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });

    const totals = calcPrice(
      updatedItems.map((i) => ({
        price: Number(i.price ?? 0),
        quantity: i.quantity ?? 1,
      }))
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        itemsPrice: toDecimal(totals.itemsPrice),
        totalPrice: toDecimal(totals.totalPrice),
        shippingPrice: toDecimal(totals.shippingPrice),
        taxPrice: toDecimal(totals.taxPrice),
      },
    });

    return { success: true, message: "Cart updated successfully" };
  } catch (err: any) {
    console.error("❌ Failed to add item(s) to cart:", err);
    return { success: false, message: err.message ?? "Something went wrong" };
  }
}

/**
 * ✅ Remove item
 */
export async function removeItemFromCart(
  productId: string
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id ?? null;

    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value || null;

    if (!sessionCartId && !userId) throw new Error("No cart identifier found");

    const cart = await getOrCreateCart(userId, sessionCartId);

    await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });

    const updatedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });

    const totals = calcPrice(
      updatedItems.map((i) => ({
        price: Number(i.price ?? 0),
        quantity: i.quantity ?? 1,
      }))
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        itemsPrice: toDecimal(totals.itemsPrice),
        totalPrice: toDecimal(totals.totalPrice),
        shippingPrice: toDecimal(totals.shippingPrice),
        taxPrice: toDecimal(totals.taxPrice),
      },
    });

    return { success: true, message: "Item removed successfully" };
  } catch (err: any) {
    console.error("❌ Failed to remove item from cart:", err);
    return { success: false, message: err.message ?? "Something went wrong" };
  }
}

/**
 * ✅ Get cart (Safe DTO)
 */
export async function getMyCart(): Promise<SafeCart | null> {
  try {
    const session = await auth();
    const userId = (session?.user as any)?.id ?? null;

    const cookieStore = await cookies();
    const sessionCartId = cookieStore.get("sessionCartId")?.value || null;

    if (!sessionCartId && !userId) return null;

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionCartId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) return null;

    return {
      id: cart.id,
      userId: cart.userId,
      sessionCartId: cart.sessionCartId,
      createdAt: cart.createdAt,
      itemsPrice: Number(cart.itemsPrice ?? 0),
      totalPrice: Number(cart.totalPrice ?? 0),
      shippingPrice: Number(cart.shippingPrice ?? 0),
      taxPrice: Number(cart.taxPrice ?? 0),
      items: cart.items.map((i) => ({
        id: i.id,
        cartId: i.cartId,
        productId: i.productId,
        quantity: i.quantity,
        price: Number(i.price ?? 0),
        createdAt: i.createdAt,
        updatedAt: i.updatedAt,
        product: {
          ...i.product,
          price: Number(i.product.price ?? 0),
          rating: Number(i.product.rating ?? 0),
        },
      })),
    };
  } catch (err: any) {
    console.error("❌ Failed to fetch cart:", err);
    return null;
  }
}
