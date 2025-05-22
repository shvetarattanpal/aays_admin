import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Order from "@/lib/models/Order";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const newOrder = await Order.create({
      ...body,
      orderId: uuidv4(),
      statusTimestamps: { ordered: new Date() },
    });

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Create Order Error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}