import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtected = pathname.startsWith("/home");
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  if (isProtected) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    try {
      await verifyToken(token);
    } catch {
      const res = NextResponse.redirect(new URL("/login", request.url));
      res.cookies.set(AUTH_COOKIE_NAME, "", { maxAge: 0, path: "/" });
      return res;
    }
  }

  if (isAuthRoute && token) {
    try {
      await verifyToken(token);
      return NextResponse.redirect(new URL("/home", request.url));
    } catch {
      // Token invalid — allow access to auth pages
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/home/:path*", "/login", "/register"],
};
