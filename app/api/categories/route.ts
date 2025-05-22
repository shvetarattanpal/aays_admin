import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Category from "@/lib/models/category";

export async function GET() {
  await connectToDB();
  const categories = await Category.find({});
  return NextResponse.json(categories);
}

export const dynamic = "force-dynamic";