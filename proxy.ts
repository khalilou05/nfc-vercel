import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return NextResponse.json(
      { error: "JWT_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!token) {
    return NextResponse.json(
      { error: "Missing bearer token" },
      { status: 401 },
    );
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 },
    );
  }
}

export const config = {
  matcher: "/dashboard/:path*",
};
