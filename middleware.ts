import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default authMiddleware({
  publicRoutes: [
    "/", 
    "/api/collections", 
    "/api/products", 
    "/api/products/:productId", 
    "/api/search(.*)", 
    "/api/users", 
    "/api/checkout",
    "/api/orders/customers/:userId",  
    "/api/products/category/:category", 
    "/api/products/category/men", 
    "/api/products/category/women", 
    "/men", 
    "/women", 
    "/api/category/(.*)", 
    "/about", 
    "/contact", 
    "/products", 
    "/faq", 
    "/category(.*)", 
    "/api/products/by-category(.*)", 
    "/api/products/by-category/:category/:subCategory",
    "/category/:category/:subcategory",
    "/api/user/wishlist",
    "/orders",
    "/api/webhooks",
    "/api/orders/:orderId",
    "/api/collections/:collectionId",
    "/api/contact",
    "/unauthorized",
  ],
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;

    if (pathname === "/api/webhooks") {
      const res = NextResponse.next();
      res.headers.set("x-stripe-webhook-raw", "true");
      return res;
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)", 
    "/", 
    "/(api|trpc)(.*)", 
  ],
};