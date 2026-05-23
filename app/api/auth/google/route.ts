import { NextResponse } from "next/server";
import {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleOAuthConfig,
  getOAuthStateCookieOptions,
} from "@/lib/google-auth";

export async function GET() {
  const config = getGoogleOAuthConfig();
  if (!config) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(new URL("/login?error=google_not_configured", appUrl));
  }

  const state = createOAuthState();
  const response = NextResponse.redirect(buildGoogleAuthUrl(config, state));
  const cookie = getOAuthStateCookieOptions();
  response.cookies.set(cookie.name, state, {
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
    path: cookie.path,
    maxAge: cookie.maxAge,
  });
  return response;
}
