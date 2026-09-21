import { jwtVerify } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const secret = process.env.JWT_SECRET;
  const isLoginPage = request.nextUrl.pathname === "/";

  if (!secret) {
    if (isLoginPage) {
      return NextResponse.next();
    }

    return NextResponse.json(
      { error: "JWT_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!token) {
    return isLoginPage ?
        NextResponse.next()
      : NextResponse.redirect(new URL("/", request.url));
  }

  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return isLoginPage ?
        NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  } catch {
    return isLoginPage ?
        NextResponse.next()
      : NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
