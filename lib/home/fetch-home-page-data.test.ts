import { describe, expect, it } from "vitest";
import type { HomeProduct } from "@/components/home/types";

/** Mirrors pickFlashSale logic for unit tests without DB. */
function pickFlashSale(products: HomeProduct[], fallback: HomeProduct[]): HomeProduct[] {
  const discounted = products.filter((p) => (p.discountPercent ?? 0) > 0);
  if (discounted.length >= 4) return discounted.slice(0, 4);
  if (discounted.length > 0) {
    const ids = new Set(discounted.map((p) => p.id));
    const rest = fallback.filter((p) => p.id && !ids.has(p.id));
    return [...discounted, ...rest].slice(0, 4);
  }
  return fallback.slice(0, 4).map((p) => ({ ...p, tag: p.tag ?? "Flash Deal" }));
}

describe("pickFlashSale", () => {
  const fallback: HomeProduct[] = [
    { id: "a", title: "A", price: "₹10", imageUrl: "" },
    { id: "b", title: "B", price: "₹20", imageUrl: "" },
    { id: "c", title: "C", price: "₹30", imageUrl: "" },
    { id: "d", title: "D", price: "₹40", imageUrl: "" },
  ];

  it("prefers discounted products", () => {
    const pool: HomeProduct[] = [
      { id: "1", title: "Sale", price: "₹5", imageUrl: "", discountPercent: 20 },
      { id: "2", title: "Full", price: "₹50", imageUrl: "" },
    ];
    const result = pickFlashSale(pool, fallback);
    expect(result[0]?.id).toBe("1");
    expect(result.length).toBeLessThanOrEqual(4);
  });

  it("falls back when no discounts", () => {
    const pool: HomeProduct[] = [{ id: "x", title: "X", price: "₹1", imageUrl: "" }];
    const result = pickFlashSale(pool, fallback);
    expect(result).toHaveLength(4);
    expect(result[0]?.tag).toBe("Flash Deal");
  });
});
