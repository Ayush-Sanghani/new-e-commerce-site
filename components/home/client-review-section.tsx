"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { ClientReview } from "./types";
import { SectionContainer } from "./ui/section-container";

type ClientReviewSectionProps = {
  reviews: ClientReview[];
};

export function ClientReviewSection({ reviews }: ClientReviewSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = reviews.length;
  const active = reviews[activeIndex];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [total]);

  return (
    <SectionContainer className="bg-slate-900 text-white">
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-section-title text-white">What Our Customers Say</h2>
          <p className="mt-2 text-slate-400">Real reviews from verified buyers</p>
        </div>

        <div className="relative mx-auto mt-10 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.article
              key={active.name}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.4 }}
              className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm sm:p-10"
            >
              <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                <img
                  src={active.avatarUrl}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-full border-2 border-accent object-cover"
                  loading="lazy"
                />
                <div className="mt-4 sm:mt-0 sm:ml-6">
                  <div className="flex justify-center gap-1 sm:justify-start">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-4 w-4 ${
                          idx < active.rating
                            ? "fill-accent text-accent"
                            : "text-slate-600"
                        }`}
                      />
                    ))}
                  </div>
                  <blockquote className="mt-4 text-lg leading-relaxed text-slate-200 sm:text-xl">
                    &ldquo;{active.message}&rdquo;
                  </blockquote>
                  <div className="mt-5 flex flex-col items-center gap-1 sm:items-start">
                    <h3 className="text-lg font-bold text-white">{active.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm text-accent">
                      <BadgeCheck className="h-4 w-4" />
                      {active.role}
                    </span>
                  </div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-center gap-2">
            {reviews.map((review, idx) => (
              <button
                key={review.name}
                type="button"
                aria-label={`Show review ${idx + 1}`}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? "w-8 bg-accent" : "w-6 bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
