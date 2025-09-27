// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Clone the response
  const response = NextResponse.next();

  // Only set sessionCartId if missing
  if (!request.cookies.get("sessionCartId")) {
    const sessionCartId = crypto.randomUUID();

    response.cookies.set("sessionCartId", sessionCartId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax", // ✅ good practice for security
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
