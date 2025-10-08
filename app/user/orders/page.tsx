import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/actions/order.action";
import { formatCurrency, formatDateTime, formatId } from "@/lib/utils";
import { Metadata } from "next";
import Link from "next/link";
import Pagination from "@/components/shared/product/pagination";

export const metadata: Metadata = {
  title: "My Orders",
};

// ✅ Corrected type for searchParams
const OrdersPage = async ({
  searchParams,
}: {
  searchParams: { page?: string };
}) => {
  // Get page number from search params (default to 1)
  const page = Number(searchParams?.page) || 1;

  // ✅ Fetch user orders (with pagination)
  const orders = await getMyOrders({ page });

  // Optional debug log
  console.log("🧾 Orders fetched:", orders);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Orders</h2>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>DATE</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead>PAID</TableHead>
              <TableHead>DELIVERED</TableHead>
              <TableHead>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders?.data?.length > 0 ? (
              orders.data.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{formatId(order.id)}</TableCell>

                  <TableCell>
                    {formatDateTime(order.createdAt).dateTime}
                  </TableCell>

                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>

                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : "Not paid"}
                  </TableCell>

                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : "Not delivered"}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/order/${order.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  You have no orders yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ Pagination (only show if more than one page) */}
      {orders.totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination
            page={page}
            totalPages={orders.totalPages}
            urlParamName="page"
          />
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
