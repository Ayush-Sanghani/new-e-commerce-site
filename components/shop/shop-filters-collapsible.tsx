"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type ShopFiltersContextValue = {
  open: boolean;
  setOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  activeCount: number;
};

const ShopFiltersContext = createContext<ShopFiltersContextValue | null>(null);

function useShopFilters() {
  const ctx = useContext(ShopFiltersContext);
  if (!ctx) {
    throw new Error("ShopFilters components must be used within ShopFiltersProvider");
  }
  return ctx;
}

type ShopFiltersProviderProps = {
  children: ReactNode;
  defaultOpen?: boolean;
  activeCount?: number;
};

export function ShopFiltersProvider({
  children,
  defaultOpen = false,
  activeCount = 0,
}: ShopFiltersProviderProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <ShopFiltersContext.Provider value={{ open, setOpen, activeCount }}>
      {children}
    </ShopFiltersContext.Provider>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ShopFiltersToggle() {
  const { open, setOpen, activeCount } = useShopFilters();

  return (
    <button
      type="button"
      onClick={() => setOpen((prev) => !prev)}
      aria-expanded={open}
      aria-controls="shop-advanced-filters"
      className="inline-flex shrink-0 items-center justify-between gap-2 rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 sm:px-4"
    >
      <span className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="hidden sm:inline">Filters & sort</span>
        <span className="sm:hidden">Filters</span>
        {activeCount > 0 ? (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
            {activeCount}
          </span>
        ) : null}
      </span>
      <ChevronIcon open={open} />
    </button>
  );
}

export function ShopFiltersPanel({ children }: { children: ReactNode }) {
  const { open } = useShopFilters();

  if (!open) return null;

  return (
    <div id="shop-advanced-filters" className="pt-3">
      {children}
    </div>
  );
}
