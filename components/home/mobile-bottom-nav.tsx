"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid2X2, Heart, Home, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  cartCount?: number;
  isAuthenticated?: boolean;
};

export function MobileBottomNav({ cartCount = 0, isAuthenticated }: MobileBottomNavProps) {
  const pathname = usePathname();

  const items = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/shop", label: "Shop", icon: Grid2X2 },
    { href: "/shop", label: "Wishlist", icon: Heart },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cartCount },
    {
      href: isAuthenticated ? "/account" : "/login",
      label: "Account",
      icon: User,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white/95 px-2 py-2 backdrop-blur-md lg:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-lg items-center justify-around">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || (href === "/shop" && pathname?.startsWith("/shop"));
          return (
            <li key={label}>
              <Link
                href={href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium transition",
                  active ? "text-primary" : "text-slate-500"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.25 : 1.75} />
                {label}
                {badge && badge > 0 ? (
                  <span className="absolute right-1 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                    {badge > 9 ? "9+" : badge}
                  </span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
