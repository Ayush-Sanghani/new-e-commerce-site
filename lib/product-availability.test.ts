import { describe, expect, it } from "vitest";
import {
  getUnavailabilityReason,
  isProductPurchasable,
  normalizeMinimumOrderQuantity,
  validateProductQuantity,
} from "@/lib/product-availability";

describe("product-availability", () => {
  it("normalizes minimum order quantity to at least 1", () => {
    expect(normalizeMinimumOrderQuantity(0)).toBe(1);
    expect(normalizeMinimumOrderQuantity(5)).toBe(5);
  });

  it("treats in-stock products with stock as purchasable", () => {
    expect(isProductPurchasable({ stock: 10, availabilityStatus: "In Stock" })).toBe(true);
  });

  it("blocks zero stock and non-in-stock availability", () => {
    expect(isProductPurchasable({ stock: 0, availabilityStatus: "In Stock" })).toBe(false);
    expect(isProductPurchasable({ stock: 5, availabilityStatus: "Out of Stock" })).toBe(false);
  });

  it("returns unavailability reasons", () => {
    expect(getUnavailabilityReason({ stock: 0, availabilityStatus: "In Stock" })).toBe(
      "Out of stock"
    );
    expect(getUnavailabilityReason({ stock: 3, availabilityStatus: "Discontinued" })).toBe(
      "Discontinued"
    );
  });

  it("validates quantity against MOQ and stock", () => {
    expect(
      validateProductQuantity(
        { stock: 10, minimumOrderQuantity: 2, availabilityStatus: "In Stock" },
        1
      )
    ).toEqual({ ok: false, error: "minimum_quantity", min: 2 });

    expect(
      validateProductQuantity(
        { stock: 10, minimumOrderQuantity: 1, availabilityStatus: "In Stock" },
        11
      )
    ).toEqual({ ok: false, error: "insufficient_stock", max: 10 });

    expect(
      validateProductQuantity(
        { stock: 10, minimumOrderQuantity: 1, availabilityStatus: "In Stock" },
        3
      )
    ).toEqual({ ok: true });
  });
});
