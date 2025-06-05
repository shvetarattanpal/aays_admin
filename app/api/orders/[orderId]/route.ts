import Customer from "@/lib/models/Customer";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const ALLOWED_ORIGIN = "https://aays-store.vercel.app";

export const GET = async (
  req: NextRequest,
  { params }: { params: { orderId: string } }
) => {
  try {
    await connectToDB();

    if (!mongoose.Types.ObjectId.isValid(params.orderId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid Order ID" }), {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const orderDetails = await Order.findById(params.orderId).populate({
      path: "products.product",
      model: Product,
    });

    if (!orderDetails) {
      return new NextResponse(JSON.stringify({ message: "Order Not Found" }), {
        status: 404,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const customer = await Customer.findOne({
      clerkId: orderDetails.customerClerkId,
    });

    return new NextResponse(
      JSON.stringify({ orderDetails, customer }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  } catch (err) {
    console.error("[orderId_GET]", err);

    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      }
    );
  }
};

export const OPTIONS = () => {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
};

export const dynamic = "force-dynamic";