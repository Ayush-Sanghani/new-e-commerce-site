"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useRef } from "react";
import { buildShopUrl } from "@/lib/shop/shop-url";
import type { Category } from "./types";
import { SectionHeader } from "./section-header";
import { SectionContainer } from "./ui/section-container";

type CategorySectionProps = {
  categories: Category[];
};

export function CategorySection({ categories }: CategorySectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollerRef.current) return;
    const amount = Math.max(280, Math.floor(scrollerRef.current.clientWidth * 0.75));
    scrollerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Shop By Category"
          subtitle="Browse curated collections"
          actionLabel="View all"
          actionHref="/shop"
        />

        <div className="relative">
          <button
            type="button"
            aria-label="Scroll categories left"
            onClick={() => scrollByAmount("left")}
            className="absolute -left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-xl shadow-premium transition hover:shadow-premium-hover md:flex"
          >
            ‹
          </button>

          <div
            ref={scrollerRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {categories.map((category, index) => (
              <CategoryCard key={category.slug} category={category} index={index} />
            ))}
          </div>

          <button
            type="button"
            aria-label="Scroll categories right"
            onClick={() => scrollByAmount("right")}
            className="absolute -right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-xl shadow-premium transition hover:shadow-premium-hover md:flex"
          >
            ›
          </button>
        </div>
      </div>
    </SectionContainer>
  );
}

function CategoryCard({ category, index }: { category: Category; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="snap-start"
    >
      <Link
        href={buildShopUrl({ category: category.slug })}
        className="group block w-[200px] sm:w-[220px]"
      >
        <article
          className={`overflow-hidden rounded-2xl border border-border shadow-premium transition duration-300 hover:-translate-y-1 hover:shadow-premium-hover ${category.imageTintClass}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden">
            <img
              src={category.imageUrl}
              alt={category.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
          <div className="bg-white p-4 text-center">
            <h3 className="text-sm font-bold text-slate-900 sm:text-base">{category.name}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {category.productCount} Products
            </p>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
