// app/page.tsx
import ProductList from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";

export const revalidate = 60; // ISR: page revalidates every 60s

const Homepage = async () => {
  const latestProducts = await getLatestProducts();

  return (
    <main className="container mx-auto px-4 py-8">
      <ProductList data={latestProducts} title="Newest Arrivals" />
    </main>
  );
};

export default Homepage;
