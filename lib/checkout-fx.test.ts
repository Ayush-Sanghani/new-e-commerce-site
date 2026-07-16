import { describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import { buildChargeOrderTotals } from "./checkout-fx";

describe("buildChargeOrderTotals", () => {
  it("keeps INR totals unchanged with exchangeRate 1", () => {
    const result = buildChargeOrderTotals(
      {
        subtotal: new Prisma.Decimal("100.00"),
        tax: new Prisma.Decimal("5.00"),
        shipping: new Prisma.Decimal("40.00"),
        discount: new Prisma.Decimal(0),
        total: new Prisma.Decimal("145.00"),
      },
      {
        code: "INR",
        symbol: "₹",
        decimalDigits: 2,
        rateToInr: new Prisma.Decimal(1),
        rateUpdatedAt: new Date(),
        rateStale: false,
      }
    );

    expect(result.currency).toBe("INR");
    expect(result.exchangeRate.toNumber()).toBe(1);
    expect(result.totalInInr.toNumber()).toBe(145);
    expect(result.total.toNumber()).toBe(145);
    expect(result.minorUnits).toBe(14500);
  });

  it("converts each INR field into USD using snapshot rate", () => {
    const result = buildChargeOrderTotals(
      {
        subtotal: new Prisma.Decimal("380.00"),
        tax: new Prisma.Decimal("19.00"),
        shipping: new Prisma.Decimal("40.00"),
        discount: new Prisma.Decimal(0),
        total: new Prisma.Decimal("439.00"),
      },
      {
        code: "USD",
        symbol: "$",
        decimalDigits: 2,
        rateToInr: new Prisma.Decimal("83.5"),
        rateUpdatedAt: new Date(),
        rateStale: false,
      }
    );

    expect(result.currency).toBe("USD");
    expect(result.exchangeRate.toNumber()).toBe(83.5);
    expect(result.totalInInr.toNumber()).toBe(439);
    expect(result.subtotal.toNumber()).toBe(4.55);
    expect(result.tax.toNumber()).toBe(0.23);
    expect(result.shipping.toNumber()).toBe(0.48);
    expect(result.total.toNumber()).toBe(5.26);
    expect(result.minorUnits).toBe(526);
  });
});
