import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest, { params }: { params: { query: string } }) => {
  try {
    await connectToDB();

    const searchQuery = params.query?.trim();
    console.log("🔍 Search Query:", searchQuery);

    if (!searchQuery) {
      return NextResponse.json({ success: false, error: "Invalid search query" }, { status: 400 });
    }

    const searchedProducts = await Product.find({
      $or: [
        { title: { $regex: searchQuery, $options: "i" } },
        { category: { $regex: searchQuery, $options: "i" } },
        { tags: { $in: [new RegExp(searchQuery, "i")] } }
      ]
    });

    console.log("🛍️ Found Products:", searchedProducts);

    return NextResponse.json({ success: true, products: searchedProducts }, { status: 200 });

  } catch (err: any) {
    console.error("[search_GET] Error:", err.message || err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
};

export const dynamic = "force-dynamic";