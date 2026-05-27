"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Truck, Sparkles, Tag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { HomeButton } from "./ui/button";
import { SectionContainer } from "./ui/section-container";

export type HeroSlide = {
  id: string;
  preTitle: string;
  title: string;
  priceText: string;
  bgClassName: string;
  imageUrl: string;
  ctaHref?: string;
  exploreHref?: string;
};

/** Shown only when the server provides no slides (e.g. DB unavailable). */
const HERO_FALLBACK_SLIDES: HeroSlide[] = [
  {
    id: "fallback-1",
    preTitle: "Premium Collection",
    title: "MacBook Pro M4",
    priceText: "Starting from ₹89,999",
    bgClassName: "from-slate-900 via-slate-800 to-slate-900",
    imageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1400&q=80",
    ctaHref: "/shop?search=laptop",
    exploreHref: "/shop",
  },
  {
    id: "fallback-2",
    preTitle: "New Arrivals",
    title: "Summer Fashion 2026",
    priceText: "Up to 40% off selected styles",
    bgClassName: "from-slate-900 via-blue-950 to-slate-900",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
    ctaHref: "/shop?sort=latest",
    exploreHref: "/shop",
  },
];

const PROMO_BADGES = [
  { label: "Free Shipping", icon: Truck },
  { label: "Up to 40% OFF", icon: Tag },
  { label: "New Arrivals", icon: Sparkles },
];

type HeroSectionProps = {
  slides?: HeroSlide[];
};

export function HeroSection({ slides }: HeroSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slidesToShow = slides && slides.length > 0 ? slides : HERO_FALLBACK_SLIDES;
  const totalSlides = slidesToShow.length;

  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  useEffect(() => {
    if (totalSlides > 0 && activeIndex >= totalSlides) setActiveIndex(0);
  }, [activeIndex, totalSlides]);

  const activeSlide = useMemo(() => slidesToShow[activeIndex], [activeIndex, slidesToShow]);

  return (
    <SectionContainer className="!py-0">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div
          className={`relative min-h-[380px] overflow-hidden rounded-2xl bg-gradient-to-br shadow-premium-hover sm:min-h-[420px] lg:min-h-[480px] ${activeSlide.bgClassName}`}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={activeSlide.id}
              src={activeSlide.imageUrl}
              alt=""
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="relative z-10 flex min-h-[inherit] flex-col justify-center px-6 py-10 sm:px-10 sm:py-12 lg:px-14">
            <div className="mb-5 flex flex-wrap gap-2">
              {PROMO_BADGES.map(({ label, icon: Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                >
                  <Icon className="h-3.5 w-3.5 text-accent" />
                  {label}
                </span>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45 }}
                className="max-w-2xl"
              >
                <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">
                  {activeSlide.preTitle}
                </p>
                <h1 className="text-hero text-white">{activeSlide.title}</h1>
                <p className="mt-3 text-lg font-medium text-white/90 sm:text-xl md:text-2xl">
                  {activeSlide.priceText}
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={activeSlide.ctaHref ?? "/shop"}>
                    <HomeButton className="min-w-[140px] bg-white px-8 py-3 text-base text-slate-900 hover:bg-slate-100">
                      Shop Now
                    </HomeButton>
                  </Link>
                  <Link href={activeSlide.exploreHref ?? "/shop"}>
                    <HomeButton variant="secondary" className="min-w-[140px] px-8 py-3 text-base">
                      Explore
                    </HomeButton>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                {slidesToShow.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-current={idx === activeIndex}
                    onClick={() => setActiveIndex(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? "w-10 bg-accent" : "w-6 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous slide"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides)}
                  className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  ←
                </button>
                <button
                  type="button"
                  aria-label="Next slide"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % totalSlides)}
                  className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
