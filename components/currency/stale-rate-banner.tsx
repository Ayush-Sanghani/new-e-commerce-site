"use client";

import { useCurrency } from "./currency-provider";

export function StaleRateBanner() {
  const { rateStale, rateUpdatedAt, code, disclaimer } = useCurrency();

  if (!rateStale || code === "INR") {
    return null;
  }

  const updatedLabel = (() => {
    try {
      return new Date(rateUpdatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return rateUpdatedAt;
    }
  })();

  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 text-amber-950"
    >
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-0.5 px-4 py-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-sm lg:px-8">
        <p className="font-medium">
          Exchange rates were last updated on {updatedLabel}. Amounts in {code} may differ
          slightly at checkout.
        </p>
        <p className="text-amber-800/90">{disclaimer}</p>
      </div>
    </div>
  );
}
