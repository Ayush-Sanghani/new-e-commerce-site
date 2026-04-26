"use client";

import { useEffect, useState } from "react";
import { Quote, Star } from "lucide-react";
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
    }, 5000);
    return () => window.clearInterval(timer);
  }, [total]);

  return (
    <SectionContainer className="px-4 py-10 sm:px-6 lg:px-10 lg:py-14">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-4xl font-bold text-slate-800">Client Review</h2>
        <p className="mt-2 text-sm text-slate-500">What say client about us</p>

        <div className="relative mt-8 border border-neutral-200 bg-white px-6 py-8 sm:px-10">
          <Quote className="absolute left-3 top-3 h-8 w-8 text-slate-400" />
          <Quote className="absolute bottom-3 right-3 h-8 w-8 rotate-180 text-slate-400" />

          <p className="mx-auto max-w-3xl text-base leading-8 text-slate-600">{active.message}</p>

          <h3 className="mt-5 text-3xl font-bold text-slate-800">{active.name}</h3>
          <p className="mt-1 text-xl text-slate-500">{active.role}</p>

          <div className="mt-3 flex items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Star
                key={`${active.name}-${idx}`}
                className={`h-4 w-4 ${
                  idx < active.rating ? "fill-rose-400 text-rose-400" : "text-slate-300"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="mt-7 flex items-center justify-center gap-2">
          {reviews.map((review, idx) => (
            <button
              key={review.name}
              type="button"
              aria-label={`Show review ${idx + 1}`}
              onClick={() => setActiveIndex(idx)}
              className={`h-2.5 rounded-full transition ${
                idx === activeIndex
                  ? "w-8 bg-slate-800"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
