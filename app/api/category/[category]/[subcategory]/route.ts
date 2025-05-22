import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB"; 
import Product from "@/lib/models/Product";

export async function GET(
  req: Request,
  { params }: { params: { category: string; subcategory: string } }
) {
  await connectToDB();

  const { category, subcategory } = params;

  const products = await Product.find({
    category: { $regex: new RegExp(`^${category}$`, "i") },
    subCategory: { $regex: new RegExp(`^${subcategory}$`, "i") },
  }).lean();

  return NextResponse.json(products);
}

export const dynamic = "force-dynamic";