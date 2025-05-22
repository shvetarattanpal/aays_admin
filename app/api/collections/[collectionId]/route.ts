import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";

import { connectToDB } from "@/lib/mongoDB";
import Collection from "@/lib/models/Collection";
import Product from "@/lib/models/Product";

export async function GET(
  req: Request,
  { params }: { params: { collectionId: string } }
) {
  try {
    await connectToDB();

    const collection = await Collection.findById(params.collectionId)
      .populate({
        path: "products",
        model: Product,
      })
      .lean();

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    return NextResponse.json(collection, { status: 200 });
  } catch (error) {
    console.error("[API] Error fetching collection:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export const POST = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const { title, description, image, productId, collections } = await req.json();

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 });
    }

    if (!collections || !Array.isArray(collections)) {
      return new NextResponse("Collections array is required", { status: 400 });
    }

    if (!productId) {
      console.warn("Warning: Product ID is missing, skipping product update.");
    } else {
      await Collection.updateMany(
        { products: productId },
        { $pull: { products: productId } }
      );

      await Collection.updateMany(
        { _id: { $in: collections || [] } },
        { $addToSet: { products: productId } }
      );
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      params.collectionId,
      { title, description, image },
      { new: true }
    );

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (err) {
    console.log("[collectionId_POST]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function PUT(
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const { title, description, image } = await req.json();

    if (!title || !image) {
      return new NextResponse("Title and image are required", { status: 400 });
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      params.collectionId,
      { title, description, image },
      { new: true }
    );

    if (!updatedCollection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    return NextResponse.json(updatedCollection, { status: 200 });
  } catch (err) {
    console.error("[collectionId_PUT]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export const DELETE = async (
  req: NextRequest,
  { params }: { params: { collectionId: string } }
) => {
  try {
    const { userId } = auth(); 

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDB();

    const collection = await Collection.findByIdAndDelete(params.collectionId);

    if (!collection) {
      return new NextResponse("Collection not found", { status: 404 });
    }

    await Product.updateMany(
      { collections: params.collectionId },
      { $pull: { collections: params.collectionId } }
    );

    return new NextResponse("Collection is deleted", { status: 200 });
  } catch (err) {
    console.log("[collectionId_DELETE]", err);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";