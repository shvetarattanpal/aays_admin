import { connectToDB } from "@/lib/mongoDB";
import Product from "@/lib/models/Product";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: { category: string; subCategory: string[] };
  }
) {
  try {
    await connectToDB();

    const category = decodeURIComponent(params.category);
    const subCategory = decodeURIComponent(params.subCategory.join("/"));

    const products = await Product.find({
      category: { $regex: `^${category}$`, $options: "i" },
      subCategory: { $regex: `^${subCategory}$`, $options: "i" },
    }).lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}

export const dynamic = "force-dynamic";