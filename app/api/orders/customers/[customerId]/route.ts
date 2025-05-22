import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";

export const GET = async (
  req: NextRequest,
  { params }: { params: { customerId: string } }
) => {
  try {
    await connectToDB();

    const orders = await Order.find({
      customerClerkId: params.customerId,
    })
      .populate({
        path: "products.product",
        select: "title media price", 
      })
      .sort({ createdAt: -1 })
      .lean(); 

    return NextResponse.json(
      { success: true, orders },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /orders/customers/:id]", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders" },
      { status: 500 }
    );
  }
};

export const dynamic = "force-dynamic";