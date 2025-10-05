// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

/**
 * ✅ Creates an extended PrismaClient with automatic Decimal → string conversion.
 * Works with Neon serverless in production and local Prisma in development.
 */
function createExtendedClient(
  options?: ConstructorParameters<typeof PrismaClient>[0]
) {
  const client = new PrismaClient(options);

  return client.$extends({
    result: {
      // ===============================
      // 🛍️ Product
      // ===============================
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

      // ===============================
      // 🛒 Cart
      // ===============================
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

      // ===============================
      // 📦 Order
      // ===============================
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

      // ===============================
      // 🧾 Order Item
      // ===============================
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

// ============================================================
// 🔧 Prisma client instance (shared across environments)
// ============================================================
let prisma: ReturnType<typeof createExtendedClient>;

// ============================================================
// 🏗️ PRODUCTION — Neon Serverless + WebSocket adapter
// ============================================================
if (process.env.NODE_ENV === "production") {
  try {
    // Dynamically import Neon dependencies
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool, neonConfig } = require("@neondatabase/serverless");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { PrismaNeon } = require("@prisma/adapter-neon");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const wsImport = require("ws");
    const ws = wsImport?.default ?? wsImport;

    // ✅ Ensure database URL exists
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "❌ DATABASE_URL is missing. Please check your .env file."
      );
    }

    // ✅ Enable WebSocket for Neon
    neonConfig.webSocketConstructor = ws;

    // ✅ Create Neon pool + adapter
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);

    // ✅ Create extended Prisma client with Neon adapter
    prisma = createExtendedClient({ adapter });

    console.log("✅ Connected to Neon database successfully (production)");
  } catch (err) {
    console.error(
      "⚠️ Neon adapter initialization failed. Falling back to standard Prisma client:",
      err
    );
    prisma = createExtendedClient();
  }
}
// ============================================================
// 🧑‍💻 DEVELOPMENT — reuse Prisma instance across hot reloads
// ============================================================
else {
  const globalForPrisma = globalThis as unknown as { prisma?: typeof prisma };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createExtendedClient({
      log: ["query", "error", "warn"],
    });
    console.log("✅ Prisma connected locally (development mode)");
  }

  prisma = globalForPrisma.prisma;
}

export default prisma;
export { prisma };
