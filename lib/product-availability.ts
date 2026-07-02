export const IN_STOCK_STATUS = "In Stock";

export function normalizeMinimumOrderQuantity(value: number | null | undefined): number {
  return Math.max(value ?? 1, 1);
}

export function isProductPurchasable(product: {
  stock: number;
  availabilityStatus?: string | null;
}): boolean {
  if (product.stock <= 0) return false;
  const status = product.availabilityStatus?.trim() || IN_STOCK_STATUS;
  return status.toLowerCase() === IN_STOCK_STATUS.toLowerCase();
}

export function getUnavailabilityReason(product: {
  stock: number;
  availabilityStatus?: string | null;
}): string | null {
  if (product.stock <= 0) return "Out of stock";
  if (!isProductPurchasable(product)) {
    return product.availabilityStatus?.trim() || "Unavailable";
  }
  return null;
}

export type ProductQuantityValidationResult =
  | { ok: true }
  | { ok: false; error: "not_available"; reason: string }
  | { ok: false; error: "insufficient_stock"; max: number }
  | { ok: false; error: "minimum_quantity"; min: number };

export function validateProductQuantity(
  product: {
    stock: number;
    minimumOrderQuantity?: number | null;
    availabilityStatus?: string | null;
  },
  quantity: number
): ProductQuantityValidationResult {
  const reason = getUnavailabilityReason(product);
  if (reason) {
    return { ok: false, error: "not_available", reason };
  }

  const min = normalizeMinimumOrderQuantity(product.minimumOrderQuantity);
  if (quantity < min) {
    return { ok: false, error: "minimum_quantity", min };
  }

  if (quantity > product.stock) {
    return { ok: false, error: "insufficient_stock", max: product.stock };
  }

  return { ok: true };
}
