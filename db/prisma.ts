import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// ✅ Enable WebSocket connections for Neon
neonConfig.webSocketConstructor = ws;

// ✅ Ensure DATABASE_URL is defined
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is not defined in environment variables.");
}

// ✅ Pass connection string (not Pool) to PrismaNeon
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

// ✅ Create Prisma client with Neon adapter
const basePrisma = new PrismaClient({ adapter });

// ✅ Extend Prisma result transformers
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
