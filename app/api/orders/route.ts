import { NextRequest, NextResponse } from "next/server";
import { format } from "date-fns";
import { connectToDB } from "@/lib/mongoDB";

import Order from "@/lib/models/Order";
import Customer from "@/lib/models/Customer";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const orders = await Order.find().sort({ createdAt: "desc" });

    const clerkIds = [...new Set(orders.map(order => order.customerClerkId))];

    const customers = await Customer.find({ clerkId: { $in: clerkIds } });

    const customerMap = new Map(customers.map(c => [c.clerkId, c.name]));

    const orderDetails = orders.map((order) => {
      const customerName = customerMap.get(order.customerClerkId) || "Unknown";
      return {
        _id: order._id,
        customer: customerName,
        products: order.products.length,
        totalAmount: order.totalAmount,
        createdAt: format(order.createdAt, "MMM do, yyyy"),
      };
    });

    return NextResponse.json(orderDetails, { status: 200 });
  } catch (err) {
    console.error("[orders_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
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

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err) {
    console.error("[orders_POST]", err);
    return new NextResponse("Failed to save order", { status: 500 });
  }
};

export const dynamic = "force-dynamic";