import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-pricing";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import type { Cart } from "@/types";

/**
 * Serialize Date/Decimal -> JSON-safe strings/numbers
 */
function toPlainDate(value: any) {
  return value instanceof Date ? value.toISOString() : String(value);
}

const ProductDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();

  // ✅ SafeCart matches our Cart type
  const safeCart: Cart | null = cart
    ? {
        id: cart.id,
        sessionCartId: cart.sessionCartId ?? "",
        userId: cart.userId ?? undefined,
        itemsPrice: Number(cart.itemsPrice),
        totalPrice: Number(cart.totalPrice),
        shippingPrice: Number(cart.shippingPrice),
        taxPrice: Number(cart.taxPrice),
        createdAt: toPlainDate(cart.createdAt),
        items: cart.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          slug: item.product.slug,
          quantity: item.quantity,
          image: item.product.images?.[0] ?? "/placeholder.png",
          price: Number(item.price ?? 0),
        })),
      }
    : null;

  // ✅ Serialize product
  const safeProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    stock: Number(product.stock),
    price: Number(product.price),
    rating: Number(product.rating),
    numReviews: product.numReviews,
    images: product.images,
    isFeatured: product.isFeatured,
    banner: product.banner,
    createdAt: toPlainDate(product.createdAt),
  };

  const inStock = safeProduct.stock > 0;

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Images Column */}
        <div className="col-span-2">
          <ProductImages images={safeProduct.images} />
        </div>

        {/* Details Column */}
        <div className="col-span-2 p-5">
          <div className="flex flex-col gap-6">
            <p>
              {safeProduct.brand} • {safeProduct.category}
            </p>
            <h1 className="h3-bold">{safeProduct.name}</h1>
            <p>
              {safeProduct.rating.toFixed(1)} of {safeProduct.numReviews}{" "}
              Reviews
            </p>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <ProductPrice
                value={safeProduct.price}
                className="w-24 rounded-full bg-green-100 text-green-700 px-5 py-2"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-10">
            <p className="font-semibold">Description</p>
            <p>{safeProduct.description}</p>
          </div>

          {/* Price + Status */}
          <div className="mt-6">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span>Price</span>
                  <ProductPrice value={safeProduct.price} />
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  {inStock ? (
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-500"
                    >
                      In Stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {/* 🧠 Show AddToCart button only if in stock */}
                <div className="pt-3">
                  {inStock ? (
                    <AddToCart
                      cart={safeCart || undefined}
                      item={{
                        productId: safeProduct.id,
                        slug: safeProduct.slug,
                        name: safeProduct.name,
                        price: safeProduct.price,
                        quantity: 1,
                        image: safeProduct.images?.[0] ?? "/placeholder.png",
                      }}
                    />
                  ) : (
                    <button
                      disabled
                      className="w-full rounded-md bg-gray-100 text-gray-500 py-2 font-medium cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  )}
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
