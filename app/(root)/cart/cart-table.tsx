"use client";

import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useTransition, useState, useMemo } from "react";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { SafeCart } from "@/lib/actions/cart.actions"; // ✅ import SafeCart instead of Cart
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const CartTable = ({ cart }: { cart?: SafeCart }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // ✅ Initialize from cart
  const [items, setItems] = useState<SafeCart["items"]>(cart?.items || []);

  // ✅ Calculate subtotal
  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);
  }, [items]);

  // ✅ Add item (optimistic update)
  const handleAdd = (productId: string) => {
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );

    startTransition(async () => {
      await addItemToCart({
        productId,
        quantity: 1, // ✅ backend only expects productId + quantity
      });
      toast({ title: "Item added to cart" });
    });
  };

  // ✅ Remove item (optimistic update, auto-delete if 0)
  const handleRemove = (productId: string) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.productId === productId
            ? { ...i, quantity: Math.max(0, i.quantity - 1) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );

    startTransition(async () => {
      await removeItemFromCart(productId);
      toast({ title: "Item removed from cart" });
    });
  };

  return (
    <>
      <div className="py-4 h2-bold">Shopping Cart</div>

      {!items || items.length === 0 ? (
        <div>
          Cart is Empty. <Link href="/">Go Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 md:gap-5">
          {/* Cart table */}
          <div className="overflow-x-auto md:col-span-3">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    {/* Product column */}
                    <TableCell>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="flex items-center gap-3"
                      >
                        <Image
                          src={
                            item.product.images?.[0] ||
                            "/images/sample-products/p1-1.jpg"
                          }
                          alt={item.product.name}
                          width={50}
                          height={50}
                          className="rounded"
                        />
                        <span>{item.product.name}</span>
                      </Link>
                    </TableCell>

                    {/* Quantity column */}
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={isPending}
                          onClick={() => handleRemove(item.productId)}
                          className="p-1 border rounded"
                        >
                          <Minus size={16} />
                        </button>

                        <span>{item.quantity}</span>

                        <button
                          disabled={isPending}
                          onClick={() => handleAdd(item.productId)}
                          className="p-1 border rounded"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </TableCell>

                    {/* Price column */}
                    <TableCell className="text-right">
                      ${(Number(item.price) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Order summary */}
          <div className="md:col-span-1 p-4 border rounded h-fit space-y-4">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Button
              className="w-full"
              onClick={() => router.push("/shipping-address")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default CartTable;
