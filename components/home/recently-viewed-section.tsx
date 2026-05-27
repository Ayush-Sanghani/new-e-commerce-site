"use client";

import { useEffect, useState } from "react";
import type { HomeProduct } from "./types";
import { HomeProductCard } from "./home-product-card";
import { SectionHeader } from "./section-header";
import { SectionContainer } from "./ui/section-container";
import { getRecentlyViewedIds } from "@/lib/wishlist-storage";

type RecentlyViewedSectionProps = {
  catalog: HomeProduct[];
};

export function RecentlyViewedSection({ catalog }: RecentlyViewedSectionProps) {
  const [products, setProducts] = useState<HomeProduct[]>([]);

  useEffect(() => {
    const ids = getRecentlyViewedIds();
    const matched = ids
      .map((id) => catalog.find((p) => p.id === id))
      .filter((p): p is HomeProduct => Boolean(p))
      .slice(0, 4);
    setProducts(matched);
  }, [catalog]);

  if (products.length === 0) return null;

  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Recently Viewed" subtitle="Pick up where you left off" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {products.map((product, index) => (
            <HomeProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
