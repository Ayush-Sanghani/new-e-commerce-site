import type { FeaturedProduct, NewArrivalProduct } from "@/components/home/types";
import type { ProductListItem } from "@/lib/services/product-queries";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+image";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function getOldPrice(price: number, discountPercentage: number): number {
  if (discountPercentage <= 0 || discountPercentage >= 100) return price;
  return Math.round((price / (1 - discountPercentage / 100)) * 100) / 100;
}

function getImageUrl(row: ProductListItem): string {
  return row.images?.[0]?.url?.trim() || row.thumbnail?.trim() || FALLBACK_IMAGE;
}

export function mapToFeaturedProduct(row: ProductListItem): FeaturedProduct {
  const price = Number(row.price);
  const discountPercentage = Number(row.discountPercentage ?? 0);
  const oldPrice = getOldPrice(price, discountPercentage);
  const rating = row.rating != null ? Number(row.rating) : null;

  return {
    id: row.id,
    title: row.title,
    price: formatCurrency(price),
    oldPrice: formatCurrency(oldPrice),
    tag: discountPercentage > 0 ? `${Math.round(discountPercentage)}% OFF` : rating && rating >= 4 ? "Top Rated" : "Featured",
    imageUrl: getImageUrl(row),
  };
}

export function mapToNewArrivalProduct(row: ProductListItem): NewArrivalProduct {
  const price = Number(row.price);
  const discountPercentage = Number(row.discountPercentage ?? 0);
  const oldPrice = getOldPrice(price, discountPercentage);

  return {
    id: row.id,
    title: row.title,
    price: formatCurrency(price),
    oldPrice: formatCurrency(oldPrice),
    badge: discountPercentage > 0 ? "Sale" : "New",
    colors: [],
    sizes: [],
    imageUrl: getImageUrl(row),
  };
}
