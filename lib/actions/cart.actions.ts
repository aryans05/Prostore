"use server";

import prisma from "@/lib/prisma";
import { CartItem as CartItemType } from "@/types";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { round2 } from "../utils";

/**
 * Calculate cart totals safely
 */
const calcPrice = (items: { price: any; quantity: number }[]) => {
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0)
  );

  const shippingPrice = round2(itemsPrice > 100 ? 0 : 100);
  const taxPrice = round2(0.15 * itemsPrice);
  const totalPrice = round2(itemsPrice + taxPrice + shippingPrice);

  return { itemsPrice, shippingPrice, taxPrice, totalPrice };
};

/**
 * Helper: Get or create a cart for the current user/guest
 */
async function getOrCreateCart(
  userId: string | null,
  sessionCartId?: string | null
) {
  let cart = await prisma.cart.findFirst({
    where: userId ? { userId } : sessionCartId ? { sessionCartId } : {}, // ✅ fallback to {}
    include: { items: { include: { product: true } } },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
        sessionCartId: sessionCartId ?? crypto.randomUUID(), // ✅ always set a sessionCartId
        itemsPrice: 0,
        totalPrice: 0,
        shippingPrice: 0,
        taxPrice: 0,
      },
      include: { items: { include: { product: true } } },
    });
  } else if (userId && !cart.userId) {
    // Attach guest cart to logged-in user
    cart = await prisma.cart.update({
      where: { id: cart.id },
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }

  return cart;
}

/**
 * ✅ Add or update items in the cart
 */
export async function addItemToCart(data: CartItemType | CartItemType[]) {
  try {
    const items = Array.isArray(data) ? data : [data];

    const session = await auth();
    const userId = (session?.user as any)?.id ?? null;

    const cookieStore = await cookies(); // ✅ must await cookies()
    const sessionCartId = cookieStore.get("sessionCartId")?.value || null;

    if (!sessionCartId && !userId) throw new Error("No cart identifier found");

    const cart = await getOrCreateCart(userId, sessionCartId);

    for (const item of items) {
      const existingItem = await prisma.cartItem.findFirst({
        where: { cartId: cart.id, productId: item.productId },
      });

      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + (item.quantity ?? 1) },
        });
      } else {
        await prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId: item.productId,
            quantity: item.quantity ?? 1,
            price: item.price ?? 0,
          },
        });
      }
    }

    const updatedItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
      include: { product: true },
    });

    const totals = calcPrice(updatedItems);

    await prisma.cart.update({ where: { id: cart.id }, data: totals });

    return { success: true, message: "Cart updated successfully" };
  } catch (error: any) {
    console.error("❌ Failed to add item(s) to cart:", error);
    return {
      success: false,
      message: error.message || "Failed to add item(s) to cart",
    };
  }
}

/**
 * ✅ Remove item from cart
 */
export async function removeItemFromCart(productId: string) {
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

    const totals = calcPrice(updatedItems);

    await prisma.cart.update({ where: { id: cart.id }, data: totals });

    return { success: true, message: "Item removed successfully" };
  } catch (error: any) {
    console.error("❌ Failed to remove item from cart:", error);
    return {
      success: false,
      message: error.message || "Failed to remove item from cart",
    };
  }
}

/**
 * ✅ Get current cart (user or guest)
 */
export async function getMyCart() {
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

    return cart;
  } catch (error: any) {
    console.error("❌ Failed to fetch cart:", error);
    return null;
  }
}
