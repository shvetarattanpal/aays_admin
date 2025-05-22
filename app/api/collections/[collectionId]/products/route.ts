import { NextResponse } from "next/server";
import Product from "@/lib/models/Product";
import { connectToDB } from "@/lib/mongoDB";
import { mapToProductType } from "@/lib/utils";

export const GET = async (
  _req: Request,
  { params }: { params: { collectionId: string } }
) => {
  try {
    await connectToDB();

    const products = await Product.find({ collections: params.collectionId }).populate("collections");

    return NextResponse.json(products.map(mapToProductType));
  } catch (err) {
    console.error("[COLLECTION_PRODUCTS_GET]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
};

export const dynamic = "force-dynamic";