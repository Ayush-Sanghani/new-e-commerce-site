import type { HomeProduct } from "@/components/home/types";
import { formatCatalogMoney } from "@/lib/catalog-display";
import { resolveProductImageUrl } from "@/lib/product-image";
import {
  getUnavailabilityReason,
  isProductPurchasable,
} from "@/lib/product-availability";
import type { ProductListItem } from "@/lib/services/product-queries";
import type { CurrencyContext } from "@/lib/services/currency";
import { resolveCatalogPrices } from "@/lib/pricing";

export function mapToHomeProduct(
  row: ProductListItem,
  currency: CurrencyContext,
  tagOverride?: string
): HomeProduct {
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
    price: formatCatalogMoney(effectivePrice, currency),
    oldPrice: oldPrice != null ? formatCatalogMoney(oldPrice, currency) : undefined,
    tag,
    badge: discountPercentage > 0 ? "Sale" : undefined,
    imageUrl: resolveProductImageUrl(row.thumbnail, row.images),
    rating,
    discountPercent: discountPercentage > 0 ? Math.round(discountPercentage) : undefined,
    isPurchasable: isProductPurchasable(productAvailability),
    unavailabilityReason: getUnavailabilityReason(productAvailability),
  };
}

export function mapToFeaturedProduct(row: ProductListItem, currency: CurrencyContext): HomeProduct {
  return mapToHomeProduct(row, currency);
}

export function mapToNewArrivalProduct(
  row: ProductListItem,
  currency: CurrencyContext
): HomeProduct {
  const product = mapToHomeProduct(row, currency);
  return {
    ...product,
    badge: product.discountPercent ? "Sale" : "New",
    tag: product.discountPercent ? `${product.discountPercent}% OFF` : "New Arrival",
  };
}
