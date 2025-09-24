import Link from "next/link";
import Image from "next/image";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import ProductPrice from "./product-pricing";
import { Product } from "@/types";
type Product = {
  slug: string;
  name: string;
  price: number;
  images: string[];
};

const ProductCard = ({ product }: { product: Product }) => {
  const imageUrl = product.images?.[0] || "/placeholder.png"; // fallback if no image

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`} className="block w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            width={300}
            height={300}
            priority
            className="rounded-t object-cover w-full h-[300px]"
          />
        </Link>
      </CardHeader>
      <CardContent className="text-center py-2">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {product.price != null && (
          <ProductPrice
            value={product.price}
            className="mt-1 text-muted-foreground"
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;
