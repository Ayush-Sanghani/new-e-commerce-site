import { resolveCatalogPrices } from "@/lib/pricing";
import {
  getUnavailabilityReason,
  isProductPurchasable,
  normalizeMinimumOrderQuantity,
} from "@/lib/product-availability";
import type { RelatedProduct, ProductDetail } from "./types";

type ProductRecord = {
  id: string;
  title: string;
  description?: string | null;
  category?: { name?: string | null; slug?: string | null } | null;
  price?: number | string | null;
  discountPercentage?: number | string | null;
  stock?: number | null;
  sku?: string | null;
  brand?: { name?: string | null } | null;
  images?: Array<{ url?: string | null }>;
  thumbnail?: string | null;
  reviews?: Array<unknown>;
  weight?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  depth?: number | string | null;
  shippingInformation?: string | null;
  returnPolicy?: string | null;
  availabilityStatus?: string | null;
  keyFeatures?: any;
  keyBenefits?: any;
  directionsForUse?: string | null;
  safetyInformation?: string | null;
  usesIndications?: string | null;
  packSize?: string | null;
  manufacturer?: string | null;
  isSterile?: boolean | null;
  isSingleUse?: boolean | null;
  storageConditions?: string | null;
  minimumOrderQuantity?: number | null;
};

type RelatedRecord = {
  id: string;
  title: string;
  category?: { name?: string | null } | null;
  price?: number | string | null;
  discountPercentage?: number | string | null;
  images?: Array<{ url?: string | null }>;
  thumbnail?: string | null;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}



export function mapProductRecordToDetail(record: ProductRecord): ProductDetail {
  const listPrice = toNumber(record.price, 0);
  const discountPercentage = toNumber(record.discountPercentage, 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, discountPercentage);

  const firstImage =
    record.thumbnail?.trim() ??
    record.images?.find((image) => image.url && image.url.trim())?.url?.trim() ??
    "https://placehold.co/1200x800?text=No+image";
  const gallery = record.images
    ?.map((image) => image.url?.trim())
    .filter((url): url is string => Boolean(url)) ?? [];
  const images = Array.from(new Set([firstImage, ...gallery])).slice(0, 4);
  const reviewCount = record.reviews?.length ?? 0;
  const stock = record.stock ?? 0;
  const minOrderQty = normalizeMinimumOrderQuantity(record.minimumOrderQuantity);
  const productAvailability = {
    stock,
    availabilityStatus: record.availabilityStatus,
  };

  return {
    id: record.id,
    title: record.title,
    category: record.category?.name?.trim() || "General",
    price: effectivePrice,
    oldPrice,
    reviewCount,
    stock,
    minimumOrderQuantity: minOrderQty,
    isPurchasable: isProductPurchasable(productAvailability),
    unavailabilityReason: getUnavailabilityReason(productAvailability),
    sku: record.sku?.trim() || "N/A",
    brand: record.brand?.name?.trim() || "Unknown",
    description: record.description?.trim() || "No product description available.",
    images,
    highlights: [
      record.availabilityStatus ? `Status: ${record.availabilityStatus}` : null,
      stock > 0 ? `${stock} units in stock` : "Currently out of stock",
      record.isSterile ? "Sterile" : null,
      record.isSingleUse ? "Single Use" : null,
      record.packSize ? `Pack Size: ${record.packSize}` : null,
      record.shippingInformation ? `Shipping: ${record.shippingInformation}` : null,
    ].filter((item): item is string => Boolean(item)),
    specs: [
      { label: "SKU", value: record.sku?.trim() || "N/A" },
      { label: "Category", value: record.category?.name?.trim() || "General" },
      { label: "Brand", value: record.brand?.name?.trim() || "Unknown" },
      { label: "Manufacturer", value: record.manufacturer?.trim() || "Unknown" },
      { label: "Sterile", value: record.isSterile ? "Yes" : "No" },
      { label: "Single Use", value: record.isSingleUse ? "Yes" : "No" },
      {
        label: "Weight",
        value: record.weight != null ? `${toNumber(record.weight)} kg` : "Not specified",
      },
      {
        label: "Dimensions",
        value:
          record.width != null && record.height != null && record.depth != null
            ? `${toNumber(record.width)} x ${toNumber(record.height)} x ${toNumber(record.depth)} cm`
            : "Not specified",
      },
      { label: "Availability", value: record.availabilityStatus || "Not specified" },
    ],
    deliveryInfo: [
      record.shippingInformation || "Standard delivery available.",
      record.returnPolicy || "Return policy details available at checkout.",
      stock > 0 ? "Secure online payment at checkout." : "Notify me when back in stock.",
    ],
    keyFeatures: Array.isArray(record.keyFeatures) ? record.keyFeatures : [],
    keyBenefits: Array.isArray(record.keyBenefits) ? record.keyBenefits : [],
    directionsForUse: record.directionsForUse || undefined,
    safetyInformation: record.safetyInformation || undefined,
    usesIndications: record.usesIndications || undefined,
    packSize: record.packSize || undefined,
    manufacturer: record.manufacturer || undefined,
    isSterile: record.isSterile || false,
    isSingleUse: record.isSingleUse || false,
    storageConditions: record.storageConditions || undefined,
  };
}

export function mapRelatedRecord(record: RelatedRecord): RelatedProduct {
  const listPrice = toNumber(record.price, 0);
  const discountPercentage = toNumber(record.discountPercentage, 0);
  const { effectivePrice, oldPrice } = resolveCatalogPrices(listPrice, discountPercentage);

  return {
    id: record.id,
    title: record.title,
    category: record.category?.name?.trim() || "General",
    price: effectivePrice,
    oldPrice,
    imageUrl:
      record.thumbnail?.trim() ||
      record.images?.find((image) => image.url && image.url.trim())?.url?.trim() ||
      "https://placehold.co/600x400?text=No+image",
  };
}
