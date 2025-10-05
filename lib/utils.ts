import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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
  return JSON.parse(
    JSON.stringify(value, (_, val) => {
      if (val && typeof val === "object" && val.constructor?.name === "Decimal") {
        return Number((val as Decimal).toString());
      }
      if (val instanceof Date) {
        return val.toISOString();
      }
      return val;
    })
  );
}

/**
 * Format number with decimal places.
 */
export function formatNumberWithDecimal(num: number): string {
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

/**
 * Format a number into a currency string.
 */
export function formatCurrency(
  value: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  if (isNaN(value)) return "$0.00";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format an error object into a human-readable string.
 */
export function formatError(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message || "Validation error";
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
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

/**
 * Round number-like value to 2 decimal places.
 */
export function round2(value: unknown): number {
  if (value == null) return 0;
  const num = Number(value.toString());
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Shorten UUIDs or long IDs.
 */
export function formatId(id: string): string {
  if (!id) return "";
  return `..${id.substring(id.length - 6)}`;
}

/**
 * Format a date into multiple styles.
 */
export function formatDateTime(dateInput: string | Date) {
  const date = new Date(dateInput);
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    year: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "short",
    month: "short",
    year: "numeric",
    day: "numeric",
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };
  return {
    dateTime: date.toLocaleString("en-US", dateTimeOptions),
    dateOnly: date.toLocaleString("en-US", dateOptions),
    timeOnly: date.toLocaleString("en-US", timeOptions),
  };
}
