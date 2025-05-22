import { NextRequest, NextResponse } from "next/server";
import Product, { IProduct } from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB"; 
import { HydratedDocument, Types } from "mongoose";
import Collection from "@/lib/models/Collection";

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const data = await req.json();
    console.log("Received Data:", data);

    const {
      title,
      description,
      media,
      imageUrl,
      category,
      subCategory,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    } = data;

    console.log("Final data being submitted to DB:", {data});

    if (!subCategory) {
      console.error("❌ SubCategory is missing in request!");
      return new NextResponse("SubCategory is required", { status: 400 });
    }

    const newProduct: HydratedDocument<IProduct> = new Product({
      title,
      description,
      media,
      imageUrl,
      category,
      subCategory,
      collections: collections.map((id: string) => new Types.ObjectId(id)),
      tags,
      sizes,
      colors,
      price,
      expense,
    });

    await newProduct.save();
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return new NextResponse("Server error", { status: 500 });
  }
};

export const GET = async (req: NextRequest) => {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subcategory");

    const query: Record<string, any> = {};
    if (category) query.category = category;
    if (subCategory) query.subCategory = subCategory;

    const products = await Product.find(query)
      .sort({ createdAt: "desc" })
      .populate({ path: "collections", model: Collection });

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("[products_GET] Error:", error);
    return NextResponse.json({ message: "Failed to fetch products" }, { status: 500 });
  }
};

export const dynamic = "force-dynamic";