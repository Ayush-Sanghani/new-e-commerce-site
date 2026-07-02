import { afterEach, describe, expect, it } from "vitest";
import {
  buildGoogleAuthUrl,
  createOAuthState,
  getGoogleOAuthConfig,
  getGoogleRedirectUri,
  isValidOAuthState,
  toGoogleProfile,
} from "@/lib/google-auth";

const ENV_KEYS = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
] as const;

describe("google-auth", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it("returns null config when env is incomplete", () => {
    process.env.GOOGLE_CLIENT_ID = "id";
    expect(getGoogleOAuthConfig()).toBeNull();
  });

  it("returns config when env is set", () => {
    process.env.GOOGLE_CLIENT_ID = "client-id";
    process.env.GOOGLE_CLIENT_SECRET = "secret";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000/";
    expect(getGoogleOAuthConfig()).toEqual({
      clientId: "client-id",
      clientSecret: "secret",
      appUrl: "http://localhost:3000",
    });
  });

  it("builds redirect uri from app url", () => {
    expect(getGoogleRedirectUri("http://localhost:3000")).toBe(
      "http://localhost:3000/api/auth/google/callback"
    );
  });

  it("builds Google authorization URL with required params", () => {
    const url = buildGoogleAuthUrl(
      {
        clientId: "cid",
        clientSecret: "sec",
        appUrl: "http://localhost:3000",
      },
      "state-123"
    );
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe(
      "https://accounts.google.com/o/oauth2/v2/auth"
    );
    expect(parsed.searchParams.get("client_id")).toBe("cid");
    expect(parsed.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/auth/google/callback"
    );
    expect(parsed.searchParams.get("response_type")).toBe("code");
    expect(parsed.searchParams.get("state")).toBe("state-123");
    expect(parsed.searchParams.get("scope")).toContain("email");
  });

  it("creates non-empty oauth state", () => {
    expect(createOAuthState()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("validates oauth state against cookie", () => {
    expect(isValidOAuthState("abc", "abc")).toBe(true);
    expect(isValidOAuthState("abc", "xyz")).toBe(false);
    expect(isValidOAuthState(null, "abc")).toBe(false);
    expect(isValidOAuthState("abc", undefined)).toBe(false);
  });

  it("treats missing Google verified_email as unverified", () => {
    expect(toGoogleProfile({ id: "1", email: "a@example.com" }).email_verified).toBe(false);
    expect(
      toGoogleProfile({ id: "1", email: "a@example.com", verified_email: true }).email_verified
    ).toBe(true);
  });
});
