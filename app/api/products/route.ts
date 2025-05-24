import { NextRequest, NextResponse } from "next/server";
import Product, { IProduct } from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB"; 
import { HydratedDocument, Types } from "mongoose";
import Collection from "@/lib/models/Collection";

const allowedOrigin = "https://aays-store.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

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

    console.log("Final data being submitted to DB:", { data });

    if (!subCategory) {
      console.error("❌ SubCategory is missing in request!");
      return new NextResponse("SubCategory is required", {
        status: 400,
        headers: corsHeaders,
      });
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

    return new NextResponse(JSON.stringify(newProduct), {
      status: 201,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    return new NextResponse("Server error", {
      status: 500,
      headers: corsHeaders,
    });
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

    return new NextResponse(JSON.stringify(products), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("[products_GET] Error:", error);
    return new NextResponse(
      JSON.stringify({ message: "Failed to fetch products" }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
};

export const OPTIONS = async () =>
  new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });

export const dynamic = "force-dynamic";