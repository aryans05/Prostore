// lib/prisma.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

/**
 * ✅ Neon requires WebSocket connections for serverless Postgres.
 */
neonConfig.webSocketConstructor = ws;

/**
 * ✅ Ensure DATABASE_URL exists
 */
if (!process.env.DATABASE_URL) {
  throw new Error("❌ DATABASE_URL is missing in environment variables.");
}

/**
 * ✅ Create an extended Prisma client with Decimal → string conversion.
 * Keeps JSON safe when sending data to the frontend.
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
            return product.price?.toString() ?? null;
          },
        },
        rating: {
          compute(product) {
            return product.rating?.toString() ?? null;
          },
        },
      },

      // ===============================
      // 🛒 Cart
      // ===============================
      cart: {
        itemsPrice: {
          compute(cart) {
            return cart.itemsPrice?.toString() ?? null;
          },
        },
        totalPrice: {
          compute(cart) {
            return cart.totalPrice?.toString() ?? null;
          },
        },
        shippingPrice: {
          compute(cart) {
            return cart.shippingPrice?.toString() ?? null;
          },
        },
        taxPrice: {
          compute(cart) {
            return cart.taxPrice?.toString() ?? null;
          },
        },
      },

      // ===============================
      // 📦 Order
      // ===============================
      order: {
        itemsPrice: {
          compute(order) {
            return order.itemsPrice?.toString() ?? null;
          },
        },
        totalPrice: {
          compute(order) {
            return order.totalPrice?.toString() ?? null;
          },
        },
        shippingPrice: {
          compute(order) {
            return order.shippingPrice?.toString() ?? null;
          },
        },
        taxPrice: {
          compute(order) {
            return order.taxPrice?.toString() ?? null;
          },
        },
      },

      // ===============================
      // 🧾 OrderItem
      // ===============================
      orderItem: {
        price: {
          compute(item) {
            return item.price?.toString() ?? null;
          },
        },
      },
    },
  });
}

// ============================================================
// 🔧 Initialize Prisma Client (Single source of truth)
// ============================================================

let prisma: ReturnType<typeof createExtendedClient>;

if (process.env.NODE_ENV === "production") {
  try {
    // ✅ Neon serverless setup
    const adapter = new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
    });

    // PrismaNeon adapter works only with `engineType = "library"`
    prisma = createExtendedClient({ adapter } as any);
    console.log("✅ Connected to Neon database successfully (production)");
  } catch (err) {
    console.error(
      "⚠️ Neon adapter initialization failed. Falling back to standard Prisma client:",
      err
    );
    prisma = createExtendedClient();
  }
} else {
  // ============================================================
  // 🧑‍💻 Local Development — supports hot reloads safely
  // ============================================================
  const globalForPrisma = globalThis as unknown as {
    prisma?: ReturnType<typeof createExtendedClient>;
  };

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createExtendedClient({
      log: ["query", "error", "warn"],
    });
    console.log("✅ Prisma connected locally (development mode)");
  }

  prisma = globalForPrisma.prisma;
}

// ============================================================
// ✅ Export single Prisma instance
// ============================================================
export default prisma;
export { prisma };
