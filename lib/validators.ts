import { z } from "zod";
import { formatNumberWithDecimal } from "./utils";
import { PAYMENT_METHODS } from "./constants";

/* =======================================================
   💰 Currency Schema (Reusable)
   ======================================================= */
export const currencySchema = z.coerce
  .number()
  .nonnegative("Price must be greater than or equal to 0")
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(value)),
    "Price must have two decimal places"
  );

/* =======================================================
   🛍️ Product Schema
   ======================================================= */
export const insertProductSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  category: z.string().min(3, "Category must be at least 3 characters"),
  brand: z.string().min(3, "Brand must be at least 3 characters"),
  description: z.string().min(3, "Description must be at least 3 characters"),
  stock: z.coerce.number().min(0, "Stock must be a non-negative number"),
  images: z.array(z.string()).min(1, "Product must have at least one image"),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currencySchema,
});

/* =======================================================
   🔐 Auth Schemas
   ======================================================= */
export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/* =======================================================
   🛒 Cart Schemas
   ======================================================= */
export const cartItemSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  image: z.string().min(1, "Product image is required"),
  price: currencySchema,
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currencySchema,
  totalPrice: currencySchema,
  shippingPrice: currencySchema,
  taxPrice: currencySchema,
  sessionCartId: z.string().min(1, "Session cart id is required"),
  userId: z.string().optional().nullable(),
});

/* =======================================================
   📦 Shipping Schema
   ======================================================= */
export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  streetAddress: z.string().min(3, "Address must be at least 3 characters"),
  city: z.string().min(3, "City must be at least 3 characters"),
  postalCode: z.string().min(3, "Postal code must be at least 3 characters"),
  country: z.string().min(3, "Country must be at least 3 characters"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

/* =======================================================
   💳 Payment Schema
   ======================================================= */
export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, "Payment method is required"),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ["type"],
    message: "Invalid payment method",
  });

/* =======================================================
   📦 Order Schemas
   ======================================================= */
export const insertOrderSchema = z.object({
  userId: z.string().min(1, "User is required"),
  itemsPrice: currencySchema,
  shippingPrice: currencySchema,
  taxPrice: currencySchema,
  totalPrice: currencySchema,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: "Invalid payment method",
  }),
  shippingAddress: shippingAddressSchema,
});

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currencySchema,
  qty: z.number().int().min(1, "Qty must be at least 1"),
});

/* =======================================================
   🧾 Payment Result Schema
   ======================================================= */
export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string().email("Invalid email address"),
  pricePaid: z.string(),
});

/* =======================================================
   👤 Update Profile Schema
   ======================================================= */
export const updateProfileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
});
