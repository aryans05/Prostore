"use client";

import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";
import {
  approvePayPalOrder,
  createPayPalOrder,
} from "@/lib/actions/order.action";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Order, ShippingAddress } from "@/types";

/* ===========================================================
   ✅ Props
   =========================================================== */
interface OrderDetailsProps {
  order: Order;
  paypalClientId: string;
}

/* ===========================================================
   ✅ PayPalSection (hook used *inside* provider)
   =========================================================== */
function PayPalSection({
  order,
  paypalClientId,
}: {
  order: Order;
  paypalClientId: string;
}) {
  const { toast } = useToast();
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  // Loading state
  function PrintLoadingState() {
    if (isPending) return <p className="text-gray-500">Loading PayPal...</p>;
    if (isRejected)
      return <p className="text-red-500">Error loading PayPal Buttons</p>;
    return null;
  }

  // Create PayPal order
  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) {
      toast({
        description: res.message,
        variant: "destructive",
      });
      throw new Error(res.message);
    }
    return res.data;
  };

  // Approve PayPal order
  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    toast({
      description: res.message,
      variant: res.success ? "default" : "destructive",
    });
  };

  return (
    <>
      <PrintLoadingState />
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
        createOrder={handleCreatePayPalOrder}
        onApprove={handleApprovePayPalOrder}
      />
    </>
  );
}

/* ===========================================================
   ✅ Main Component
   =========================================================== */
const OrderDetailsTable = ({ order, paypalClientId }: OrderDetailsProps) => {
  const { items, shippingAddress, isPaid, isDelivered } = order;

  // ✅ Support both new (fullName/streetAddress) and old (name/address) schema
  const { fullName, streetAddress, name, address, city, postalCode, country } =
    shippingAddress as ShippingAddress & {
      name?: string;
      address?: string;
      fullName?: string;
      streetAddress?: string;
    };

  const displayName = fullName ?? name ?? "N/A";
  const displayAddress = streetAddress ?? address ?? "N/A";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-6">
        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Order #{order.id.slice(-6)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Payment Method */}
            <div>
              <h3 className="font-semibold text-gray-700">Payment Method</h3>
              <p>{order.paymentMethod}</p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                  order.isPaid
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {order.isPaid ? "Paid" : "Not paid"}
              </span>
            </div>

            {/* Shipping */}
            <div>
              <h3 className="font-semibold text-gray-700">Shipping Address</h3>
              <p>
                {displayName}
                <br />
                {displayAddress}, {city} {postalCode}, {country}
              </p>
              <span
                className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                  isDelivered
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {isDelivered ? "Delivered" : "Not Delivered"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm border-t">
              <thead className="text-left border-b">
                <tr>
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Quantity</th>
                  <th className="py-2 text-right">Price</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={`${item.orderId}-${item.productId}`}
                    className="border-b last:border-none hover:bg-gray-50"
                  >
                    <td className="flex items-center gap-3 py-2">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="rounded-md border bg-white"
                      />
                      <span>{item.name}</span>
                    </td>
                    <td className="text-center">{item.qty}</td>
                    <td className="text-right">
                      ${Number(item.price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* RIGHT SIDE */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between py-1 text-sm">
              <span>Items</span>
              <span>${Number(order.itemsPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Tax</span>
              <span>${Number(order.taxPrice).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm">
              <span>Shipping</span>
              <span>${Number(order.shippingPrice).toFixed(2)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>${Number(order.totalPrice).toFixed(2)}</span>
            </div>

            {/* ✅ Wrap PayPalSection inside the Provider */}
            {!isPaid && order.paymentMethod === "PayPal" && (
              <div className="mt-4">
                <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                  <PayPalSection
                    order={order}
                    paypalClientId={paypalClientId}
                  />
                </PayPalScriptProvider>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetailsTable;
