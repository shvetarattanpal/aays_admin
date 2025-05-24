import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await connectToDB();

    const { ids } = await req.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    const objectIds = ids.map((id: string) => new mongoose.Types.ObjectId(id));

    const products = await Product.find({ _id: { $in: objectIds } });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("[wishlist_products_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const dynamic = "force-dynamic";