"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { buildShopUrl } from "@/lib/shop/shop-url";

type NavSearchProps = {
  className?: string;
  placeholder?: string;
};

export function NavSearch({
  className = "",
  placeholder = "Search products, brands, categories…",
}: NavSearchProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    router.push(buildShopUrl(trimmed ? { search: trimmed } : {}));
  };

  return (
    <form onSubmit={onSubmit} className={className}>
      <label className="sr-only" htmlFor="nav-search">
        Search products
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          id="nav-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="h-11 w-full rounded-full border border-border bg-slate-50/80 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </form>
  );
}
