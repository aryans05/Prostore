export const dynamic = "force-dynamic";
export const revalidate = 0;

import CartTable from "./cart-table";
import { getMyCart } from "@/lib/actions/cart.actions";

export const metadata = {
  title: "Shopping Cart",
};

const CartPage = async () => {
  const cart = await getMyCart();

  // ✅ Convert Prisma/Decimal/Date -> plain JSON
  const safeCart = cart ? JSON.parse(JSON.stringify(cart)) : null;

  return (
    <>
      <CartTable cart={safeCart} />
    </>
  );
};

export default CartPage;
