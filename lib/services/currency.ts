import type { Currency, ExchangeRate } from "@prisma/client";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import {
  CART_RATE_DISCLAIMER,
  mapAcceptLanguageToCurrency,
  mapCountryToCurrency,
  STALE_RATE_HOURS,
} from "@/lib/currency-config";
import { getCurrencyCookieFromRequest } from "@/lib/currency-cookie";
import { prisma } from "@/lib/db";
import { DEFAULT_CURRENCY_CODE } from "@/lib/money";

export type CurrencyWithRate = Currency & { exchangeRate: ExchangeRate | null };

export type CurrencyContext = {
  code: string;
  symbol: string;
  decimalDigits: number;
  rateToInr: Prisma.Decimal;
  rateUpdatedAt: Date;
  rateStale: boolean;
};

export type ResolveCurrencyInput = {
  queryCurrency?: string | null;
  cookieCurrency?: string | null;
  preferredCurrency?: string | null;
  country?: string | null;
  acceptLanguage?: string | null;
  activeCodes?: Iterable<string>;
};

export function isExchangeRateStale(updatedAt: Date, now = new Date()): boolean {
  const ageMs = now.getTime() - updatedAt.getTime();
  return ageMs > STALE_RATE_HOURS * 60 * 60 * 1000;
}

export async function listActiveCurrencies(): Promise<CurrencyWithRate[]> {
  return prisma.currency.findMany({
    where: { isActive: true },
    include: { exchangeRate: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function pickResolvableCurrencyCode(
  candidate: string | null | undefined,
  activeCodes: Set<string>
): string | null {
  if (!candidate?.trim()) {
    return null;
  }

  const code = candidate.trim().toUpperCase();
  return activeCodes.has(code) ? code : null;
}

export function resolveCurrencyCode(input: ResolveCurrencyInput): string {
  const activeCodes = new Set(
    input.activeCodes ? [...input.activeCodes].map((code) => code.toUpperCase()) : [DEFAULT_CURRENCY_CODE]
  );

  const candidates = [
    input.queryCurrency,
    input.cookieCurrency,
    input.preferredCurrency,
    mapCountryToCurrency(input.country),
    mapAcceptLanguageToCurrency(input.acceptLanguage),
    DEFAULT_CURRENCY_CODE,
  ];

  for (const candidate of candidates) {
    const resolved = pickResolvableCurrencyCode(candidate, activeCodes);
    if (resolved) {
      return resolved;
    }
  }

  return DEFAULT_CURRENCY_CODE;
}

export async function getCurrencyContext(code: string): Promise<CurrencyContext | null> {
  const currency = await prisma.currency.findFirst({
    where: { code: code.toUpperCase(), isActive: true },
    include: { exchangeRate: true },
  });

  if (!currency) {
    return null;
  }

  const rateToInr =
    currency.code === DEFAULT_CURRENCY_CODE
      ? new Prisma.Decimal(1)
      : currency.exchangeRate?.rateToInr;

  if (!rateToInr) {
    return null;
  }

  const rateUpdatedAt = currency.exchangeRate?.updatedAt ?? currency.updatedAt;

  return {
    code: currency.code,
    symbol: currency.symbol,
    decimalDigits: currency.decimalDigits,
    rateToInr,
    rateUpdatedAt,
    rateStale: isExchangeRateStale(rateUpdatedAt),
  };
}

export async function resolveDisplayCurrency(
  input: ResolveCurrencyInput
): Promise<{ code: string; context: CurrencyContext }> {
  const currencies = await listActiveCurrencies();
  const activeCodes = currencies.map((currency) => currency.code);
  const code = resolveCurrencyCode({ ...input, activeCodes });

  const context = await getCurrencyContext(code);
  if (context) {
    return { code, context };
  }

  const inrContext = await getCurrencyContext(DEFAULT_CURRENCY_CODE);
  if (!inrContext) {
    throw new Error("INR currency is not configured. Run npm run db:seed:currencies.");
  }

  return { code: DEFAULT_CURRENCY_CODE, context: inrContext };
}

export async function resolveCartCurrencyFromRequest(
  request: NextRequest,
  userId: string
): Promise<{ code: string; context: CurrencyContext }> {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { preferredCurrency: true, country: true },
  });

  return resolveDisplayCurrency({
    queryCurrency: request.nextUrl.searchParams.get("currency"),
    cookieCurrency: getCurrencyCookieFromRequest(request),
    preferredCurrency: profile?.preferredCurrency,
    country: profile?.country,
    acceptLanguage: request.headers.get("accept-language"),
  });
}

export type PublicCurrencyRow = {
  code: string;
  symbol: string;
  name: string;
  decimalDigits: number;
  isRazorpaySupported: boolean;
  sortOrder: number;
  rateToInr: number | null;
  rateUpdatedAt: string | null;
  rateStale: boolean;
};

export async function listPublicCurrencies(): Promise<{
  currencies: PublicCurrencyRow[];
  defaultCurrency: string;
  staleRateHours: number;
  disclaimer: string;
}> {
  const currencies = await listActiveCurrencies();

  return {
    currencies: currencies.map((currency) => ({
      code: currency.code,
      symbol: currency.symbol,
      name: currency.name,
      decimalDigits: currency.decimalDigits,
      isRazorpaySupported: currency.isRazorpaySupported,
      sortOrder: currency.sortOrder,
      rateToInr:
        currency.code === DEFAULT_CURRENCY_CODE
          ? 1
          : currency.exchangeRate
            ? currency.exchangeRate.rateToInr.toNumber()
            : null,
      rateUpdatedAt: currency.exchangeRate?.updatedAt.toISOString() ?? null,
      rateStale: currency.exchangeRate
        ? isExchangeRateStale(currency.exchangeRate.updatedAt)
        : false,
    })),
    defaultCurrency: DEFAULT_CURRENCY_CODE,
    staleRateHours: STALE_RATE_HOURS,
    disclaimer: CART_RATE_DISCLAIMER,
  };
}
