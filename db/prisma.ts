// db/prisma.ts
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

/**
 * ✅ Enable WebSocket connections for Neon serverless.
 * Neon requires WebSockets for Prisma’s library engine to work in edge/serverless environments.
 */
neonConfig.webSocketConstructor = ws;

// ✅ Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables.");
}

/**
 * ✅ Initialize Neon adapter with connection string.
 * Note: TypeScript doesn't yet recognize "adapter" in PrismaClient options,
 * so we safely cast the options object as `any`.
 */
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// ✅ FIX: cast to `any` to bypass missing type property
const basePrisma = new PrismaClient({ adapter } as any);

/**
 * ✅ Extend Prisma results for Decimal → string conversion.
 * This avoids JSON serialization errors (e.g., when sending data to the client).
 */
export const prisma = basePrisma.$extends({
  result: {
    product: {
      price: {
        compute(product) {
          return product.price ? product.price.toString() : null;
        },
      },
      rating: {
        compute(product) {
          return product.rating ? product.rating.toString() : null;
        },
      },
    },
  },
});

export default prisma;
