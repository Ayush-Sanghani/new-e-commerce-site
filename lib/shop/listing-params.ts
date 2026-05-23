import type { ShopProduct } from "@/components/shop/types";
import { resolveCatalogPrices } from "@/lib/pricing";
import { productListQuerySchema, type ProductListQuery } from "@/lib/validations/product-query";

export type ShopCategoryChip = { id: string; name: string; slug: string };

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

function finiteNumber(raw: string | undefined): number | undefined {
  if (raw === undefined || raw.trim() === "") return undefined;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function normalizeShopSearchParams(raw: {
  search?: string | string[];
  category?: string | string[];
  sort?: string | string[];
  page?: string | string[];
  minPrice?: string | string[];
  maxPrice?: string | string[];
  inStock?: string | string[];
}) {
  const search = firstParam(raw.search)?.trim() ?? "";
  const categoryParam = firstParam(raw.category)?.trim();
  const sortRaw = firstParam(raw.sort)?.trim() ?? "latest";
  const pageParsed = parseInt(firstParam(raw.page) ?? "1", 10);
  const page = Number.isFinite(pageParsed) && pageParsed >= 1 ? pageParsed : 1;
  const minPrice = finiteNumber(firstParam(raw.minPrice));
  const maxPrice = finiteNumber(firstParam(raw.maxPrice));
  const inStockRaw = firstParam(raw.inStock)?.toLowerCase();
  const inStock =
    inStockRaw === "1" || inStockRaw === "true" || inStockRaw === "on" ? true : undefined;

  const sort =
    sortRaw === "price-low" ||
    sortRaw === "price-high" ||
    sortRaw === "rating" ||
    sortRaw === "latest"
      ? sortRaw
      : "latest";

  return {
    search,
    categoryParam: categoryParam || undefined,
    sort,
    page,
    minPrice,
    maxPrice,
    inStock,
  };
}

export function resolveCategorySlug(
  categoryParam: string | undefined,
  categories: ShopCategoryChip[]
): string | undefined {
  if (!categoryParam) return undefined;
  const lower = categoryParam.toLowerCase();
  const bySlug = categories.find(
    (c) => c.slug === categoryParam || c.slug.toLowerCase() === lower
  );
  if (bySlug) return bySlug.slug;
  const byName = categories.find((c) => c.name.toLowerCase() === lower);
  return byName?.slug;
}

/** Same query shape as GET /api/products (for `parseProductListQuery`). */
export function shopStateToApiSearchParams(input: {
  q: string;
  categorySlug?: string;
  sort: string;
  page: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): URLSearchParams {
  const sp = new URLSearchParams();
  if (input.q) sp.set("q", input.q);
  if (input.categorySlug) {
    sp.set("filterKey", "category");
    sp.set("categorySlug", input.categorySlug);
  }
  switch (input.sort) {
    case "price-low":
      sp.set("sortKey", "price");
      sp.set("sortOrder", "asc");
      break;
    case "price-high":
      sp.set("sortKey", "price");
      sp.set("sortOrder", "desc");
      break;
    case "rating":
      sp.set("sortKey", "rating");
      sp.set("sortOrder", "desc");
      break;
    default:
      break;
  }
  if (input.page > 1) sp.set("page", String(input.page));
  if (input.minPrice !== undefined) sp.set("minPrice", String(input.minPrice));
  if (input.maxPrice !== undefined) sp.set("maxPrice", String(input.maxPrice));
  if (input.inStock === true) sp.set("inStock", "true");
  return sp;
}

/** Safe fallback when URL params are invalid (e.g. bad numbers). */
export function defaultProductListQuery(): ProductListQuery {
  return productListQuerySchema.parse({});
}

type SerializedListItem = {
  id: string;
  title: string;
  price: number;
  discountPercentage: number;
  rating: number | null;
  thumbnail: string | null;
  category: { name: string };
  images: { url: string }[];
};

export function mapListItemToShopProduct(row: SerializedListItem): ShopProduct {
  const listPrice = Number(row.price);
  const disc = Number(row.discountPercentage ?? 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, disc);
  const imageUrl =
    row.images?.[0]?.url?.trim() ||
    row.thumbnail?.trim() ||
    "https://placehold.co/600x400?text=No+image";
  const badge = disc > 0 ? "Sale" : undefined;
  return {
    id: row.id,
    title: row.title,
    category: row.category.name,
    price: effectivePrice,
    oldPrice,
    rating: row.rating != null ? Number(row.rating) : 0,
    imageUrl,
    badge,
  };
}
