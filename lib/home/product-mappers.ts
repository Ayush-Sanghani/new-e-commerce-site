import type { FeaturedProduct, NewArrivalProduct } from "@/components/home/types";
import type { ProductListItem } from "@/lib/services/product-queries";
import { formatInr, resolveCatalogPrices } from "@/lib/pricing";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+image";

function getImageUrl(row: ProductListItem): string {
  return row.images?.[0]?.url?.trim() || row.thumbnail?.trim() || FALLBACK_IMAGE;
}

export function mapToFeaturedProduct(row: ProductListItem): FeaturedProduct {
  const listPrice = Number(row.price);
  const discountPercentage = Number(row.discountPercentage ?? 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, discountPercentage);
  const rating = row.rating != null ? Number(row.rating) : null;

  return {
    id: row.id,
    title: row.title,
    price: formatInr(effectivePrice),
    oldPrice: oldPrice != null ? formatInr(oldPrice) : undefined,
    tag:
      discountPercentage > 0
        ? `${Math.round(discountPercentage)}% OFF`
        : rating && rating >= 4
          ? "Top Rated"
          : "Featured",
    imageUrl: getImageUrl(row),
  };
}

export function mapToNewArrivalProduct(row: ProductListItem): NewArrivalProduct {
  const listPrice = Number(row.price);
  const discountPercentage = Number(row.discountPercentage ?? 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, discountPercentage);

  return {
    id: row.id,
    title: row.title,
    price: formatInr(effectivePrice),
    oldPrice: oldPrice != null ? formatInr(oldPrice) : undefined,
    badge: discountPercentage > 0 ? "Sale" : "New",
    colors: [],
    sizes: [],
    imageUrl: getImageUrl(row),
  };
}
