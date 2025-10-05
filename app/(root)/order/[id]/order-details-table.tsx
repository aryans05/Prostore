"use client";

import React from "react";
import Link from "next/link";
import { Order } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

type Props = {
  order: Order;
};

export default function OrderDetailsTable({ order }: Props) {
  const created = formatDateTime(order.createdAt);
  const paid = order.paidAt ? formatDateTime(order.paidAt) : null;
  const delivered = order.deliveredAt
    ? formatDateTime(order.deliveredAt)
    : null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Order #{order.id}</h1>
        <p className="text-gray-500">
          Placed on <span className="font-medium">{created.dateOnly}</span>
        </p>
      </div>

      {/* Shipping + Payment */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="font-semibold text-lg mb-3">Shipping Address</h2>
          <div className="text-gray-700 space-y-1">
            <p>{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.streetAddress}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
          <div className="mt-4">
            {order.isDelivered ? (
              <p className="text-green-600 font-medium">
                Delivered on {delivered?.dateOnly}
              </p>
            ) : (
              <p className="text-yellow-600 font-medium">Not delivered yet</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 shadow rounded-2xl">
          <h2 className="font-semibold text-lg mb-3">Payment</h2>
          <p className="text-gray-700 mb-2">
            Method: <span className="font-medium">{order.paymentMethod}</span>
          </p>
          {order.isPaid ? (
            <p className="text-green-600 font-medium">
              Paid on {paid?.dateOnly}
            </p>
          ) : (
            <p className="text-yellow-600 font-medium">Not paid yet</p>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="bg-white shadow rounded-2xl p-6">
        <h2 className="font-semibold text-lg mb-4">Order Items</h2>
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left pb-2">Product</th>
              <th className="text-right pb-2">Qty</th>
              <th className="text-right pb-2">Price</th>
              <th className="text-right pb-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.productId} className="border-b last:border-none">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-md"
                    />
                    <Link
                      href={`/product/${item.slug}`}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </div>
                </td>
                <td className="text-right">{item.qty}</td>
                <td className="text-right">{formatCurrency(item.price)}</td>
                <td className="text-right">
                  {formatCurrency(item.price * item.qty)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-white shadow rounded-2xl p-6 md:w-1/2 ml-auto">
        <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
        <div className="space-y-2 text-gray-700">
          <div className="flex justify-between">
            <span>Items</span>
            <span>{formatCurrency(order.itemsPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>{formatCurrency(order.shippingPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>{formatCurrency(order.taxPrice)}</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>{formatCurrency(order.totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
