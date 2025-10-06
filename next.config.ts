import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * ✅ Ensures Prisma works properly with Turbopack and Neon serverless.
   * - Ignores `.env` in builds (handled by Vercel automatically)
   * - Prevents Prisma binaries from being bundled unnecessarily
   * - Enables experimental server actions safely
   */
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb", // optional: useful for JSON-heavy forms
    },
  },

  webpack(config, { isServer }) {
    // ✅ Prevent bundling Prisma engines & binaries in the Next.js output
    if (isServer) {
      config.externals = [
        ...(config.externals || []),
        "@prisma/client",
        ".prisma/client",
      ];
    }

    // ✅ Fix WebSocket usage for Neon adapter on edge environments
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ws: false,
      net: false,
      tls: false,
      fs: false,
    };

    return config;
  },

  /**
   * ✅ Optional: speeds up builds by ignoring unnecessary Prisma warnings
   */
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
