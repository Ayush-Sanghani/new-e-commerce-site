"use client";

import { useCurrency } from "./currency-provider";

type CurrencySwitcherProps = {
  className?: string;
  compact?: boolean;
};

export function CurrencySwitcher({ className = "", compact = false }: CurrencySwitcherProps) {
  const { code, currencies, isChanging, setCurrency } = useCurrency();

  const options = currencies.filter((c) => c.rateToInr != null);

  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">Currency</span>
      <select
        value={code}
        disabled={isChanging || options.length === 0}
        onChange={(e) => {
          void setCurrency(e.target.value);
        }}
        aria-label="Select display currency"
        className={`rounded-xl border border-neutral-200 bg-white text-slate-700 transition hover:border-neutral-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-wait disabled:opacity-60 ${
          compact
            ? "h-9 max-w-[5.5rem] px-2 text-xs font-semibold"
            : "h-10 min-w-[4.5rem] px-2.5 text-sm font-semibold"
        }`}
      >
        {options.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code}
          </option>
        ))}
      </select>
    </label>
  );
}
