const WISHLIST_KEY = "dummymart-wishlist";
const RECENTLY_VIEWED_KEY = "dummymart-recently-viewed";
const MAX_RECENT = 8;

function readIds(key: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(ids));
}

export function getWishlistIds(): string[] {
  return readIds(WISHLIST_KEY);
}

export function toggleWishlistId(productId: string): boolean {
  const ids = readIds(WISHLIST_KEY);
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((id) => id !== productId) : [productId, ...ids];
  writeIds(WISHLIST_KEY, next);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("wishlist-updated"));
  }
  return !exists;
}

export function isInWishlist(productId: string): boolean {
  return readIds(WISHLIST_KEY).includes(productId);
}

export function getRecentlyViewedIds(): string[] {
  return readIds(RECENTLY_VIEWED_KEY);
}

export function trackRecentlyViewed(productId: string) {
  const ids = readIds(RECENTLY_VIEWED_KEY).filter((id) => id !== productId);
  writeIds(RECENTLY_VIEWED_KEY, [productId, ...ids].slice(0, MAX_RECENT));
}
