import { cookies, headers } from "next/headers";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency-config";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/jwt";
import {
  listPublicCurrencies,
  resolveDisplayCurrency,
  type CurrencyContext,
  type PublicCurrencyRow,
} from "@/lib/services/currency";

export type ServerCurrencyBundle = {
  context: CurrencyContext;
  currencies: PublicCurrencyRow[];
  defaultCurrency: string;
  staleRateHours: number;
  disclaimer: string;
};

/**
 * Resolve display currency for SSR pages (layout, shop, home, product, cart).
 */
export async function getServerDisplayCurrency(): Promise<{
  code: string;
  context: CurrencyContext;
}> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const token = cookieStore.get("auth-token")?.value;

  let preferredCurrency: string | null = null;
  let country: string | null = null;

  if (token) {
    try {
      const payload = await verifyToken(token);
      if (payload?.sub) {
        const profile = await prisma.userProfile.findUnique({
          where: { userId: payload.sub },
          select: { preferredCurrency: true, country: true },
        });
        preferredCurrency = profile?.preferredCurrency ?? null;
        country = profile?.country ?? null;
      }
    } catch {
      // ignore invalid token
    }
  }

  return resolveDisplayCurrency({
    cookieCurrency: cookieStore.get(CURRENCY_COOKIE_NAME)?.value ?? null,
    preferredCurrency,
    country,
    acceptLanguage: headerStore.get("accept-language"),
  });
}

export async function getServerCurrencyBundle(): Promise<ServerCurrencyBundle> {
  const [{ context }, publicList] = await Promise.all([
    getServerDisplayCurrency(),
    listPublicCurrencies(),
  ]);

  return {
    context,
    currencies: publicList.currencies,
    defaultCurrency: publicList.defaultCurrency,
    staleRateHours: publicList.staleRateHours,
    disclaimer: publicList.disclaimer,
  };
}
