import ProductCard from "./product-card";
import type { BasicProduct } from "@/lib/actions/product.actions";

interface ProductListProps {
  products?: BasicProduct[];
  title?: string;
}

/**
 * Renders a grid of product cards.
 * Used on the homepage and product listing sections.
 */
const ProductList = ({
  products = [],
  title = "Products",
}: ProductListProps) => {
  // ✅ Guard clause for invalid data
  if (!Array.isArray(products)) return null;

  return (
    <section className="my-10">
      {/* ✅ Section Title */}
      {title && (
        <h2 className="text-2xl font-semibold mb-6 tracking-tight text-gray-800">
          {title}
        </h2>
      )}

      {/* ✅ Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center py-10 text-gray-500 text-sm">
          No products found.
        </p>
      )}
    </section>
  );
};

export default ProductList;
