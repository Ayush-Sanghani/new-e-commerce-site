const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+image";

/** Prefer thumbnail — it is the canonical primary image and stays correct when image rows are stale. */
export function resolveProductImageUrl(
  thumbnail: string | null | undefined,
  images?: Array<{ url?: string | null }> | null
): string {
  const thumb = thumbnail?.trim();
  const firstImage = images?.find((image) => image.url?.trim())?.url?.trim();
  return thumb || firstImage || FALLBACK_IMAGE;
}

export { FALLBACK_IMAGE };
