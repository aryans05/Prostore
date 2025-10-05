import { z } from "zod";
import {
  insertProductSchema,
  insertCartSchema,
  cartItemSchema,
  shippingAddressSchema,
  insertOrderItemSchema,
  insertOrderSchema,
} from "@/lib/validators";

// ✅ Product type
export type Product = z.infer<typeof insertProductSchema> & {
  id: string;
  rating: number; // ensure numeric
  createdAt: Date;
};

// ✅ Cart type
export type Cart = z.infer<typeof insertCartSchema> & {
  id: string;
  createdAt: string | Date; // allow Date or serialized string
};

// ✅ CartItem type (Prisma uses "quantity")
export type CartItem = z.infer<typeof cartItemSchema> & {
  id?: string; // optional DB id for frontend
  cartId?: string;
};

// ✅ Shipping Address type
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;

// ✅ OrderItem type (Prisma uses "qty")
export type OrderItem = z.infer<typeof insertOrderItemSchema> & {
  id?: string;
  orderId?: string;
  productId?: string;
};

// ✅ Order type (aligned with Prisma + utils.convertToPlainObject)
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

  // ✅ Serialized JSON field
  shippingAddress: ShippingAddress;

  // ✅ Price fields (Decimal → number after convertToPlainObject)
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};
