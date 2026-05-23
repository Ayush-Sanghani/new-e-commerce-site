import { NextRequest, NextResponse } from "next/server";
import { attachAuthCookie } from "@/lib/auth-cookie";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth-constants";
import {
  exchangeGoogleCode,
  fetchGoogleUserInfo,
  getGoogleOAuthConfig,
  getOAuthStateCookieOptions,
  isValidOAuthState,
  toGoogleProfile,
} from "@/lib/google-auth";
import { upsertUserFromGoogleProfile } from "@/lib/services/google-auth-user";

function loginRedirect(appUrl: string, error: string): NextResponse {
  return NextResponse.redirect(new URL(`/login?error=${error}`, appUrl));
}

function clearStateCookie(response: NextResponse): void {
  const cookie = getOAuthStateCookieOptions(0);
  response.cookies.set(cookie.name, "", { ...cookie, maxAge: 0 });
}

export async function GET(request: NextRequest) {
  const config = getGoogleOAuthConfig();
  const appUrl = config?.appUrl ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!config) {
    return loginRedirect(appUrl, "google_not_configured");
  }

  const { searchParams } = request.nextUrl;
  const oauthError = searchParams.get("error");
  if (oauthError === "access_denied") {
    return loginRedirect(appUrl, "google_denied");
  }
  if (oauthError) {
    return loginRedirect(appUrl, "google_failed");
  }

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const cookieState = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  if (!code || !isValidOAuthState(state, cookieState)) {
    const response = loginRedirect(appUrl, "google_invalid_state");
    clearStateCookie(response);
    return response;
  }

  try {
    const tokens = await exchangeGoogleCode(config, code);
    const userInfo = await fetchGoogleUserInfo(tokens.access_token);
    const profile = toGoogleProfile(userInfo);
    const result = await upsertUserFromGoogleProfile(profile);

    if ("error" in result) {
      const response = loginRedirect(appUrl, "google_account");
      clearStateCookie(response);
      return response;
    }

    const response = NextResponse.redirect(new URL("/home", appUrl));
    clearStateCookie(response);
    await attachAuthCookie(response, result.user);
    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    const response = loginRedirect(appUrl, "google_failed");
    clearStateCookie(response);
    return response;
  }
}
