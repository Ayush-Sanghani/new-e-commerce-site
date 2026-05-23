import { NextResponse } from "next/server";
import { Role } from "@prisma/client";
import { AUTH_COOKIE_NAME } from "@/lib/auth-constants";
import { signToken } from "@/lib/jwt";

const COOKIE_MAX_AGE_DAYS = 7;

export function getAuthCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict";
  path: string;
  maxAge: number;
} {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
  };
}

export async function attachAuthCookie(
  response: NextResponse,
  user: { id: string; email: string; role: Role }
): Promise<NextResponse> {
  const token = await signToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });
  const cookieOptions = getAuthCookieOptions();
  response.cookies.set(AUTH_COOKIE_NAME, token, cookieOptions);
  return response;
}
