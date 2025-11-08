import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

const encoder = new TextEncoder();
const secretKey = encoder.encode(SECRET);

export async function proxy(req: NextRequest) {
  const token = req.cookies.get("session_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/landing-page", req.url));
  }

  try {
    await jwtVerify(token, secretKey);
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/landing-page", req.url));
  }
}

export const config = {
  matcher: [
    "/",
    "/explore/:path*",
    "/create-quote/:path*",
    "/detail-page/:path*",
    "/messages/:path*",
    "/notifications/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
