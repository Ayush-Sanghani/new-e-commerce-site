import { describe, expect, it } from "vitest";
import { getGoogleLoginErrorMessage } from "@/lib/google-login-errors";

describe("google-login-errors", () => {
  it("returns null for empty code", () => {
    expect(getGoogleLoginErrorMessage(null)).toBeNull();
    expect(getGoogleLoginErrorMessage(undefined)).toBeNull();
  });

  it("returns known messages", () => {
    expect(getGoogleLoginErrorMessage("google_denied")).toBe(
      "Google sign-in was cancelled."
    );
    expect(getGoogleLoginErrorMessage("google_not_configured")).toContain(
      "GOOGLE_CLIENT_ID"
    );
  });

  it("returns fallback for unknown codes", () => {
    expect(getGoogleLoginErrorMessage("unknown_code")).toBe(
      "Google sign-in failed. Please try again."
    );
  });
});
