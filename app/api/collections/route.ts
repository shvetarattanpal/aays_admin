import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB"; 

import Collection from "@/lib/models/Collection"; 
import "@/lib/models/Product";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectToDB(); 

    const collections = await Collection.find()
      .populate({
        path: "products",
        select: "_id title description media category tags sizes colors price expense createdAt updatedAt",
        options: { lean: true },
      })
      .lean();

    const serializedCollections = collections.map((collection: any) => ({
      ...collection,
      _id: String(collection._id),
      products: collection.products.map((product: any) => ({
        _id: String(product._id),
        title: product.title,
        description: product.description || "",
        media: Array.isArray(product.media) ? product.media : [],
        category: product.category || "",
        collections: [],
        tags: Array.isArray(product.tags) ? product.tags : [],
        sizes: Array.isArray(product.sizes) ? product.sizes : [],
        colors: Array.isArray(product.colors) ? product.colors : [],
        price: product.price || 0,
        expense: product.expense || 0,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: product.updatedAt || new Date().toISOString(),
      })),
    }));

    return NextResponse.json(serializedCollections, { status: 200 });
  } catch (error) {
    console.error("❌ [collections_GET] API Error:", error);
    return NextResponse.json(
      { message: "Failed to fetch collections" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { title, description, image } = await req.json();

    if (!title || !image || !Array.isArray(image) || image.length === 0) {
      return NextResponse.json(
        { message: "Title and at least one image are required" },
        { status: 400 }
      );
    }

    await connectToDB();

    const existingCollection = await Collection.findOne({ title });
    if (existingCollection) {
      return NextResponse.json(
        { message: "Collection already exists" },
        { status: 400 }
      );
    }

    const newCollection = new Collection({
      title,
      description,
      image: image[0], 
    });

    await newCollection.save();

    return NextResponse.json(newCollection, { status: 201 });
  } catch (error) {
    console.error("❌ [collections_POST] API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}