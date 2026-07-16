import type { HeroSlide } from "@/components/home/hero-section";
import type { HomeProduct } from "@/components/home/types";
import {
  mapToFeaturedProduct,
  mapToHomeProduct,
  mapToNewArrivalProduct,
} from "@/lib/home/product-mappers";
import { listProducts } from "@/lib/services/product-queries";
import type { CurrencyContext } from "@/lib/services/currency";
import { defaultProductListQuery } from "@/lib/shop/listing-params";
import type { ProductListItem } from "@/lib/services/product-queries";

export type HomePageData = {
  bestSellers: HomeProduct[];
  trendingProducts: HomeProduct[];
  newArrivalProducts: HomeProduct[];
  catalogProducts: HomeProduct[];
  heroSlides: HeroSlide[];
  error: string | null;
};

const FALLBACK_HERO_IMAGE =
  "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1400&q=80";

function inStockBase() {
  return { ...defaultProductListQuery(), inStock: true as const };
}

function sliceProducts<T>(items: T[], start: number, count: number): T[] {
  if (items.length <= start) return items.slice(0, count);
  return items.slice(start, start + count);
}

function buildHeroSlides(
  topRated: ProductListItem | undefined,
  latest: ProductListItem | undefined,
  currency: CurrencyContext
): HeroSlide[] {
  return [
    {
      id: "hero-top-rated",
      preTitle: "Top Rated",
      title: topRated?.title ?? "Premium Picks",
      priceText: topRated
        ? `Starting from ${mapToFeaturedProduct(topRated, currency).price}`
        : "Shop best rated products",
      bgClassName: "from-slate-900 via-blue-950 to-slate-900",
      imageUrl: topRated
        ? mapToFeaturedProduct(topRated, currency).imageUrl
        : FALLBACK_HERO_IMAGE,
      ctaHref: "/shop?sort=rating",
      exploreHref: "/shop",
    },
    {
      id: "hero-new-arrivals",
      preTitle: "New Arrivals",
      title: latest?.title ?? "Latest Collection",
      priceText: latest
        ? `Starting from ${mapToNewArrivalProduct(latest, currency).price}`
        : "Explore the newest products",
      bgClassName: "from-slate-900 via-indigo-950 to-slate-900",
      imageUrl: latest
        ? mapToNewArrivalProduct(latest, currency).imageUrl
        : "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1400&q=80",
      ctaHref: "/shop?sort=latest",
      exploreHref: "/shop",
    },
  ];
}

const empty: HomePageData = {
  bestSellers: [],
  trendingProducts: [],
  newArrivalProducts: [],
  catalogProducts: [],
  heroSlides: [],
  error: null,
};

/**
 * Loads all homepage product sections in three parallel DB queries.
 * Slices results so sections stay distinct without relying on page-2 offsets.
 */
export async function fetchHomePageData(currency: CurrencyContext): Promise<HomePageData> {
  const base = inStockBase();

  try {
    const [ratedResult, latestResult, catalogResult] = await Promise.all([
      listProducts({
        ...base,
        sortKey: "rating",
        sortOrder: "desc",
        pageSize: 8,
        page: 1,
      }),
      listProducts({
        ...base,
        sortKey: "createdAt",
        sortOrder: "desc",
        pageSize: 8,
        page: 1,
      }),
      listProducts({
        ...base,
        pageSize: 40,
        page: 1,
      }),
    ]);

    const ratedRows = ratedResult.products as ProductListItem[];
    const latestRows = latestResult.products as ProductListItem[];

    const ratedMapped = ratedRows.map((row) => mapToHomeProduct(row, currency));
    const latestAsNew = latestRows.map((row) => mapToNewArrivalProduct(row, currency));
    const latestAsTrending = latestRows.map((row) =>
      mapToHomeProduct(row, currency, "Trending")
    );

    const topRatedFeatured = sliceProducts(
      ratedRows.map((row) => mapToFeaturedProduct(row, currency)),
      0,
      4
    );
    const bestSellersDistinct =
      ratedMapped.length >= 8
        ? sliceProducts(
            ratedMapped.map((p) => ({ ...p, tag: "Best Seller" })),
            4,
            4
          )
        : sliceProducts(
            ratedMapped.map((p) => ({ ...p, tag: "Best Seller" })),
            0,
            4
          );

    const trendingProducts = sliceProducts(latestAsTrending, 0, 4);
    const newArrivalProducts =
      latestAsNew.length >= 8
        ? sliceProducts(latestAsNew, 4, 4)
        : sliceProducts(latestAsNew, 0, 4);

    const catalogProducts = catalogResult.products.map((row) =>
      mapToHomeProduct(row as ProductListItem, currency)
    );

    const heroSlides = buildHeroSlides(ratedRows[0], latestRows[0], currency);

    return {
      bestSellers: bestSellersDistinct.length ? bestSellersDistinct : topRatedFeatured,
      trendingProducts: trendingProducts.length ? trendingProducts : newArrivalProducts,
      newArrivalProducts,
      catalogProducts,
      heroSlides,
      error: null,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load homepage products.";
    if (process.env.NODE_ENV === "development") {
      console.error("[fetchHomePageData]", err);
    }
    return { ...empty, error: message };
  }
}
