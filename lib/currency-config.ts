export const CURRENCY_COOKIE_NAME = "display-currency";

/** Q4b: show stale-rate banner after this many hours; checkout is not blocked. */
export const STALE_RATE_HOURS = 48;

export const CART_RATE_DISCLAIMER =
  "Prices shown using today's exchange rate. Final amount is confirmed when you place your order.";

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  AED: "د.إ",
  EUR: "€",
};

const CURRENCY_NAMES: Record<string, string> = {
  INR: "Indian Rupee",
  USD: "US Dollar",
  GBP: "British Pound",
  AED: "UAE Dirham",
  EUR: "Euro",
};

export function getCurrencySymbol(code: string): string {
  return CURRENCY_SYMBOLS[code.toUpperCase()] ?? code.toUpperCase();
}

export function getCurrencyDisplayName(code: string): string {
  const upper = code.toUpperCase();
  return CURRENCY_NAMES[upper] ?? upper;
}

export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  india: "INR",
  "united states": "USD",
  "united states of america": "USD",
  usa: "USD",
  us: "USD",
  "united kingdom": "GBP",
  uk: "GBP",
  "great britain": "GBP",
  "united arab emirates": "AED",
  uae: "AED",
};

export function mapCountryToCurrency(country: string | null | undefined): string | null {
  if (!country?.trim()) {
    return null;
  }
  return COUNTRY_TO_CURRENCY[country.trim().toLowerCase()] ?? null;
}

const LOCALE_TO_CURRENCY: Record<string, string> = {
  "en-in": "INR",
  "hi-in": "INR",
  "en-us": "USD",
  "en-gb": "GBP",
  "en-ae": "AED",
};

export function mapAcceptLanguageToCurrency(
  acceptLanguage: string | null | undefined
): string | null {
  if (!acceptLanguage?.trim()) {
    return null;
  }

  const first = acceptLanguage.split(",")[0]?.trim().toLowerCase();
  if (!first) {
    return null;
  }

  return LOCALE_TO_CURRENCY[first] ?? null;
}
