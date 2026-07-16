import type { CurrencyContext } from "@/lib/services/currency";
import { convertCurrencyToInr, convertInrToCurrency, formatMoney } from "@/lib/money";

export function convertInrPriceForDisplay(
  inrAmount: number,
  context: CurrencyContext
): number {
  return convertInrToCurrency(inrAmount, context.rateToInr, context.decimalDigits).toNumber();
}

/** Convert a filter bound entered in display currency back to INR for DB filtering. */
export function convertDisplayPriceToInr(
  displayAmount: number,
  context: CurrencyContext
): number {
  return convertCurrencyToInr(displayAmount, context.rateToInr, 2).toNumber();
}

export function formatCatalogMoney(inrAmount: number, context: CurrencyContext): string {
  const displayAmount = convertInrPriceForDisplay(inrAmount, context);
  return formatMoney(displayAmount, {
    currencyCode: context.code,
    symbol: context.symbol,
    decimalDigits: context.decimalDigits,
  });
}

export type DisplayCurrencyProps = {
  currencyCode: string;
  currencySymbol: string;
  decimalDigits?: number;
};
