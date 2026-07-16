import type { CartPayload } from "@/lib/services/cart";
import { EMPTY_CART_SUMMARY, type CartItem, type CartSummary, type CartDisplayMeta } from "./types";

const FALLBACK_IMAGE = "https://placehold.co/600x400?text=No+image";

export type MappedCartState = {
  items: CartItem[];
  summary: CartSummary;
  displayMeta: CartDisplayMeta | null;
};

export function mapApiCartPayload(cart: CartPayload | null | undefined): MappedCartState {
  if (!cart?.items?.length) {
    return { items: [], summary: EMPTY_CART_SUMMARY, displayMeta: cart?.display ?? null };
  }

  const items: CartItem[] = cart.items.map((line) => ({
    id: line.id,
    productId: line.productId,
    title: line.product.title,
    sku: line.product.sku,
    imageUrl: line.product.thumbnail?.trim() || FALLBACK_IMAGE,
    quantity: line.quantity,
    unitPrice: line.display.unitPrice,
    listPrice: line.display.listPrice,
    discountPercentage: line.discountPercentage,
    lineTotal: line.display.lineTotal,
    listLineTotal: line.display.listLineTotal,
    maxQuantity: line.maxQuantity,
  }));

  return {
    items,
    summary: {
      subtotal: cart.display.subtotal,
      tax: cart.display.tax,
      shipping: cart.display.shipping,
      discount: cart.display.discount,
      total: cart.display.total,
      currency: cart.display.currency,
      symbol: cart.display.symbol,
    },
    displayMeta: cart.display,
  };
}
