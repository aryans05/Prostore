import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/**
 * Utility function to merge class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a Prisma object (with Decimal, Date, etc.)
 * into a plain JSON-serializable JS object.
 */
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Format number with decimal places.
 */
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

/**
 * Format an error object into a human-readable string.
 */
export function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    // ✅ Return first validation error
    return error.errors[0]?.message || "Validation error";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // ✅ Handle Prisma known error codes
    if (error.code === "P2002") {
      return "This record already exists (duplicate field)";
    }
    return `Database error: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}
