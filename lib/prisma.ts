// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// Only import Neon adapter if in production (Vercel/Neon serverless)
let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // Dynamically require to avoid bundling in local dev
  const { Pool, neonConfig } = require("@neondatabase/serverless");
  const { PrismaNeon } = require("@prisma/adapter-neon");
  const ws = require("ws");

  // Ensure DATABASE_URL exists
  if (!process.env.DATABASE_URL) {
    throw new Error("❌ DATABASE_URL is missing. Check your .env file.");
  }

  // Enable WebSocket for Neon
  neonConfig.webSocketConstructor = ws;

  // Create Neon pool + adapter
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaNeon(pool);

  prisma = new PrismaClient({ adapter }).$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating.toString();
          },
        },
      },
    },
  });
} else {
  // Local development: use normal PrismaClient with singleton pattern
  const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
  };

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      log: ["query", "error", "warn"],
    });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
}

export { prisma };
export default prisma;
