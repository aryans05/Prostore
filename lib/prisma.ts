// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

function createExtendedClient(
  options?: ConstructorParameters<typeof PrismaClient>[0]
) {
  const client = new PrismaClient(options);

  return client.$extends({
    result: {
      // ✅ Automatically convert Decimal → string
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
      cart: {
        itemsPrice: {
          compute(cart) {
            return cart.itemsPrice?.toString();
          },
        },
        totalPrice: {
          compute(cart) {
            return cart.totalPrice?.toString();
          },
        },
        shippingPrice: {
          compute(cart) {
            return cart.shippingPrice?.toString();
          },
        },
        taxPrice: {
          compute(cart) {
            return cart.taxPrice?.toString();
          },
        },
      },
      order: {
        itemsPrice: {
          compute(order) {
            return order.itemsPrice?.toString();
          },
        },
        totalPrice: {
          compute(order) {
            return order.totalPrice?.toString();
          },
        },
        shippingPrice: {
          compute(order) {
            return order.shippingPrice?.toString();
          },
        },
        taxPrice: {
          compute(order) {
            return order.taxPrice?.toString();
          },
        },
      },
      orderItem: {
        price: {
          compute(item) {
            return item.price?.toString();
          },
        },
      },
    },
  });
}

// ✅ Client variable (shared across environments)
let prisma: ReturnType<typeof createExtendedClient>;

// ============================================================
// 🏗️ PRODUCTION (Neon serverless, WebSocket adapter)
// ============================================================
if (process.env.NODE_ENV === "production") {
  try {
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    const { PrismaNeon } = require("@prisma/adapter-neon");
    const wsImport = require("ws");
    const ws = wsImport?.default ?? wsImport;

    if (!process.env.DATABASE_URL) {
      throw new Error("❌ DATABASE_URL is missing. Check your .env file.");
    }

    neonConfig.webSocketConstructor = ws;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);

    prisma = createExtendedClient({ adapter });
  } catch (err) {
    console.error(
      "⚠️ Neon adapter failed. Falling back to standard Prisma:",
      err
    );
    prisma = createExtendedClient();
  }
}
// ============================================================
// 🧑‍💻 DEVELOPMENT (reuse Prisma client to avoid hot reload leaks)
// ============================================================
else {
  const globalForPrisma = globalThis as unknown as { prisma?: typeof prisma };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createExtendedClient({
      log: ["query", "error", "warn"],
    });
  }

  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
