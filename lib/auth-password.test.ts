import { describe, expect, it } from "vitest";
import {
  getPasswordLoginBlockMessage,
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  validatePassword,
} from "@/lib/auth-password";

describe("auth-password", () => {
  it("blocks login when user has no password", () => {
    expect(getPasswordLoginBlockMessage({ password: null })).toBe(
      "This account uses Google sign-in. Please use Continue with Google."
    );
  });

  it("allows login when password exists", () => {
    expect(getPasswordLoginBlockMessage({ password: "hashed" })).toBeNull();
  });

  it("rejects empty passwords", () => {
    expect(validatePassword("")).toEqual({ ok: false, error: "Password is required." });
  });

  it("rejects passwords shorter than the minimum", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH - 1))).toEqual({
      ok: false,
      error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    });
  });

  it("accepts passwords within the allowed length range", () => {
    expect(validatePassword("a".repeat(MIN_PASSWORD_LENGTH))).toEqual({ ok: true });
    expect(validatePassword("a".repeat(MAX_PASSWORD_LENGTH))).toEqual({ ok: true });
  });

  it("rejects passwords longer than the maximum", () => {
    expect(validatePassword("a".repeat(MAX_PASSWORD_LENGTH + 1))).toEqual({
      ok: false,
      error: `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`,
    });
  });
});
