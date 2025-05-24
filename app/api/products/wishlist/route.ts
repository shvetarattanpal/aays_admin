import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return createCORSResponse(JSON.stringify([]), 200);
    }

    const objectIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

    const products = await Product.find({ _id: { $in: objectIds } });

    return createCORSResponse(JSON.stringify(products), 200);
  } catch (error) {
    console.error("[wishlist_products_POST]", error);
    return createCORSResponse("Internal Server Error", 500);
  }
}

function createCORSResponse(body: string, status = 200) {
  return new NextResponse(body, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "https://aays-store.vercel.app",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "https://aays-store.vercel.app",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export const dynamic = "force-dynamic";