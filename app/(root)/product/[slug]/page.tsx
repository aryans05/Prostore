import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // ✅ fixed import
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-pricing";
import ProductImages from "@/components/shared/product/product-images";

const ProductDetailsPage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Images Column */}
        <div className="col-span-2">
          <ProductImages images={product.images} />
        </div>

        {/* Details Column */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <p>
              {product.brand} • {product.category}
            </p>
            <h1 className="h3-bold">{product.name}</h1>
            <p>
              {/* ✅ convert rating to number/string */}
              {Number(product.rating).toFixed(1)} of {product.numReviews}{" "}
              Reviews
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <ProductPrice
                value={Number(product.price)}
                className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <p className="font-semibold">Description</p>
            <p>{product.description}</p>
          </div>

          {/* Price + Status */}
          <div className="mt-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Price</span>
                  <ProductPrice value={Number(product.price)} />
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  {Number(product.stock) > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                <div className="pt-3">
                  <Button
                    disabled={Number(product.stock) === 0}
                    className="w-full"
                  >
                    {Number(product.stock) > 0 ? "Add to Cart" : "Unavailable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDetailsPage;
