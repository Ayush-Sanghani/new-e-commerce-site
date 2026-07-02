import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth-constants";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";
const GOOGLE_SCOPES = ["openid", "email", "profile"].join(" ");

export type GoogleOAuthConfig = {
  clientId: string;
  clientSecret: string;
  appUrl: string;
};

export type GoogleTokenResponse = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
  id_token?: string;
};

export type GoogleUserInfoResponse = {
  id: string;
  email: string;
  verified_email?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
};

export function getGoogleOAuthConfig(): GoogleOAuthConfig | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (!clientId || !clientSecret || !appUrl) return null;
  return { clientId, clientSecret, appUrl };
}

export function getGoogleRedirectUri(appUrl: string): string {
  return `${appUrl}/api/auth/google/callback`;
}

export function buildGoogleAuthUrl(config: GoogleOAuthConfig, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: getGoogleRedirectUri(config.appUrl),
    response_type: "code",
    scope: GOOGLE_SCOPES,
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export function createOAuthState(): string {
  return crypto.randomUUID();
}

export function isValidOAuthState(
  returnedState: string | null,
  cookieState: string | undefined
): boolean {
  if (!returnedState || !cookieState) return false;
  return returnedState === cookieState;
}

export function getOAuthStateCookieOptions(maxAgeSeconds = 600) {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: GOOGLE_OAUTH_STATE_COOKIE,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export async function exchangeGoogleCode(
  config: GoogleOAuthConfig,
  code: string
): Promise<GoogleTokenResponse> {
  const redirectUri = getGoogleRedirectUri(config.appUrl);
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Google token exchange failed (${res.status})`);
  }

  return res.json() as Promise<GoogleTokenResponse>;
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfoResponse> {
  const res = await fetch(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Google userinfo failed (${res.status})`);
  }

  return res.json() as Promise<GoogleUserInfoResponse>;
}

export function toGoogleProfile(info: GoogleUserInfoResponse) {
  return {
    sub: info.id,
    email: info.email,
    name: info.name,
    email_verified: info.verified_email === true,
  };
}
