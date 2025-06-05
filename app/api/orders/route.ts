import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { connectToDB } from "@/lib/mongoDB";

import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find().sort({ createdAt: "desc" }).lean();

    const clerkIds = [...new Set(
      orders.map(order => order.customerClerkId).filter(Boolean)
    )];

    const customers = clerkIds.length > 0
      ? await Customer.find({ clerkId: { $in: clerkIds } }).lean()
      : [];

    const customerMap = new Map(
      customers.map(c => [c.clerkId, c.name || "Unknown"])
    );

    const orderDetails = orders.map((order) => {
      const customerName = customerMap.get(order.customerClerkId) || "Unknown";

      let createdAtFormatted = "N/A";
      try {
        const date = new Date(order.createdAt);
        if (!isNaN(date.getTime())) {
          createdAtFormatted = format(date, "MMM do, yyyy");
        }
      } catch {
        createdAtFormatted = "N/A";
      }

      return {
        _id: String(order._id),
        customer: customerName,
        products: Array.isArray(order.products) ? order.products.length : 0,
        totalAmount: order.totalAmount,
        createdAt: createdAtFormatted,
      };
    });

    return NextResponse.json(orderDetails, { status: 200 });

  } catch (err: any) {
    console.error("[orders_GET]", err?.message || err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const body = await req.json();

    const {
      customer,
      products,
      totalAmount,
      shippingAddress,
      shippingRate,
    } = body;

    if (
      !customer ||
      !customer.clerkId ||
      !products ||
      !totalAmount ||
      !shippingAddress ||
      !shippingRate
    ) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const existingCustomer = await Customer.findOne({ clerkId: customer.clerkId });

    if (existingCustomer) {
      existingCustomer.name = customer.name;
      existingCustomer.email = customer.email;
      await existingCustomer.save();
    } else {
      await Customer.create({
        name: customer.name,
        email: customer.email,
        clerkId: customer.clerkId,
      });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderId = `ORD-${timestamp}-${randomSuffix}`;

    const newOrder = await Order.create({
      orderId,
      customerClerkId: customer.clerkId,
      products,
      totalAmount,
      shippingAddress,
      shippingRate,
      status: "Ordered",
      statusTimestamps: {
        ordered: new Date(),
      },
      createdAt: new Date(),
    });

    return NextResponse.json({
      ...newOrder.toObject(),
      _id: newOrder._id.toString(), 
    }, { status: 201 });
  } catch (err: any) {
    console.error("[orders_POST]", err?.message || err);
    return new NextResponse("Failed to save order", { status: 500 });
  }
};

export const dynamic = "force-dynamic";