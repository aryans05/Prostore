import { getOrderById } from "@/lib/actions/order.action";
import { notFound } from "next/navigation";
import OrderDetailsTable from "./order-details-table";
import { ShippingAddress } from "@/types";

export const metadata = {
  title: "Order Details",
};

const OrderDetailsPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <OrderDetailsTable
      order={{
        ...order,
        shippingAddress: order.shippingAddress as ShippingAddress,
      }}
      paypalClientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "sb"}
    />
  );
};

export default OrderDetailsPage;
