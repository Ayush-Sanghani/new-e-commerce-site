import { describe, expect, it } from "vitest";
import { getPasswordLoginBlockMessage } from "@/lib/auth-password";

describe("auth-password", () => {
  it("blocks login when user has no password", () => {
    expect(getPasswordLoginBlockMessage({ password: null })).toBe(
      "This account uses Google sign-in. Please use Continue with Google."
    );
  });

  it("allows login when password exists", () => {
    expect(getPasswordLoginBlockMessage({ password: "hashed" })).toBeNull();
  });
});
