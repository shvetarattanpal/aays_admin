import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";
import mongoose from "mongoose";
import { headers } from "next/headers";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function bufferBody(
  stream: ReadableStream<Uint8Array> | null
): Promise<Buffer> {
  if (!stream) return Buffer.from("");
  const reader = stream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks.map((chunk) => Buffer.from(chunk)));
}

export const POST = async (req: NextRequest) => {
  try {
    const rawBody = await req.arrayBuffer();
    const body = Buffer.from(rawBody);

    const signature = headers().get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error("❌ Stripe Webhook Error:", err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

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

      const address = session?.shipping_details?.address;

      if (
        !address?.line1 ||
        !address?.city ||
        !address?.state ||
        !address?.postal_code ||
        !address?.country
      ) {
        console.error("❌ Incomplete shipping address:", address);
        return NextResponse.json(
          { error: "Incomplete shipping address received from Stripe" },
          { status: 400 }
        );
      }

      const shippingAddress = {
        street: address.line1,
        city: address.city,
        state: address.state,
        postalCode: address.postal_code,
        country: address.country,
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

    return NextResponse.json({ message: "✅ Order created" }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return NextResponse.json(
      { error: "❌ Failed to create the order" },
      { status: 500 }
    );
  }
};
