"use client";

import { Cart, CartItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { addItemToCart, removeItemFromCart } from "@/lib/actions/cart.actions";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

type AddToCartProps = {
  cart?: Cart;
  item: Omit<CartItem, "cartId">;
};

const AddToCart: React.FC<AddToCartProps> = ({ cart, item }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // find if this product already exists in the cart
  const existItem = cart?.items.find((x) => x.productId === item.productId);

  // 🔥 local state for quantity (initialize from cart if available)
  const [quantity, setQuantity] = useState<number>(existItem?.quantity ?? 0);

  // keep state in sync if cart changes (e.g. after refresh)
  useEffect(() => {
    if (existItem) {
      setQuantity(existItem.quantity);
    } else {
      setQuantity(0);
    }
  }, [existItem]);

  const handleAddToCart = async () => {
    if (!session) return router.push("/sign-in");

    // optimistic update
    setQuantity((prev) => prev + 1);

    const res = await addItemToCart(item);

    if (!res.success) {
      // rollback if server fails
      setQuantity((prev) => Math.max(prev - 1, 0));
    }

    toast({
      title: res.success ? "Added to cart" : "Error",
      description: res.message,
      variant: res.success ? "default" : "destructive",
      action: res.success ? (
        <ToastAction altText="Go to cart" onClick={() => router.push("/cart")}>
          View cart
        </ToastAction>
      ) : undefined,
    });
  };

  const handleRemoveFromCart = async () => {
    if (!session) return router.push("/sign-in");

    // optimistic update
    setQuantity((prev) => Math.max(prev - 1, 0));

    const res = await removeItemFromCart(item.productId);

    if (!res.success) {
      // rollback if server fails
      setQuantity((prev) => prev + 1);
    }

    toast({
      title: res.success ? "Removed from cart" : "Error",
      description: res.message,
      variant: res.success ? "default" : "destructive",
    });
  };

  // UI
  return quantity > 0 ? (
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" onClick={handleRemoveFromCart}>
        <Minus className="w-4 h-4" />
      </Button>
      <span className="px-2">{quantity}</span>
      <Button type="button" variant="outline" onClick={handleAddToCart}>
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  ) : (
    <Button
      onClick={handleAddToCart}
      className="w-full"
      type="button"
      disabled={status === "loading"}
    >
      <Plus className="mr-2 h-4 w-4" /> Add to cart
    </Button>
  );
};

export default AddToCart;
