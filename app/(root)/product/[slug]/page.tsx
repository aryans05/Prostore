import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug } from "@/lib/actions/product.actions";
import { notFound } from "next/navigation";
import ProductPrice from "@/components/shared/product/product-pricing";
import ProductImages from "@/components/shared/product/product-images";
import AddToCart from "@/components/shared/product/add-to-cart";
import { getMyCart } from "@/lib/actions/cart.actions";
import type { Cart, CartItem } from "@/types";

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
  // ✅ await params for Next.js App Router dynamic routes
  const { slug } = await params;

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const cart = await getMyCart();

  // ✅ Serialize cart (if exists)
  const safeCart: Cart | null = cart
    ? {
        ...cart,
        itemsPrice: Number(cart.itemsPrice),
        totalPrice: Number(cart.totalPrice),
        shippingPrice: Number(cart.shippingPrice),
        taxPrice: Number(cart.taxPrice),
        createdAt: toPlainDate(cart.createdAt),
        items: cart.items.map((item) => ({
          ...item,
          price: Number(item.price ?? 0),
          quantity: Number(item.quantity),
          createdAt: toPlainDate(item.createdAt),
          updatedAt: toPlainDate(item.updatedAt),
          product: item.product
            ? {
                ...item.product,
                price: Number(item.product.price),
                rating: Number(item.product.rating),
                createdAt: toPlainDate(item.product.createdAt),
              }
            : null,
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
                <div className="flex justify-between">
                  <span>Status</span>
                  {safeProduct.stock > 0 ? (
                    <Badge variant="outline">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>
                <div className="pt-3">
                  <AddToCart
                    cart={safeCart}
                    item={
                      {
                        productId: safeProduct.id,
                        slug: safeProduct.slug,
                        name: safeProduct.name,
                        price: safeProduct.price,
                        quantity: 1,
                        image: safeProduct.images?.[0] ?? "/placeholder.png",
                      } satisfies Omit<CartItem, "cartId">
                    }
                  />
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
