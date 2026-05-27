"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { buildShopUrl } from "@/lib/shop/shop-url";
import type { FeaturedBrand } from "./types";
import { SectionHeader } from "./section-header";
import { SectionContainer } from "./ui/section-container";

type FeaturedBrandsSectionProps = {
  brands: FeaturedBrand[];
};

export function FeaturedBrandsSection({ brands }: FeaturedBrandsSectionProps) {
  return (
    <SectionContainer className="bg-slate-50/80">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Featured Brands"
          subtitle="Shop top names you trust"
          centered
        />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4">
          {brands.map((brand, index) => (
            <motion.div
              key={brand.name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
            >
              <Link
                href={buildShopUrl({ search: brand.search })}
                className="flex flex-col items-center justify-center rounded-2xl border border-border bg-white p-4 shadow-premium transition hover:-translate-y-0.5 hover:shadow-premium-hover sm:p-6"
              >
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {brand.logo}
                </span>
                <span className="mt-2 text-xs font-semibold text-slate-700 sm:text-sm">
                  {brand.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
