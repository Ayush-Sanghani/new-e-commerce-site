import { describe, expect, it } from "vitest";
import {
  pickResolvableCurrencyCode,
  resolveCurrencyCode,
} from "./services/currency";

describe("currency resolution", () => {
  const activeCodes = new Set(["INR", "USD", "GBP", "AED"]);

  it("prefers query currency over cookie and profile", () => {
    const code = resolveCurrencyCode({
      queryCurrency: "GBP",
      cookieCurrency: "USD",
      preferredCurrency: "AED",
      country: "India",
      activeCodes,
    });

    expect(code).toBe("GBP");
  });

  it("falls back through cookie, profile, country, locale, then INR", () => {
    expect(
      resolveCurrencyCode({
        cookieCurrency: "USD",
        activeCodes,
      })
    ).toBe("USD");

    expect(
      resolveCurrencyCode({
        preferredCurrency: "AED",
        activeCodes,
      })
    ).toBe("AED");

    expect(
      resolveCurrencyCode({
        country: "United Kingdom",
        activeCodes,
      })
    ).toBe("GBP");

    expect(
      resolveCurrencyCode({
        acceptLanguage: "en-GB,en;q=0.9",
        activeCodes,
      })
    ).toBe("GBP");

    expect(resolveCurrencyCode({ activeCodes })).toBe("INR");
  });

  it("ignores unsupported currency codes", () => {
    expect(pickResolvableCurrencyCode("EUR", activeCodes)).toBeNull();
    expect(
      resolveCurrencyCode({
        queryCurrency: "EUR",
        cookieCurrency: "USD",
        activeCodes,
      })
    ).toBe("USD");
  });
});
