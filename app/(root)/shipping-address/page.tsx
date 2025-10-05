export const dynamic = "force-dynamic";
export const revalidate = 0;

import { auth } from "@/auth";
import { getMyCart } from "@/lib/actions/cart.actions";
import { Metadata } from "next";
import { redirect } from "next/navigation"; // ✅ fixed import
import { ShippingAddress } from "@/types";
import { getUserById } from "@/lib/actions/user.action";
import ShippingAddressForm from "./shipping-address-form";
import CheckoutSteps from "@/components/shared/checkout-steps";
import { CheckCheck } from "lucide-react";
export const metadata: Metadata = {
  title: "Shipping Address",
};

const ShippingAddressPage = async () => {
  const cart = await getMyCart(); // ✅ added await

  if (!cart || cart.items.length === 0) {
    redirect("/cart"); // ✅ works now
  }

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) throw new Error("No user ID");

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps />
      <ShippingAddressForm address={user.address as ShippingAddress} />
    </>
  );
};

export default ShippingAddressPage;
