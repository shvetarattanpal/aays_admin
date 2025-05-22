import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import mongoose from "mongoose";

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const { orderId, status } = await req.json();
    console.log("Updating order status:", { orderId, status });

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID" },
        { status: 400 }
      );
    }

    const updateFields: any = { status };

    if (status === "Shipped")
      updateFields["statusTimestamps.shipped"] = new Date();
    if (status === "Out for Delivery")
      updateFields["statusTimestamps.outForDelivery"] = new Date();
    if (status === "Delivered")
      updateFields["statusTimestamps.delivered"] = new Date();

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, order: updatedOrder },
      { status: 200 }
    );
  } catch (err) {
    console.error("[update-status]", err);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";