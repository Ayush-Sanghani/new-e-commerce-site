export type Category = {
  slug: string;
  name: string;
  imageTintClass: string;
  imageUrl: string;
  productCount: number;
};

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

export type ClientReview = {
  name: string;
  role: string;
  message: string;
  rating: number;
  avatarUrl: string;
};

export type FeaturedBrand = {
  name: string;
  logo: string;
  search: string;
};
