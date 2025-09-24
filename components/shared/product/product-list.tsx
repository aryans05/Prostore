// components/shared/product/product-list.tsx
import ProductCard from "./product-card";
import { Product } from "@/types"; // ✅ use the shared type

const ProductList = ({
  data = [], // ✅ default value is an empty array
  title = "Products",
}: {
  data?: Product[];
  title?: string;
}) => {
  if (!Array.isArray(data)) return null;

  return (
    <section className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>

      {data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {data.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No products found.
        </div>
      )}
    </section>
  );
};

export default ProductList;
