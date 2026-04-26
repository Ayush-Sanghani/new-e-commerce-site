import type { CartItem } from "./types";

type ApiCartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    thumbnail: string | null;
    price: number | string;
    sku: string;
  };
};

type ApiCart = {
  items: ApiCartItem[];
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

export function mapApiCartToUiItems(cart: ApiCart | null | undefined): CartItem[] {
  if (!cart?.items?.length) return [];

  return cart.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    title: item.product.title,
    category: "General",
    sku: item.product.sku,
    imageUrl: item.product.thumbnail?.trim() || "https://placehold.co/600x400?text=No+image",
    unitPrice: toNumber(item.product.price, 0),
    quantity: item.quantity,
    maxQuantity: 99,
  }));
}
