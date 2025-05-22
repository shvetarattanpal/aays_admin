import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId, Types, HydratedDocument } from "mongoose";
import Product, { IProduct } from "@/lib/models/Product";
import Collection from "@/lib/models/Collection";
import { connectToDB } from "@/lib/mongoDB";

export const POST = async (req: NextRequest) => {
  try {
    await connectToDB();

    const data = await req.json();
    console.log("Received Data:", data);

    const {
      title,
      description,
      media,
      category,
      subCategory,
      collections,
      tags,
      sizes,
      colors,
      price,
      expense,
    } = data;

    if (!subCategory) {
      console.error("❌ SubCategory is missing in request!");
      return new NextResponse("SubCategory is required", { status: 400 });
    }

    const newProduct: HydratedDocument<IProduct> = new Product({
      title,
      description,
      media,
      category,
      subCategory,
      collections:
        collections?.map((id: string) => new Types.ObjectId(id)) || [],
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

export const GET = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();

    const { productId } = params; 
    console.log("📦 Received productId:", productId);

    let product;

    if (isValidObjectId(productId)) {
      product = await Product.findById(productId).populate({
        path: "collections",
        model: Collection,
      });
    } else {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const plainProduct = product.toObject();
    plainProduct._id = plainProduct._id.toString();
    plainProduct.collections = plainProduct.collections?.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
    }));

    return NextResponse.json(plainProduct, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching product by ID:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { productId: string } }
) => {
  try {
    await connectToDB();

    const { productId } = params;
    if (!isValidObjectId(productId)) {
      return NextResponse.json({ message: "Invalid product ID" }, { status: 400 });
    }

    const data = await req.json();
    console.log("🛠 Updating Product ID:", productId, "with Data:", data);

    if (data.collections) {
      data.collections = data.collections.map((id: string) => new Types.ObjectId(id));
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    const plainUpdated = updatedProduct.toObject();
    plainUpdated._id = plainUpdated._id.toString();

    return NextResponse.json(plainUpdated, { status: 200 });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    await connectToDB();

    const productId = params.productId;
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/products/[productId] error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";