export type Category = {
  slug: string;
  name: string;
  emoji: string;
  items: string[];
  imageTintClass: string;
};

export type CategoryItem = {
  slug: string;
  label: string;
};

export type CategoryGroup = {
  title: string;
  items: CategoryItem[];
};

export type FeaturedProduct = {
  id?: string;
  title: string;
  price: string;
  oldPrice?: string;
  tag: string;
  imageUrl: string;
};

export type NewArrivalProduct = {
  id?: string;
  title: string;
  price: string;
  oldPrice?: string;
  badge?: string;
  colors: string[];
  sizes?: string[];
  imageUrl: string;
};

export type ClientReview = {
  name: string;
  role: string;
  message: string;
  rating: number;
};
