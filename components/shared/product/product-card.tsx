import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ProductPrice from "./product-pricing";
import type { BasicProduct } from "@/types"; // ✅ Shared lightweight type

interface ProductCardProps {
  product: BasicProduct;
}

/**
 * 🛍️ ProductCard
 * Displays a single product with image, name, and formatted price.
 * Used in homepage and product listing grids.
 */
const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.images?.[0] || "/placeholder.png";

  return (
    <Card className="w-full max-w-sm hover:shadow-lg transition-all duration-200 bg-white">
      {/* ✅ Product Image */}
      <CardHeader className="p-0">
        <Link
          href={`/product/${product.slug}`}
          className="block w-full overflow-hidden rounded-t-lg"
        >
          <Image
            src={imageUrl}
            alt={product.name}
            width={300}
            height={300}
            priority
            className="object-cover w-full h-[300px] hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </CardHeader>

      {/* ✅ Product Info */}
      <CardContent className="text-center py-3">
        <h3 className="font-semibold text-lg truncate text-gray-800">
          {product.name}
        </h3>

        {/* ✅ Always render price safely */}
        <ProductPrice
          value={Number(product.price)}
          className="mt-1 text-muted-foreground"
        />
      </CardContent>
    </Card>
  );
};

export default ProductCard;
