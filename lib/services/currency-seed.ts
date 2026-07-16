import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export type CurrencySeedRow = {
  code: string;
  symbol: string;
  name: string;
  decimalDigits: number;
  isRazorpaySupported: boolean;
  sortOrder: number;
  /** 1 unit of this currency = X INR */
  rateToInr: number;
};

/** v1 currencies — rates are dev placeholders until daily FX cron (Phase 2+). */
export const DEFAULT_CURRENCY_SEED: CurrencySeedRow[] = [
  {
    code: "INR",
    symbol: "₹",
    name: "Indian Rupee",
    decimalDigits: 2,
    isRazorpaySupported: true,
    sortOrder: 0,
    rateToInr: 1,
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    decimalDigits: 2,
    isRazorpaySupported: true,
    sortOrder: 1,
    rateToInr: 83.5,
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    decimalDigits: 2,
    isRazorpaySupported: true,
    sortOrder: 2,
    rateToInr: 105.25,
  },
  {
    code: "AED",
    symbol: "د.إ",
    name: "UAE Dirham",
    decimalDigits: 2,
    isRazorpaySupported: true,
    sortOrder: 3,
    rateToInr: 22.75,
  },
];

export type SeedCurrenciesResult = {
  success: boolean;
  message: string;
  created: number;
  updated: number;
};

export async function seedCurrencies(
  rows: CurrencySeedRow[] = DEFAULT_CURRENCY_SEED
): Promise<SeedCurrenciesResult> {
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = await prisma.currency.findUnique({
      where: { code: row.code },
      select: { id: true },
    });

    const currency = existing
      ? await prisma.currency.update({
          where: { code: row.code },
          data: {
            symbol: row.symbol,
            name: row.name,
            decimalDigits: row.decimalDigits,
            isRazorpaySupported: row.isRazorpaySupported,
            sortOrder: row.sortOrder,
            isActive: true,
          },
        })
      : await prisma.currency.create({
          data: {
            code: row.code,
            symbol: row.symbol,
            name: row.name,
            decimalDigits: row.decimalDigits,
            isRazorpaySupported: row.isRazorpaySupported,
            sortOrder: row.sortOrder,
            isActive: true,
          },
        });

    if (existing) {
      updated += 1;
    } else {
      created += 1;
    }

    const rateToInr = new Prisma.Decimal(row.rateToInr);

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
  }

  return {
    success: true,
    message: `Currencies seeded: ${created} created, ${updated} updated (${rows.length} total).`,
    created,
    updated,
  };
}
