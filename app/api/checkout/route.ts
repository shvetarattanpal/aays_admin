import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const allowedOrigin = "https://aays-store.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cartItems, customer } = body;

    if (!cartItems?.length || !customer?.clerkId || !customer?.email) {
      return new NextResponse("Not enough data to checkout", { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      shipping_address_collection: {
        allowed_countries: ["CA"],
      },
      shipping_options: [
        { shipping_rate: "shr_1QuwDzQ6h5sG4cWCo6Lguasw" },
        { shipping_rate: "shr_1QuwGuQ6h5sG4cWC1oqM1r6o" },
      ],
      line_items: cartItems.map((cartItem: any) => ({
        price_data: {
          currency: "cad",
          product_data: {
            name: cartItem.item.title,
            metadata: {
              productId: cartItem.item._id,
              ...(cartItem.size && { size: cartItem.size }),
              ...(cartItem.color && { color: cartItem.color }),
            },
          },
          unit_amount: Math.round(cartItem.item.price * 100),
        },
        quantity: cartItem.quantity,
      })),
      client_reference_id: customer.clerkId,
      customer_email: customer.email,
      metadata: {
        clerkId: customer.clerkId,
        name: customer.name || "",
      },
      success_url: `${process.env.ECOMMERCE_STORE_URL}/payment_success`,
      cancel_url: `${process.env.ECOMMERCE_STORE_URL}/cart`,
    });

    console.log("🧾 Stripe session created:", session);

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (err) {
    console.error("[checkout_POST]", err);
    return new NextResponse("Internal Server Error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export const dynamic = "force-dynamic";