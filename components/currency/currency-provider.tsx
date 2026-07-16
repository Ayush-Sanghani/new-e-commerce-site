"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { PublicCurrencyRow } from "@/lib/services/currency";

export type CurrencyProviderValue = {
  code: string;
  symbol: string;
  decimalDigits: number;
  rateToInr: number;
  rateUpdatedAt: string;
  rateStale: boolean;
  disclaimer: string;
  currencies: PublicCurrencyRow[];
  isChanging: boolean;
  setCurrency: (code: string) => Promise<void>;
};

const CurrencyContext = createContext<CurrencyProviderValue | null>(null);

export type CurrencyProviderProps = {
  children: ReactNode;
  initialCode: string;
  initialSymbol: string;
  initialDecimalDigits: number;
  initialRateToInr: number;
  initialRateUpdatedAt: string;
  initialRateStale: boolean;
  disclaimer: string;
  currencies: PublicCurrencyRow[];
};

export function CurrencyProvider({
  children,
  initialCode,
  initialSymbol,
  initialDecimalDigits,
  initialRateToInr,
  initialRateUpdatedAt,
  initialRateStale,
  disclaimer,
  currencies,
}: CurrencyProviderProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [code, setCode] = useState(initialCode);
  const [symbol, setSymbol] = useState(initialSymbol);
  const [decimalDigits, setDecimalDigits] = useState(initialDecimalDigits);
  const [rateToInr, setRateToInr] = useState(initialRateToInr);
  const [rateUpdatedAt, setRateUpdatedAt] = useState(initialRateUpdatedAt);
  const [rateStale, setRateStale] = useState(initialRateStale);

  useEffect(() => {
    setCode(initialCode);
    setSymbol(initialSymbol);
    setDecimalDigits(initialDecimalDigits);
    setRateToInr(initialRateToInr);
    setRateUpdatedAt(initialRateUpdatedAt);
    setRateStale(initialRateStale);
  }, [
    initialCode,
    initialSymbol,
    initialDecimalDigits,
    initialRateToInr,
    initialRateUpdatedAt,
    initialRateStale,
  ]);

  const setCurrency = useCallback(
    async (nextCode: string) => {
      const normalized = nextCode.trim().toUpperCase();
      if (!normalized || normalized === code) return;

      const row = currencies.find((c) => c.code === normalized);
      if (!row || row.rateToInr == null) return;

      setIsSaving(true);
      try {
        const res = await fetch("/api/currency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currency: normalized }),
        });
        if (!res.ok) return;

        setCode(row.code);
        setSymbol(row.symbol);
        setDecimalDigits(row.decimalDigits);
        setRateToInr(row.rateToInr);
        setRateUpdatedAt(row.rateUpdatedAt ?? new Date().toISOString());
        setRateStale(row.rateStale);

        startTransition(() => {
          router.refresh();
        });
      } finally {
        setIsSaving(false);
      }
    },
    [code, currencies, router]
  );

  const value = useMemo<CurrencyProviderValue>(
    () => ({
      code,
      symbol,
      decimalDigits,
      rateToInr,
      rateUpdatedAt,
      rateStale,
      disclaimer,
      currencies,
      isChanging: isSaving || isPending,
      setCurrency,
    }),
    [
      code,
      symbol,
      decimalDigits,
      rateToInr,
      rateUpdatedAt,
      rateStale,
      disclaimer,
      currencies,
      isSaving,
      isPending,
      setCurrency,
    ]
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyProviderValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}

export function useCurrencyOptional(): CurrencyProviderValue | null {
  return useContext(CurrencyContext);
}
