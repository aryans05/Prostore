// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

let prisma: ReturnType<typeof createExtendedClient>;

function createExtendedClient(client: PrismaClient) {
  return client.$extends({
    result: {
      product: {
        price: {
          compute(product) {
            return product.price?.toString();
          },
        },
        rating: {
          compute(product) {
            return product.rating?.toString();
          },
        },
      },
    },
  });
}

if (process.env.NODE_ENV === "production") {
  try {
    // Dynamically require Neon deps to avoid Next.js build issues
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

    const baseClient = new PrismaClient({ adapter });
    prisma = createExtendedClient(baseClient);
  } catch (err) {
    console.error(
      "⚠️ Failed to init Prisma with Neon adapter. Falling back:",
      err
    );
    prisma = createExtendedClient(new PrismaClient());
  }
} else {
  // Development: reuse Prisma client on hot reloads
  const globalForPrisma = globalThis as unknown as { prisma?: typeof prisma };

  if (!globalForPrisma.prisma) {
    const baseClient = new PrismaClient({ log: ["query", "error", "warn"] });
    globalForPrisma.prisma = createExtendedClient(baseClient);
  }

  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
