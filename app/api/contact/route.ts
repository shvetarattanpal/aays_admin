import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Contact from "@/lib/models/Contact";

const allowedOrigin = "https://aays-store.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function POST(req: NextRequest) {
  try {
    await connectToDB();
    const body = await req.json();

    const newMessage = new Contact(body);
    await newMessage.save();

    return new NextResponse(
      JSON.stringify({ message: "Message sent successfully!" }),
      {
        status: 201,
        headers: corsHeaders,
      }
    );
  } catch (error) {
    console.error("Contact API error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong." }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export const dynamic = "force-dynamic";