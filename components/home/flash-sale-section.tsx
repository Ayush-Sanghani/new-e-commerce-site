"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { HomeProduct } from "./types";
import { HomeProductCard } from "./home-product-card";
import { SectionContainer } from "./ui/section-container";

type FlashSaleSectionProps = {
  products: HomeProduct[];
};

function useCountdown(targetTimestamp: number) {
  const [left, setLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, targetTimestamp - Date.now());
      const next = {
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      };
      setLeft((prev) =>
        prev.h === next.h && prev.m === next.m && prev.s === next.s ? prev : next,
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTimestamp]);

  return left;
}

export function FlashSaleSection({ products }: FlashSaleSectionProps) {
  const endOfDay = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, []);
  const { h, m, s } = useCountdown(endOfDay);

  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-6 sm:p-8 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/20">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">Flash Sale</h2>
                <p className="text-sm text-white/70">Limited-time deals — ends tonight</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" aria-hidden />
              <div className="flex gap-2" aria-live="polite" aria-label="Sale ends in">
                {[
                  { label: "Hours", value: pad(h) },
                  { label: "Min", value: pad(m) },
                  { label: "Sec", value: pad(s) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex min-w-[52px] flex-col items-center rounded-xl bg-white/10 px-3 py-2 backdrop-blur-sm"
                  >
                    <span className="text-xl font-bold tabular-nums text-white">{value}</span>
                    <span className="text-[10px] uppercase text-white/60">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {products.slice(0, 4).map((product, index) => (
              <motion.div
                key={product.id ?? product.title}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <HomeProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-hover"
            >
              Shop Flash Deals
            </Link>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
