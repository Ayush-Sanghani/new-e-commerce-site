import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { DEFAULT_CURRENCY_CODE } from "@/lib/money";

const FRANKFURTER_BASE_URL = "https://api.frankfurter.app/latest";

type FrankfurterResponse = {
  amount: number;
  base: string;
  date: string;
  rates: Record<string, number>;
};

export type RefreshExchangeRatesResult = {
  success: boolean;
  message: string;
  updated: string[];
  skipped: string[];
  errors: string[];
};

async function fetchRateToInr(code: string): Promise<number | null> {
  const url = `${FRANKFURTER_BASE_URL}?from=${encodeURIComponent(code)}&to=INR`;
  const response = await fetch(url);

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as FrankfurterResponse;
  const rate = payload.rates?.INR;
  return typeof rate === "number" && Number.isFinite(rate) && rate > 0 ? rate : null;
}

export async function refreshExchangeRatesFromApi(): Promise<RefreshExchangeRatesResult> {
  const currencies = await prisma.currency.findMany({
    where: { isActive: true, code: { not: DEFAULT_CURRENCY_CODE } },
    include: { exchangeRate: true },
    orderBy: { sortOrder: "asc" },
  });

  const updated: string[] = [];
  const skipped: string[] = [];
  const errors: string[] = [];

  for (const currency of currencies) {
    try {
      const rate = await fetchRateToInr(currency.code);
      if (rate == null) {
        errors.push(`${currency.code}: FX API returned no INR rate`);
        continue;
      }

      const rateToInr = new Prisma.Decimal(rate);

      await prisma.exchangeRate.upsert({
        where: { currencyId: currency.id },
        create: {
          currencyId: currency.id,
          rateToInr,
        },
        update: {
          rateToInr,
        },
      });

      updated.push(currency.code);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errors.push(`${currency.code}: ${message}`);
    }
  }

  const inr = await prisma.currency.findUnique({
    where: { code: DEFAULT_CURRENCY_CODE },
    select: { id: true },
  });

  if (inr) {
    await prisma.exchangeRate.upsert({
      where: { currencyId: inr.id },
      create: {
        currencyId: inr.id,
        rateToInr: new Prisma.Decimal(1),
      },
      update: {
        rateToInr: new Prisma.Decimal(1),
      },
    });
    updated.push(DEFAULT_CURRENCY_CODE);
  } else {
    skipped.push(DEFAULT_CURRENCY_CODE);
  }

  return {
    success: errors.length === 0,
    message:
      errors.length === 0
        ? `Exchange rates refreshed (${updated.length} currencies).`
        : `Exchange rates partially refreshed (${updated.length} updated, ${errors.length} errors).`,
    updated,
    skipped,
    errors,
  };
}
