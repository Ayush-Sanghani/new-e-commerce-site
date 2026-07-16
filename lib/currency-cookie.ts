import type { NextRequest, NextResponse } from "next/server";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency-config";

const COOKIE_MAX_AGE_SECONDS = 365 * 24 * 60 * 60;

export function getCurrencyCookieFromRequest(request: NextRequest): string | null {
  return request.cookies.get(CURRENCY_COOKIE_NAME)?.value ?? null;
}

export function setCurrencyCookie(response: NextResponse, code: string): NextResponse {
  const isProduction = process.env.NODE_ENV === "production";
  response.cookies.set(CURRENCY_COOKIE_NAME, code.trim().toUpperCase(), {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return response;
}
