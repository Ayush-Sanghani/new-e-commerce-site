import Link from "next/link";
import { LogoutButton } from "@/app/home/logout-button";
import type { CategoryGroup } from "./types";

type HomeHeaderProps = {
  displayName: string;
  categoryGroups: CategoryGroup[];
  cartCount?: number;
  isAuthenticated?: boolean;
};

function formatCartCount(count: number): string {
  if (count > 99) return "99+";
  return String(count);
}

export function HomeHeader({
  displayName,
  categoryGroups,
  cartCount = 0,
  isAuthenticated = true,
}: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
            🛍️
          </div>
          <p className="text-lg font-bold tracking-tight">DummyMart</p>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a href="/home" className="text-blue-700">
            Home
          </a>
          <Link href="/shop" className="transition-colors hover:text-slate-900">
            Shop
          </Link>
            <details className="group relative">
            <summary className="list-none cursor-pointer transition-colors hover:text-slate-900">
              Categories
            </summary>
            <div className="absolute left-0 top-8 z-50 hidden min-w-[620px] rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg group-open:block">
              <div className="grid grid-cols-2 gap-4">
                {categoryGroups.map((group) => (
                  <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                      {group.title}
                    </p>
                    <ul className="space-y-1.5">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <a
                            href={`/shop?category=${item.slug}`}
                            className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                          >
                            {item.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </details>
          <Link href="/contact" className="transition-colors hover:text-slate-900">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="/cart"
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-slate-700 transition-colors hover:bg-neutral-100"
            aria-label="Open cart"
            title="Cart"
          >
            <span aria-hidden>🛒</span>
            {cartCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
                {formatCartCount(cartCount)}
              </span>
            ) : null}
          </a>

          {isAuthenticated ? (
            <>
              <Link
                href="/account"
                className="hidden h-9 w-9 items-center justify-center rounded-full border border-neutral-200 bg-blue-50 text-sm text-blue-700 transition-colors hover:bg-blue-100 sm:inline-flex"
                aria-label={`Open ${displayName} profile`}
                title="My Account"
              >
                <span aria-hidden>👤</span>
              </Link>
              <LogoutButton />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-300 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-neutral-100"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
              >
                Register
              </Link>
            </div>
          )}

          <details className="relative md:hidden">
            <summary className="grid h-9 w-9 list-none place-items-center rounded-lg border border-neutral-200 text-slate-700">
              ☰
            </summary>
            <div className="absolute right-0 top-11 z-50 w-[84vw] max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
              <nav className="space-y-3 text-sm font-medium text-slate-700">
                <a href="/home" className="block text-blue-700">
                  Home
                </a>
                <Link href="/shop" className="block transition-colors hover:text-slate-900">
                  Shop
                </Link>
                {isAuthenticated ? (
                  <Link href="/account" className="block transition-colors hover:text-slate-900">
                    Account
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="block transition-colors hover:text-slate-900">
                      Login
                    </Link>
                    <Link href="/register" className="block transition-colors hover:text-slate-900">
                      Register
                    </Link>
                  </>
                )}
                <Link href="/contact" className="block transition-colors hover:text-slate-900">
                  Contact
                </Link>
              </nav>

              <div className="mt-4 border-t border-neutral-200 pt-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-700">
                  Categories
                </p>
                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                  {categoryGroups.map((group) => (
                    <div key={group.title}>
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {group.title}
                      </p>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item.slug}>
                            <a
                              href={`/shop?category=${item.slug}`}
                              className="text-sm text-slate-600 transition-colors hover:text-slate-900"
                            >
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
