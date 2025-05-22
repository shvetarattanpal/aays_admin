import { DataTable } from "@/components/custom-ui/DataTable";
import { columns } from "@/components/orderItems/OrderItemsColums";
import OrderStatusForm from "./OrderStatusForm";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";

const OrderDetails = async ({ params }: { params: { orderId: string } }) => {
  await connectToDB();

  const order = await Order.findById(params.orderId).lean() as {
    status: string;
  } | null;

  const res = await fetch(`${process.env.ADMIN_DASHBOARD_URL}/api/orders/${params.orderId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch order details");
  }

  const { orderDetails, customer } = await res.json();

  const {
    street = "N/A",
    city = "N/A",
    state = "N/A",
    postalCode = "N/A",
    country = "N/A",
  } = orderDetails.shippingAddress || {};

  if (!order) return <p>Order not found</p>;

  return (
    <div className="flex flex-col p-10 gap-5">
      <h1 className="text-2xl font-bold">Order #{params.orderId}</h1>

      <p className="text-base-bold">
        Order ID: <span className="text-base-medium">{orderDetails._id}</span>
      </p>
      <p className="text-base-bold">
        Customer name:{" "}
        <span className="text-base-medium">
          {customer?.name || "N/A"}
        </span>
      </p>
      <p className="text-base-bold">
        Shipping address:{" "}
        <span className="text-base-medium">
          {street}, {city}, {state}, {postalCode}, {country}
        </span>
      </p>
      <p className="text-base-bold">
        Total Paid: <span className="text-base-medium">${orderDetails.totalAmount}</span>
      </p>
      <p className="text-base-bold">
        Shipping rate ID: <span className="text-base-medium">{orderDetails.shippingRate}</span>
      </p>

      <p className="text-base-bold">
        Current status:{" "}
        <span className="text-base-medium">{order.status}</span>
      </p>

      <OrderStatusForm orderId={params.orderId} currentStatus={order.status} />

      <DataTable columns={columns} data={orderDetails.products} searchKey="product" />
    </div>
  );
};

export default OrderDetails;