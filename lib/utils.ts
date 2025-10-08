import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import qs from "query-string";

/* =======================================================
   🧩 CLASSNAMES UTIL
   Merge Tailwind classes intelligently
   ======================================================= */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* =======================================================
   🧠 CONVERT TO PLAIN OBJECT
   Converts Prisma models (with Decimal, Date, etc.)
   into plain JSON-serializable JavaScript objects.
   ======================================================= */
export function convertToPlainObject<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_, val) => {
      // ✅ Handle Prisma.Decimal values safely
      if (
        val &&
        typeof val === "object" &&
        val.constructor?.name === "Decimal"
      ) {
        return Number((val as Decimal).toString());
      }

      // ✅ Handle Date objects
      if (val instanceof Date) {
        return val.toISOString();
      }

      return val;
    })
  );
}

/* =======================================================
   💰 NUMBER & CURRENCY HELPERS
   ======================================================= */

/**
 * Format number with fixed 2 decimal places
 */
export function formatNumberWithDecimal(num: number): string {
  if (isNaN(num)) return "0.00";
  const [int, decimal] = num.toString().split(".");
  return decimal ? `${int}.${decimal.padEnd(2, "0")}` : `${int}.00`;
}

/**
 * Format a number into a localized currency string.
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
 * Round a numeric value safely to 2 decimal places.
 */
export function round2(value: unknown): number {
  if (value == null) return 0;
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/* =======================================================
   ⚠️ ERROR HANDLING UTILITIES
   ======================================================= */
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

/* =======================================================
   🔠 STRING HELPERS
   ======================================================= */

/**
 * Shorten long UUIDs or IDs (e.g., show last 6 chars)
 */
export function formatId(id: string): string {
  if (!id) return "";
  return `..${id.slice(-6)}`;
}

/* =======================================================
   📅 DATE & TIME FORMATTING
   ======================================================= */
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

/* =======================================================
   🔗 QUERY STRING & PAGINATION UTILITIES
   ======================================================= */

/**
 * Build a URL with updated query parameters.
 * Used for pagination and dynamic filters.
 */
export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  // ✅ Type-safe fix: use null (not undefined)
  query[key] = value ?? null;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true }
  );
}
