import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import {
  convertCurrencyToInr,
  convertInrToCurrency,
  formatMoney,
  roundMoney,
  toMinorUnits,
} from "./money";

describe("money helpers", () => {
  it("converts INR to USD using rateToInr", () => {
    const usd = convertInrToCurrency(835, 83.5, 2);
    expect(usd.toNumber()).toBe(10);
  });

  it("converts USD to INR using rateToInr", () => {
    const inr = convertCurrencyToInr(10, 83.5, 2);
    expect(inr.toNumber()).toBe(835);
  });

  it("rounds to currency decimal digits", () => {
    const rounded = roundMoney(new Prisma.Decimal("10.126"), 2);
    expect(rounded.toNumber()).toBe(10.13);
  });

  it("converts to minor units", () => {
    expect(toMinorUnits(5.26, 2)).toBe(526);
    expect(toMinorUnits(439, 2)).toBe(43900);
  });

  it("formats money with symbol", () => {
    expect(
      formatMoney(1234.5, {
        currencyCode: "INR",
        symbol: "₹",
        decimalDigits: 2,
      })
    ).toBe("₹1,234.50");
  });
});
