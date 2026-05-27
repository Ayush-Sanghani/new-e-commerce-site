/** Query params consumed by `/shop` via `normalizeShopSearchParams`. */
export type ShopUrlParams = {
  search?: string;
  category?: string;
  sort?: "latest" | "rating" | "price-low" | "price-high";
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

/**
 * Build a `/shop` URL that matches `app/shop/page.tsx` search param handling.
 */
export function buildShopUrl(params: ShopUrlParams = {}): string {
  const sp = new URLSearchParams();
  const search = params.search?.trim();
  if (search) sp.set("search", search);
  if (params.category?.trim()) sp.set("category", params.category.trim());
  if (params.sort) sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.minPrice !== undefined) sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) sp.set("maxPrice", String(params.maxPrice));
  if (params.inStock === true) sp.set("inStock", "true");
  const qs = sp.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
