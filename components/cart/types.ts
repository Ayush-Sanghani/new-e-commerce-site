export type CartItem = {
  id: string;
  productId: string;
  title: string;
  sku: string;
  imageUrl: string;
  quantity: number;
  unitPrice: number;
  listPrice: number;
  discountPercentage: number;
  lineTotal: number;
  listLineTotal: number;
  maxQuantity: number;
};

export type CartSummary = {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  symbol?: string;
};

export type CartDisplayMeta = {
  currency: string;
  symbol: string;
  rateToInr: number;
  rateUpdatedAt: string;
  rateStale: boolean;
  disclaimer: string;
};

export const EMPTY_CART_SUMMARY: CartSummary = {
  subtotal: 0,
  shipping: 0,
  discount: 0,
  tax: 0,
  total: 0,
  currency: "INR",
  symbol: "₹",
};
