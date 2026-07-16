import { Prisma } from "@prisma/client";

export const DEFAULT_CURRENCY_CODE = "INR";

export function toMoneyDecimal(value: number | Prisma.Decimal): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

export function roundMoney(value: Prisma.Decimal | number, decimalDigits: number): Prisma.Decimal {
  return toMoneyDecimal(value).toDecimalPlaces(decimalDigits, Prisma.Decimal.ROUND_HALF_UP);
}

/** Convert INR to charge currency: inrAmount / rateToInr (1 USD = rateToInr INR). */
export function convertInrToCurrency(
  inrAmount: Prisma.Decimal | number,
  rateToInr: Prisma.Decimal | number,
  decimalDigits: number
): Prisma.Decimal {
  const rate = toMoneyDecimal(rateToInr);
  if (rate.lte(0)) {
    return roundMoney(0, decimalDigits);
  }
  return roundMoney(toMoneyDecimal(inrAmount).div(rate), decimalDigits);
}

/** Convert charge currency to INR: amount * rateToInr. */
export function convertCurrencyToInr(
  amount: Prisma.Decimal | number,
  rateToInr: Prisma.Decimal | number,
  decimalDigits = 2
): Prisma.Decimal {
  return roundMoney(toMoneyDecimal(amount).mul(toMoneyDecimal(rateToInr)), decimalDigits);
}

/** Minor units for payment gateways (e.g. paise, cents). */
export function toMinorUnits(amount: Prisma.Decimal | number, decimalDigits: number): number {
  const multiplier = 10 ** decimalDigits;
  return roundMoney(toMoneyDecimal(amount).mul(multiplier), 0).toNumber();
}

const LOCALE_BY_CURRENCY: Record<string, string> = {
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  AED: "en-AE",
};

export type FormatMoneyOptions = {
  currencyCode: string; 
  symbol?: string;
  decimalDigits?: number;
};

export function formatMoney(
  amount: number | Prisma.Decimal,
  options: FormatMoneyOptions
): string {
  const decimalDigits = options.decimalDigits ?? 2;
  const rounded = roundMoney(amount, decimalDigits);
  const value = rounded.toNumber();
  const locale = LOCALE_BY_CURRENCY[options.currencyCode] ?? "en-US";
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimalDigits,
    maximumFractionDigits: decimalDigits,
  }).format(value);

  if (options.symbol) {
    return `${options.symbol}${formatted}`;
  }

  return `${options.currencyCode} ${formatted}`;
}
