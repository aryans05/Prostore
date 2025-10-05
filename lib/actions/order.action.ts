"use server";

import { auth } from "@/auth";
import { getMyCart } from "./cart.actions";
import { getUserById } from "./user.action";
import prisma from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { formatError, convertToPlainObject } from "@/lib/utils";
import type { Order, PaymentResult } from "@/types";
import { paypal } from "../paypal";
import { revalidatePath } from "next/cache";

/* =======================================================
   ✅ CREATE ORDER FROM CART
   ======================================================= */
type CreateOrderResult =
  | { success: true; message: string; order: Order }
  | { success: false; message: string };

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

    // 🧮 Calculate totals
    const itemsPrice = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * (item.quantity ?? 1),
      0
    );
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
    const totalPrice = Number(
      (itemsPrice + shippingPrice + taxPrice).toFixed(2)
    );

    // 🧾 Create order
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

    // 🧹 Clear cart
    await prisma.cart.delete({ where: { id: cart.id } });

    const plainOrder = convertToPlainObject(order) as unknown as Order;

    return {
      success: true,
      message: "Order created successfully",
      order: plainOrder,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* =======================================================
   ✅ GET ORDER BY ID
   ======================================================= */
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
    console.error("❌ getOrderById error:", error);
    throw new Error(formatError(error));
  }
}

/* =======================================================
   ✅ CREATE PAYPAL ORDER
   ======================================================= */
export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    // 🪙 Create PayPal order
    const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

    const paymentResult: PaymentResult = {
      id: paypalOrder.id,
      status: paypalOrder.status ?? "CREATED",
      email_address: "",
      pricePaid: order.totalPrice.toString(),
    };

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentResult },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "PayPal order created successfully",
      data: paypalOrder.id,
    };
  } catch (err) {
    console.error("❌ Error creating PayPal order:", err);
    return { success: false, message: formatError(err) };
  }
}

/* =======================================================
   ✅ APPROVE PAYPAL ORDER
   ======================================================= */
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new Error("Order not found");

    // 🔄 Capture PayPal payment
    const captureData = await paypal.capturePayment(data.orderID);

    if (!captureData || captureData.status !== "COMPLETED") {
      throw new Error("Error capturing PayPal payment");
    }

    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer?.email_address ?? "",
        pricePaid:
          captureData.purchase_units?.[0]?.payments?.captures?.[0]?.amount
            ?.value ?? "0",
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: "✅ Your order has been successfully paid by PayPal.",
    };
  } catch (err) {
    console.error("❌ Error approving PayPal order:", err);
    return { success: false, message: formatError(err) };
  }
}

/* =======================================================
   ✅ UPDATE ORDER TO PAID
   ======================================================= */
async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) throw new Error("Order not found");
  if (order.isPaid) throw new Error("Order is already marked as paid");

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } },
      });
    }

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  console.log(`✅ Order ${orderId} successfully marked as paid`);
}
