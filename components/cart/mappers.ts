import type { CartPayload } from "@/lib/services/cart";
import { EMPTY_CART_SUMMARY, type CartItem, type CartSummary } from "./types";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+image";

export type MappedCartState = {
  items: CartItem[];
  summary: CartSummary;
};

export function mapApiCartPayload(cart: CartPayload | null | undefined): MappedCartState {
  if (!cart?.items?.length) {
    return { items: [], summary: EMPTY_CART_SUMMARY };
  }

  const items: CartItem[] = cart.items.map((line) => ({
    id: line.id,
    productId: line.productId,
    title: line.product.title,
    sku: line.product.sku,
    imageUrl: line.product.thumbnail?.trim() || FALLBACK_IMAGE,
    quantity: line.quantity,
    unitPrice: line.unitPrice,
    listPrice: line.listPrice,
    discountPercentage: line.discountPercentage,
    lineTotal: line.lineTotal,
    listLineTotal: line.listLineTotal,
    maxQuantity: line.maxQuantity,
  }));

  return {
    items,
    summary: {
      subtotal: cart.summary.subtotal,
      tax: cart.summary.tax,
      shipping: cart.summary.shipping,
      discount: cart.summary.discount,
      total: cart.summary.total,
      currency: cart.summary.currency,
    },
  };
}
