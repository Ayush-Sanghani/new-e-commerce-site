export type ProductDetail = {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  brand: string;
  description: string;
  images: string[];
  highlights: string[];
  specs: { label: string; value: string }[];
  deliveryInfo: string[];
  warranty: string;
};

export type RelatedProduct = {
  id: string;
  title: string;
  category: string;
  /** Payable unit price in INR (after catalog discount). */
  price: number;
  /** List/MRP when on sale. */
  oldPrice?: number;
  imageUrl: string;
};
