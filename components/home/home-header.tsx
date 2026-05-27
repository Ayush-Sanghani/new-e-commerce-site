import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { buildShopUrl } from "@/lib/shop/shop-url";
import type { CategoryGroup } from "./types";
import { AccountDropdown } from "./account-dropdown";
import { NavSearch } from "./nav-search";
import { WishlistNavLink } from "./wishlist-nav-link";

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
    <header className="sticky top-0 z-50 border-b border-border/80 bg-white/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center gap-3 lg:gap-6">
          <Link href="/home" className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-md">
              DM
            </div>
            <span className="hidden text-xl font-bold tracking-tight text-slate-900 sm:block">
              DummyMart
            </span>
          </Link>

          <NavSearch className="hidden min-w-0 flex-1 lg:block lg:max-w-xl xl:max-w-2xl" />

          <nav className="hidden items-center gap-1 xl:flex">
            <Link
              href="/home"
              className="rounded-lg px-3 py-2 text-sm font-medium text-primary"
            >
              Home
            </Link>
            <Link
              href="/shop"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Shop
            </Link>
            <details className="group relative">
              <summary className="list-none cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                Categories
              </summary>
              <div className="absolute left-0 top-full z-50 hidden min-w-[640px] rounded-2xl border border-border bg-white p-5 shadow-premium-hover group-open:block">
                <div className="grid grid-cols-2 gap-6">
                  {categoryGroups.map((group) => (
                    <div key={group.title}>
                      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                        {group.title}
                      </p>
                      <ul className="space-y-1.5">
                        {group.items.map((item) => (
                          <li key={item.slug}>
                            <Link
                              href={buildShopUrl({ category: item.slug })}
                              className="text-sm text-slate-600 transition hover:text-primary"
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
            </details>
            <Link
              href="/contact"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              Contact
            </Link>
          </nav>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <WishlistNavLink />
            <Link
              href="/cart"
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary"
              aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ""}`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                  {formatCartCount(cartCount)}
                </span>
              ) : null}
            </Link>
            <AccountDropdown displayName={displayName} isAuthenticated={isAuthenticated} />
            <MobileMenu
              categoryGroups={categoryGroups}
              isAuthenticated={isAuthenticated}
              displayName={displayName}
            />
          </div>
        </div>

        <div className="pb-3 lg:hidden">
          <NavSearch />
        </div>
      </div>
    </header>
  );
}

function MobileMenu({
  categoryGroups,
  isAuthenticated,
  displayName,
}: {
  categoryGroups: CategoryGroup[];
  isAuthenticated: boolean;
  displayName: string;
}) {
  return (
    <details className="relative sm:hidden">
      <summary className="grid h-10 w-10 list-none cursor-pointer place-items-center rounded-xl border border-border text-slate-700">
        <span className="sr-only">Menu</span>
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </summary>
      <div className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,320px)] rounded-2xl border border-border bg-white p-4 shadow-premium-hover">
        <nav className="space-y-1 text-sm font-medium">
          <Link href="/home" className="block rounded-lg px-3 py-2 text-primary">
            Home
          </Link>
          <Link href="/shop" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
            Shop
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/account" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
                Account ({displayName})
              </Link>
              <Link href="/orders" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
                My Orders
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-50">
                Login
              </Link>
              <Link href="/register" className="block rounded-lg px-3 py-2 text-primary hover:bg-primary/5">
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
    </details>
  );
}
