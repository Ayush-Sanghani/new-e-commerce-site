export type CategoryItem = {
  slug: string;
  label: string;
};

export type CategoryGroup = {
  title: string;
  items: CategoryItem[];
};

export type HomeProduct = {
  id?: string;
  title: string;
  price: string;
  oldPrice?: string;
  tag?: string;
  badge?: string;
  imageUrl: string;
  rating?: number;
  discountPercent?: number;
};
