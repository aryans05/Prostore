import { z } from "zod";
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderItemSchema,
  insertOrderSchema,
  paymentResultSchema,
} from "@/lib/validators";

/* ============================================================
   🧩 PRODUCT TYPES
   ============================================================ */

/**
 * ✅ Full Product type (used for product detail pages and admin)
 * Prisma.Decimal fields like `price` & `rating` are converted → number
 */
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  price: number; // Prisma.Decimal → number
  rating: number; // Prisma.Decimal → number
  numReviews: number;
  createdAt: Date;
  updatedAt?: Date;
};

/**
 * ✅ Lightweight product type for homepage listings and cards
 * Used when fetching with `select: { slug, name, price, images }`
 */
export type BasicProduct = {
  slug: string;
  name: string;
  price: number;
  images: string[];
};

/* ============================================================
   🛒 CART TYPES
   ============================================================ */

/**
 * ✅ Cart Type
 * Represents the full shopping cart structure, including prices.
 */
export type Cart = z.infer<typeof insertCartSchema> & {
  id: string;
  createdAt: string | Date; // ISO string or Date
};

/**
 * ✅ Cart Item Type
 * Represents each product in the cart.
 */
export type CartItem = z.infer<typeof cartItemSchema> & {
  id?: string; // optional DB ID for frontend usage
  cartId?: string;
};

/* ============================================================
   🚚 SHIPPING TYPES
   ============================================================ */

/**
 * ✅ Shipping Address Type
 * Matches the `shippingAddressSchema` used in checkout.
 */
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

/* ============================================================
   📦 ORDER TYPES
   ============================================================ */

/**
 * ✅ Order Item Type
 * Represents a single product within an order.
 */
export type OrderItem = z.infer<typeof insertOrderItemSchema> & {
  id?: string;
  orderId?: string;
  productId?: string;
};

/**
 * ✅ Order Type
 * Represents the full order including relationships and computed totals.
 */
export type Order = z.infer<typeof insertOrderSchema> & {
  id: string;
  createdAt: Date;
  isPaid: boolean;
  paidAt: Date | null;
  isDelivered: boolean;
  deliveredAt: Date | null;

  // ✅ Relations
  items: OrderItem[];
  user: { name: string; email: string } | null;

  // ✅ JSON shipping field
  shippingAddress: ShippingAddress;

  // ✅ Decimal fields converted → number
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

/* ============================================================
   💳 PAYMENT TYPES
   ============================================================ */

/**
 * ✅ Payment Result Type
 * Used for PayPal or Stripe payment results.
 */
export type PaymentResult = z.infer<typeof paymentResultSchema>;
