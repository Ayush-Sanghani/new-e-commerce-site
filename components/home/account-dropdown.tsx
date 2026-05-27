"use client";

import Link from "next/link";
import { ChevronDown, LogOut, Package, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AccountDropdownProps = {
  displayName: string;
  isAuthenticated: boolean;
};

export function AccountDropdown({ displayName, isAuthenticated }: AccountDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/home");
    router.refresh();
  };

  if (!isAuthenticated) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Link
          href="/login"
          className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
        >
          Register
        </Link>
      </div>
    );
  }

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-white px-3 text-sm font-medium text-slate-700 transition hover:border-primary/40 hover:shadow-sm"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {initial}
        </span>
        <span className="max-w-[100px] truncate">{displayName}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-12 z-50 min-w-[200px] overflow-hidden rounded-xl border border-border bg-white py-1 shadow-premium-hover"
        >
          <Link
            href="/account"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <User className="h-4 w-4" />
            My Account
          </Link>
          <Link
            href="/orders"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <Package className="h-4 w-4" />
            My Orders
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void handleLogout()}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
