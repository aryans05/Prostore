// app/page.tsx

// ✅ Ensure live database queries (no static caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
import type { Metadata } from "next";

/* ============================================================
   🧠 SEO Metadata
   ============================================================ */
export const metadata: Metadata = {
  title: "Prostore | Modern E-Commerce",
  description:
    "Shop the latest arrivals from Prostore — built with Next.js, Prisma, and Tailwind CSS.",
};

/* ============================================================
   🏠 Homepage Component
   ============================================================ */
const Homepage = async () => {
  const latestProducts = await getLatestProducts();
  const hasProducts =
    Array.isArray(latestProducts) && latestProducts.length > 0;

  return (
    <main className="container mx-auto px-4 py-10">
      {hasProducts ? (
        <ProductList products={latestProducts} title="Newest Arrivals" />
      ) : (
        <section className="text-center py-16 text-gray-500">
          <h2 className="text-2xl font-semibold mb-3">No Products Found</h2>
          <p>Check back soon for new arrivals!</p>
        </section>
      )}
    </main>
  );
};

export default Homepage;
