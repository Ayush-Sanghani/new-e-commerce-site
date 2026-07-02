import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { verifyToken } from "@/lib/jwt";

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const PROTECTED_PREFIXES = ["/account", "/cart", "/orders"];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtected = isProtectedPath(pathname);

  let hasValidToken = false;
  if (token) {
    try {
      await verifyToken(token);
      hasValidToken = true;
    } catch {
      hasValidToken = false;
    }
  }

  if (isAuthRoute && hasValidToken) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  if (isProtected && !hasValidToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    const response = NextResponse.redirect(loginUrl);
    if (token) {
      // Clear stale/invalid cookie so the login page doesn't loop.
      response.cookies.set(AUTH_COOKIE_NAME, "", { path: "/", maxAge: 0 });
    }
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/account",
    "/account/:path*",
    "/cart",
    "/cart/:path*",
    "/orders",
    "/orders/:path*",
  ],
};
