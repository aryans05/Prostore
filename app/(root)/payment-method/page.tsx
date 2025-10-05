import { Metadata } from "next";
import { auth } from "@/auth";
import { getUserById } from "@/lib/actions/user.action";
import PaymentMethodForm from "./payment-method-from";

export const metadata: Metadata = {
  title: "Select Payment Method",
};

const PaymentMethodPage = async () => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("User not found");
  }

  const user = await getUserById(userId);

  return (
    <PaymentMethodForm preferredPaymentMethod={user.paymentMethod ?? null} />
  );
};

export default PaymentMethodPage;
