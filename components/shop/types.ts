export type ShopProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  imageUrl: string;
  badge?: string;
  stock: number;
  minimumOrderQuantity: number;
  isPurchasable: boolean;
  unavailabilityReason: string | null;
};
