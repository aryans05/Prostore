import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { auth } from "@/auth";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyCart } from "@/lib/actions/cart.actions";
import { getUserById } from "@/lib/actions/user.action";
import { formatCurrency, round2 } from "@/lib/utils";
import { ShippingAddress } from "@/types";
import { createOrder } from "@/lib/actions/order.action";

export const metadata = {
  title: "Place Order",
};

const PlaceOrderPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  // ✅ redirect if not logged in
  if (!userId) redirect("/login");

  const cart = await getMyCart();
  const user = await getUserById(userId);

  // ✅ redirect if missing required info
  if (!cart || cart.items.length === 0) redirect("/cart");
  if (!user?.address) redirect("/shipping-address");
  if (!user?.paymentMethod) redirect("/payment-method");

  const userAddress = user.address as ShippingAddress;

  /**
   * ✅ Form server action:
   * create order → redirect to /order/[id]
   */
  async function handlePlaceOrder(): Promise<void> {
    "use server";

    const result = await createOrder();

    if (!result.success) {
      throw new Error(result.message || "Failed to place order");
    }

    // ✅ Redirect user to the new order details page
    // We'll add orderId to the return payload in createOrder()
    const orderId = result.order?.id;
    if (orderId) {
      redirect(`/order/${orderId}`);
    }

    throw new Error("Order created but no order ID returned");
  }

  return (
    <>
      <CheckoutSteps current={3} />
      <h1 className="py-4 text-2xl font-semibold">Place Order</h1>

      <div className="grid md:grid-cols-3 md:gap-5">
        {/* LEFT COLUMN */}
        <div className="overflow-x-auto md:col-span-2 space-y-4">
          {/* Shipping Address */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl font-semibold pb-4">Shipping Address</h2>
              <p>{userAddress.fullName}</p>
              <p>
                {userAddress.streetAddress}, {userAddress.city},{" "}
                {userAddress.postalCode}, {userAddress.country}
              </p>
              <div className="mt-3">
                <Link href="/shipping-address">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl font-semibold pb-4">Payment Method</h2>
              <p>{user.paymentMethod}</p>
              <div className="mt-3">
                <Link href="/payment-method">
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="p-4 gap-4">
              <h2 className="text-xl font-semibold pb-4">Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cart.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <Link
                          href={`/product/${item.product.slug}`}
                          className="flex items-center gap-3"
                        >
                          <Image
                            src={item.product.images[0]}
                            alt={item.product.name}
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                          <span>{item.product.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(round2(item.price ?? 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link href="/cart">
                <Button variant="outline">Edit</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex justify-between">
                <span>Items</span>
                <span>{formatCurrency(round2(cart.itemsPrice))}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(round2(cart.taxPrice))}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{formatCurrency(round2(cart.shippingPrice))}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatCurrency(round2(cart.totalPrice))}</span>
              </div>

              {/* ✅ Place Order Form */}
              <form action={handlePlaceOrder}>
                <Button className="w-full mt-4" type="submit">
                  Place Order
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PlaceOrderPage;
