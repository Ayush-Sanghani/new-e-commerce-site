"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { getWishlistIds } from "@/lib/wishlist-storage";

type WishlistNavLinkProps = {
  className?: string;
};

export function WishlistNavLink({ className = "" }: WishlistNavLinkProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sync = () => setCount(getWishlistIds().length);
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("wishlist-updated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("wishlist-updated", sync);
    };
  }, []);

  return (
    <Link
      href="/shop"
      className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-primary ${className}`}
      aria-label={`Wishlist${count > 0 ? `, ${count} items` : ""}`}
      title="Wishlist"
    >
      <Heart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
    </Link>
  );
}
