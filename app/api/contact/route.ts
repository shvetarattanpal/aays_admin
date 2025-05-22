import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongoDB";
import Contact from "@/lib/models/Contact";

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();

    const newMessage = new Contact(body);
    await newMessage.save();

    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";