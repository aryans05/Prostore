"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.action";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { formatError, convertToPlainObject } from "@/lib/utils";
import type { Order } from "@/types";

type CreateOrderResult =
  | { success: true; message: string; order: Order }
  | { success: false; message: string };

/**
 * Create an order from the current user's cart.
 */
export async function createOrder(): Promise<CreateOrderResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not authenticated");

    const user = await getUserById(session.user.id);
    if (!user) throw new Error("User not found");

    const cart = await getMyCart();
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

    if (!user.address) throw new Error("Shipping address is missing");
    if (!user.paymentMethod) throw new Error("Payment method is missing");

    // 🧮 Calculate prices
    const itemsPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = Number(
      (itemsPrice + shippingPrice + taxPrice).toFixed(2)
    );

    // ✅ Create order
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        shippingAddress: user.address,
        paymentMethod: user.paymentMethod,
        itemsPrice: new Decimal(itemsPrice),
        shippingPrice: new Decimal(shippingPrice),
        taxPrice: new Decimal(taxPrice),
        totalPrice: new Decimal(totalPrice),
        items: {
          create: cart.items.map((item) => ({
            name: item.product.name,
            slug: item.product.slug,
            qty: item.quantity,
            image: item.product.images[0],
            price: new Decimal(item.price ?? 0),
            productId: item.productId,
          })),
        },
      },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    // Clear the user's cart
    await prisma.cart.delete({ where: { id: cart.id } });

    // ✅ Convert Decimals → number, Dates → string
    const plainOrder = convertToPlainObject(order) as unknown as Order;

    return {
      success: true,
      message: "Order created successfully",
      order: plainOrder,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

/**
 * Fetch order by ID for the current user.
 */
export async function getOrderById(orderId: string): Promise<Order> {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not authenticated");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!order || order.userId !== session.user.id) {
      throw new Error("Order not found or unauthorized");
    }

    return convertToPlainObject(order) as unknown as Order;
  } catch (error) {
    throw new Error(formatError(error));
  }
}
