"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildShopUrl } from "@/lib/shop/shop-url";
import type { CategoryGroup } from "./types";

type MobileMenuProps = {
  categoryGroups: CategoryGroup[];
  isAuthenticated: boolean;
  displayName: string;
};

export function MobileMenu({
  categoryGroups,
  isAuthenticated,
  displayName,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div ref={ref} className="relative sm:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="grid h-10 w-10 place-items-center rounded-xl border border-border text-slate-700"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          {open ? (
            <path strokeLinecap="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,320px)] rounded-2xl border border-border bg-white p-4 shadow-premium-hover"
        >
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/home"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-primary"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={close}
              className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
            >
              Shop
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/account"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Account ({displayName})
                </Link>
                <Link
                  href="/orders"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  My Orders
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={close}
                  className="block rounded-lg px-3 py-2 text-primary hover:bg-primary/5"
                >
                  Register
                </Link>
              </>
            )}
          </nav>
          <div className="mt-4 max-h-48 overflow-y-auto border-t border-border pt-4">
            <p className="mb-2 text-xs font-bold uppercase text-primary">Categories</p>
            {categoryGroups.map((group) => (
              <div key={group.title} className="mb-3">
                <p className="text-[11px] font-semibold text-slate-500">{group.title}</p>
                <ul className="mt-1 space-y-0.5">
                  {group.items.slice(0, 4).map((item) => (
                    <li key={item.slug}>
                      <Link
                        href={buildShopUrl({ category: item.slug })}
                        onClick={close}
                        className="text-sm text-slate-600 hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
