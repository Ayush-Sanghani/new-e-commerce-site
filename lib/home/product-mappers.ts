import type { HomeProduct } from "@/components/home/types";
import { resolveProductImageUrl } from "@/lib/product-image";
import {
  getUnavailabilityReason,
  isProductPurchasable,
} from "@/lib/product-availability";
import type { ProductListItem } from "@/lib/services/product-queries";
import { formatInr, resolveCatalogPrices } from "@/lib/pricing";

export function mapToHomeProduct(row: ProductListItem, tagOverride?: string): HomeProduct {
  const listPrice = Number(row.price);
  const discountPercentage = Number(row.discountPercentage ?? 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, discountPercentage);
  const rawRating = row.rating != null ? Number(row.rating) : undefined;
  const rating =
    rawRating != null && rawRating > 0 && Number.isFinite(rawRating)
      ? rawRating
      : undefined;

  const tag =
    tagOverride ??
    (discountPercentage > 0
      ? `${Math.round(discountPercentage)}% OFF`
      : rating && rating >= 4
        ? "Top Rated"
        : "Featured");

  const productAvailability = {
    stock: row.stock,
    availabilityStatus: row.availabilityStatus,
  };

  return {
    id: row.id,
    title: row.title,
    price: formatInr(effectivePrice),
    oldPrice: oldPrice != null ? formatInr(oldPrice) : undefined,
    tag,
    badge: discountPercentage > 0 ? "Sale" : undefined,
    imageUrl: resolveProductImageUrl(row.thumbnail, row.images),
    rating,
    discountPercent: discountPercentage > 0 ? Math.round(discountPercentage) : undefined,
    isPurchasable: isProductPurchasable(productAvailability),
    unavailabilityReason: getUnavailabilityReason(productAvailability),
  };
}

export function mapToFeaturedProduct(row: ProductListItem): HomeProduct {
  return mapToHomeProduct(row);
}

export function mapToNewArrivalProduct(row: ProductListItem): HomeProduct {
  const product = mapToHomeProduct(row);
  return {
    ...product,
    badge: product.discountPercent ? "Sale" : "New",
    tag: product.discountPercent ? `${product.discountPercent}% OFF` : "New Arrival",
  };
}
