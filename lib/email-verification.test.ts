import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildVerifyEmailUrl,
  createEmailVerificationToken,
  hashEmailVerificationToken,
  isEmailVerificationTokenExpired,
  VERIFY_TOKEN_EXPIRY_MS,
} from "@/lib/email-verification";

describe("email-verification", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes token deterministically", () => {
    const hash = hashEmailVerificationToken("abc");
    expect(hash).toBe(hashEmailVerificationToken("abc"));
    expect(hash).not.toBe(hashEmailVerificationToken("xyz"));
  });

  it("creates token with 24h expiry", () => {
    const { rawToken, tokenHash, expiresAt } = createEmailVerificationToken();
    expect(rawToken.length).toBeGreaterThan(20);
    expect(tokenHash).toBe(hashEmailVerificationToken(rawToken));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(expiresAt.getTime()).toBeLessThanOrEqual(Date.now() + VERIFY_TOKEN_EXPIRY_MS + 1000);
  });

  it("builds verify URL with encoded token", () => {
    const url = buildVerifyEmailUrl("token+special");
    expect(url).toBe(
      "http://localhost:3000/verify-email?token=token%2Bspecial"
    );
  });

  it("detects expired tokens", () => {
    const past = new Date(Date.now() - 1000);
    const future = new Date(Date.now() + 60_000);
    expect(isEmailVerificationTokenExpired(past)).toBe(true);
    expect(isEmailVerificationTokenExpired(future)).toBe(false);
  });
});
