import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { verifyToken } from "@/lib/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthRoute = pathname === "/login" || pathname === "/register";

  

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
  matcher: ["/login", "/register"],
};
