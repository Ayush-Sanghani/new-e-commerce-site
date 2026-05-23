import { describe, expect, it } from "vitest";
import { normalizeGoogleEmail, resolveGoogleUser } from "@/lib/google-user";

describe("google-user", () => {
  it("normalizes email", () => {
    expect(normalizeGoogleEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("creates user when none exists", () => {
    expect(
      resolveGoogleUser(null, {
        sub: "google-1",
        email: "new@example.com",
        name: "New User",
        email_verified: true,
      })
    ).toEqual({
      action: "create",
      email: "new@example.com",
      name: "New User",
      googleId: "google-1",
    });
  });

  it("logs in when googleId matches", () => {
    expect(
      resolveGoogleUser(
        {
          id: "u1",
          email: "user@example.com",
          googleId: "google-1",
          password: null,
        },
        { sub: "google-1", email: "user@example.com", email_verified: true }
      )
    ).toEqual({ action: "login", userId: "u1" });
  });

  it("links googleId to existing email/password account", () => {
    expect(
      resolveGoogleUser(
        {
          id: "u1",
          email: "user@example.com",
          googleId: null,
          password: "hashed",
        },
        { sub: "google-1", email: "user@example.com", email_verified: true }
      )
    ).toEqual({ action: "link", userId: "u1", googleId: "google-1" });
  });

  it("rejects unverified email", () => {
    expect(
      resolveGoogleUser(null, {
        sub: "google-1",
        email: "user@example.com",
        email_verified: false,
      })
    ).toEqual({ action: "error", message: "Google email is not verified." });
  });

  it("rejects mismatched googleId", () => {
    expect(
      resolveGoogleUser(
        {
          id: "u1",
          email: "user@example.com",
          googleId: "other-google",
          password: null,
        },
        { sub: "google-1", email: "user@example.com", email_verified: true }
      )
    ).toEqual({
      action: "error",
      message: "Google account does not match this user.",
    });
  });
});
