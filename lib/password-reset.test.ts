import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  hashPasswordResetToken,
  isPasswordResetTokenExpired,
} from "@/lib/password-reset";

describe("password-reset", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("hashes token deterministically", () => {
    const hash = hashPasswordResetToken("abc");
    expect(hash).toBe(hashPasswordResetToken("abc"));
    expect(hash).not.toBe(hashPasswordResetToken("xyz"));
  });

  it("creates token with future expiry", () => {
    const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();
    expect(rawToken.length).toBeGreaterThan(20);
    expect(tokenHash).toBe(hashPasswordResetToken(rawToken));
    expect(expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("builds reset URL with encoded token", () => {
    const url = buildPasswordResetUrl("token+special");
    expect(url).toBe(
      "http://localhost:3000/reset-password?token=token%2Bspecial"
    );
  });

  it("detects expired tokens", () => {
    const past = new Date(Date.now() - 1000);
    const future = new Date(Date.now() + 60_000);
    expect(isPasswordResetTokenExpired(past)).toBe(true);
    expect(isPasswordResetTokenExpired(future)).toBe(false);
  });
});
