export type CartItem = {
  id: string;
  productId: string;
  title: string;
  category: string;
  sku: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
};

export type CartSummary = {
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
};
