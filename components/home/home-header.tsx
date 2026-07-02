import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { CategoryGroup } from "./types";
import { AccountDropdown } from "./account-dropdown";
import { MobileMenu } from "./mobile-menu";
import {
  HeaderSearchDesktop,
  HeaderSearchMobilePanel,
  HeaderSearchMobileTrigger,
  HeaderSearchProvider,
} from "./header-search";
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
      <HeaderSearchProvider>
        <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center gap-3 lg:gap-6">
            <Link href="/home" className="flex shrink-0 items-center gap-2.5 transition hover:opacity-90">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-md">
                VP
              </div>
              <span className="hidden text-xl font-bold tracking-tight text-slate-900 sm:block">
                VrajPharma
              </span>
            </Link>

            <HeaderSearchDesktop />

            <nav className="hidden items-center gap-1 xl:ml-auto xl:flex">
              <Link
                href="/home"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Home
              </Link>
              <Link
                href="/shop"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Shop
              </Link>
              <Link
                href="/contact"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
              >
                Contact
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-1 sm:gap-2 xl:ml-4">
              <HeaderSearchMobileTrigger />
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

          <HeaderSearchMobilePanel />
        </div>
      </HeaderSearchProvider>
    </header>
  );
}

