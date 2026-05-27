import { describe, expect, it } from "vitest";
import { shouldShowNavSearch } from "./show-nav-search";

describe("shouldShowNavSearch", () => {
  it("shows search on shopping routes", () => {
    expect(shouldShowNavSearch("/home")).toBe(true);
    expect(shouldShowNavSearch("/shop")).toBe(true);
    expect(shouldShowNavSearch("/shop/abc-123")).toBe(true);
  });

  it("hides search on account, auth, and policy routes", () => {
    expect(shouldShowNavSearch("/privacy-policy")).toBe(false);
    expect(shouldShowNavSearch("/terms-and-conditions")).toBe(false);
    expect(shouldShowNavSearch("/login")).toBe(false);
    expect(shouldShowNavSearch("/account")).toBe(false);
    expect(shouldShowNavSearch("/cart")).toBe(false);
  });
});
