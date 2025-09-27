// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // attach to globalThis in dev to prevent creating multiple clients during hot reloads
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  try {
    // Use require here to avoid top-level await and keep this server-only.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaNeon } = require("@prisma/adapter-neon");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const wsImport = require("ws");
    const ws = wsImport?.default ?? wsImport;

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
            compute(product: any) {
              return product.price?.toString();
            },
          },
          rating: {
            compute(product: any) {
              return product.rating?.toString();
            },
          },
        },
      },
    });
  } catch (err) {
    // If something goes wrong with the Neon adapter, fall back to a plain PrismaClient.
    // This prevents the whole app from crashing in production if adapter packages fail.
    // Log the error so you can investigate.
    // eslint-disable-next-line no-console
    console.error(
      "Error creating Prisma client with Neon adapter, falling back:",
      err
    );
    prisma = new PrismaClient();
  }
} else {
  // Development: create / reuse a global Prisma client to avoid exhausting connections
  const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

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
