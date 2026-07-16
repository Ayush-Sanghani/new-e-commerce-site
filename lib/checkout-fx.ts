import { Prisma } from "@prisma/client";
import { convertInrToCurrency, DEFAULT_CURRENCY_CODE, toMinorUnits } from "@/lib/money";
import type { CurrencyContext } from "@/lib/services/currency";

export type InrOrderTotals = {
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
  shipping: Prisma.Decimal;
  discount: Prisma.Decimal;
  total: Prisma.Decimal;
};

export type ChargeOrderTotals = {
  currency: string;
  exchangeRate: Prisma.Decimal;
  totalInInr: Prisma.Decimal;
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
  shipping: Prisma.Decimal;
  discount: Prisma.Decimal;
  total: Prisma.Decimal;
  decimalDigits: number;
  minorUnits: number;
};

/**
 * Option A / Q1a: keep INR totals as totalInInr, convert each breakdown field
 * into the charge currency using a snapshot rate.
 */
export function buildChargeOrderTotals(
  inrTotals: InrOrderTotals,
  context: CurrencyContext
): ChargeOrderTotals {
  const exchangeRate = context.rateToInr;
  const digits = context.decimalDigits;

  if (context.code === DEFAULT_CURRENCY_CODE) {
    return {
      currency: DEFAULT_CURRENCY_CODE,
      exchangeRate: new Prisma.Decimal(1),
      totalInInr: inrTotals.total,
      subtotal: inrTotals.subtotal,
      tax: inrTotals.tax,
      shipping: inrTotals.shipping,
      discount: inrTotals.discount,
      total: inrTotals.total,
      decimalDigits: digits,
      minorUnits: toMinorUnits(inrTotals.total, digits),
    };
  }

  const subtotal = convertInrToCurrency(inrTotals.subtotal, exchangeRate, digits);
  const tax = convertInrToCurrency(inrTotals.tax, exchangeRate, digits);
  const shipping = convertInrToCurrency(inrTotals.shipping, exchangeRate, digits);
  const discount = convertInrToCurrency(inrTotals.discount, exchangeRate, digits);
  const total = convertInrToCurrency(inrTotals.total, exchangeRate, digits);

  return {
    currency: context.code,
    exchangeRate,
    totalInInr: inrTotals.total,
    subtotal,
    tax,
    shipping,
    discount,
    total,
    decimalDigits: digits,
    minorUnits: toMinorUnits(total, digits),
  };
}

export function chargeTotalToMinorUnits(
  total: Prisma.Decimal | number,
  decimalDigits: number
): number {
  return toMinorUnits(total, decimalDigits);
}
