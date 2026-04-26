"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Category } from "./types";
import { SectionHeader } from "./section-header";
import { Card } from "./ui/card";
import { SectionContainer } from "./ui/section-container";

type CategorySectionProps = {
  categories: Category[];
};

export function CategorySection({ categories }: CategorySectionProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByAmount = (direction: "left" | "right") => {
    if (!scrollerRef.current) return;
    const amount = Math.max(280, Math.floor(scrollerRef.current.clientWidth * 0.7));
    scrollerRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <SectionContainer className="relative px-4 sm:px-6 lg:px-8">
      <SectionHeader title="Shop By Category" />

      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollByAmount("left")}
        className="absolute left-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-neutral-50 md:flex lg:left-3"
      >
        ‹
      </button>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category) => (
          <CategoryCard key={category.name} category={category} />
        ))}
      </div>

      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollByAmount("right")}
        className="absolute right-2 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-neutral-50 md:flex lg:right-3"
      >
        ›
      </button>
    </SectionContainer>
  );
}

type CategoryCardProps = {
  category: Category;
};

function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/shop?category=${encodeURIComponent(category.slug)}`} className="block snap-start">
      <Card
        as="article"
        className="flex h-full min-h-[220px] min-w-[280px] rounded-2xl border border-neutral-200 p-4 transition hover:shadow-sm sm:min-w-[300px]"
      >
      <div className="flex w-full items-start gap-4">
        <div
          className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border text-4xl ${category.imageTintClass}`}
        >
          <span aria-hidden="true">{category.emoji}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="min-h-10 text-xs font-bold uppercase tracking-wide text-slate-900 sm:text-sm">
            {category.name}
          </h3>

          <ul className="mt-2 min-h-24 space-y-1.5">
            {category.items.map((item) => (
              <li key={item} className="truncate text-xs text-slate-500 sm:text-sm">
                <span className="mr-1 text-slate-400">›</span>
                {item}
              </li>
            ))}
          </ul>

          <span className="mt-auto inline-block text-xs font-bold text-emerald-600 transition hover:text-emerald-700 sm:text-sm">
            Show All »
          </span>
        </div>
      </div>
      </Card>
    </Link>
  );
}
