"use client";

import { Search, X } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { shouldShowNavSearch } from "@/lib/nav/show-nav-search";
import { NavSearch } from "./nav-search";

type HeaderSearchContextValue = {
  show: boolean;
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
};

const HeaderSearchContext = createContext<HeaderSearchContextValue | null>(null);

function useHeaderSearch() {
  const ctx = useContext(HeaderSearchContext);
  if (!ctx) {
    throw new Error("HeaderSearch components must be used within HeaderSearchProvider");
  }
  return ctx;
}

export function HeaderSearchProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const show = shouldShowNavSearch(pathname);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const value = useMemo(
    () => ({ show, mobileOpen, toggleMobile, closeMobile }),
    [show, mobileOpen, toggleMobile, closeMobile],
  );

  return (
    <HeaderSearchContext.Provider value={value}>{children}</HeaderSearchContext.Provider>
  );
}

export function HeaderSearchDesktop() {
  const { show } = useHeaderSearch();
  if (!show) return null;

  return (
    <NavSearch
      inputId="nav-search-desktop"
      className="hidden min-w-0 flex-1 lg:block lg:max-w-xl xl:max-w-2xl"
    />
  );
}

export function HeaderSearchMobileTrigger() {
  const { show, mobileOpen, toggleMobile } = useHeaderSearch();
  if (!show) return null;

  return (
    <button
      type="button"
      onClick={toggleMobile}
      aria-expanded={mobileOpen}
      aria-controls="nav-search-mobile-panel"
      aria-label={mobileOpen ? "Close search" : "Open search"}
      className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary lg:hidden"
    >
      {mobileOpen ? <X className="h-5 w-5" aria-hidden /> : <Search className="h-5 w-5" aria-hidden />}
    </button>
  );
}

export function HeaderSearchMobilePanel() {
  const { show, mobileOpen, closeMobile } = useHeaderSearch();
  if (!show || !mobileOpen) return null;

  return (
    <div id="nav-search-mobile-panel" className="pb-3 lg:hidden">
      <NavSearch inputId="nav-search-mobile" autoFocus onSubmit={closeMobile} />
    </div>
  );
}
