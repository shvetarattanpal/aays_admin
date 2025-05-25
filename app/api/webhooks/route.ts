import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";
import mongoose from "mongoose";

export const config = {
  api: {
    bodyParser: false,
  },
};

export const runtime = "nodejs"; 
export const dynamic = "force-dynamic"; 

export const POST = async (req: NextRequest) => {
  try {
    const buf = await req.arrayBuffer();
    const rawBody = Buffer.from(buf);
    const signature = req.headers.get("Stripe-Signature") as string;

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    await connectToDB();

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items.data.price.product"],
      });

      const customerInfo = {
        clerkId: session?.client_reference_id,
        name: session?.customer_details?.name,
        email: session?.customer_details?.email,
      };

      const shippingAddress = {
        street: session?.shipping_details?.address?.line1 || "",
        city: session?.shipping_details?.address?.city || "",
        state: session?.shipping_details?.address?.state || "",
        postalCode: session?.shipping_details?.address?.postal_code || "",
        country: session?.shipping_details?.address?.country || "",
      };

      const lineItems = fullSession.line_items?.data || [];

      const orderItems = lineItems.map((item: any) => {
        const metadata = item.price.product.metadata;

        return {
          product: new mongoose.Types.ObjectId(String(metadata.productId)),
          color: metadata.color || "N/A",
          size: metadata.size || "N/A",
          quantity: item.quantity,
        };
      });

      const newOrder = await Order.create({
        orderId: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerClerkId: customerInfo.clerkId,
        products: orderItems,
        shippingAddress,
        shippingRate: session?.shipping_cost?.shipping_rate || "Standard",
        totalAmount: session.amount_total ? session.amount_total / 100 : 0,
        status: "Ordered",
        statusTimestamps: {
          ordered: new Date(),
        },
      });

      let customer = await Customer.findOne({ clerkId: customerInfo.clerkId });

      if (customer) {
        customer.orders.push(newOrder._id);
      } else {
        customer = new Customer({
          ...customerInfo,
          orders: [newOrder._id],
        });
      }

      await customer.save();

      console.log("✅ Order and Customer saved to DB.");
    }

    return new NextResponse("✅ Order created", { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new NextResponse("❌ Failed to create the order", { status: 500 });
  }
};