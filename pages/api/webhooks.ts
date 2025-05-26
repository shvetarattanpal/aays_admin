import type { NextApiRequest, NextApiResponse } from "next";
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    const buffers: Uint8Array[] = [];
    for await (const chunk of req) {
      buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(buffers).toString("utf-8");

    const signature = req.headers["stripe-signature"] as string;

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

      const shipping = session?.shipping_details?.address;

      if (
        !shipping?.line1 ||
        !shipping?.city ||
        !shipping?.state ||
        !shipping?.postal_code ||
        !shipping?.country
      ) {
        console.error("❌ Missing required shipping address fields");
        return res.status(400).send("Missing required shipping address fields");
      }

      const shippingAddress = {
        street: shipping.line1,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postal_code,
        country: shipping.country,
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

    return res.status(200).send("✅ Order created");
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return res.status(500).send("❌ Failed to create the order");
  }
}