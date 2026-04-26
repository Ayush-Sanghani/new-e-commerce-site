"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HomeButton } from "./ui/button";
import { SectionContainer } from "./ui/section-container";

export type HeroSlide = {
  id: string;
  preTitle: string;
  title: string;
  priceText: string;
  bgClassName: string;
  accent: string;
  imageUrl: string;
  ctaHref?: string;
};

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide-1",
    preTitle: "fresh & healthy",
    title: "Organic Fruits",
    priceText: "starting at $29.99",
    bgClassName: "from-amber-400 via-orange-500 to-rose-500",
    accent: "Fruits",
    imageUrl:
      "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "slide-2",
    preTitle: "Organic & healthy",
    title: "Fresh Vegetables",
    priceText: "starting at $20.00",
    bgClassName: "from-emerald-400 via-green-500 to-teal-600",
    accent: "Veggies",
    imageUrl:
      "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=80",
  },
];

type HeroSectionProps = {
  slides?: HeroSlide[];
};

export function HeroSection({ slides }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesToShow = slides && slides.length > 0 ? slides : HERO_SLIDES;
  const totalSlides = slidesToShow.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 7000);

    return () => clearInterval(timer);
  }, [totalSlides]);

  useEffect(() => {
    if (activeIndex >= totalSlides) {
      setActiveIndex(0);
    }
  }, [activeIndex, totalSlides]);

  const activeSlide = useMemo(() => slidesToShow[activeIndex], [activeIndex, slidesToShow]);

  return (
    <SectionContainer>
      <div
        className={`relative min-h-[430px] overflow-hidden bg-gradient-to-r px-5 py-8 text-white shadow-lg transition-all duration-700 sm:min-h-[500px] sm:px-8 sm:py-10 lg:min-h-[560px] lg:px-12 lg:py-12 ${activeSlide.bgClassName}`}
      >
        <img
          src={activeSlide.imageUrl}
          alt={activeSlide.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/30 to-black/20" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-black/20 blur-2xl" />

        <div className="relative z-10 flex min-h-[inherit] flex-col justify-between gap-8">
          <div className="grid items-start gap-6">
            <div className="max-w-2xl">
              <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide sm:text-xs">
                {activeSlide.preTitle}
              </p>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
                {activeSlide.title}
              </h1>
              <p className="mt-3 text-sm text-white/90 sm:mt-4 sm:text-base md:text-lg">
                {activeSlide.priceText}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-7">
                <Link href={activeSlide.ctaHref ?? "/shop"} className="w-full sm:w-auto">
                  <HomeButton className="w-full bg-white text-slate-900 hover:bg-slate-100 sm:w-auto">
                    Shop Now
                  </HomeButton>
                </Link>
              </div>
            </div>
          </div>

          <div className="self-start rounded-xl bg-black/30 px-4 py-3 text-left backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/80">Now Trending</p>
            <p className="mt-1 text-2xl font-bold">{activeSlide.accent}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {slidesToShow.map((slide, idx) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    idx === activeIndex ? "w-8 bg-white" : "w-2.5 bg-white/50 hover:bg-white/75"
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={() => setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides)}
                className="rounded-xl border border-white/40 bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                Prev
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={() => setActiveIndex((prev) => (prev + 1) % totalSlides)}
                className="rounded-xl border border-white/40 bg-white/10 px-3 py-2 text-sm font-semibold transition hover:bg-white/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
