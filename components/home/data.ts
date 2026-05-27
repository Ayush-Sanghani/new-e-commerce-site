import type { Category, CategoryGroup, ClientReview, FeaturedBrand } from "./types";

/** Homepage category carousel (links use slugs from `categoryGroups` where possible). */
export const categories: Category[] = [
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    imageTintClass: "bg-rose-50",
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80",
    productCount: 86,
  },
  {
    slug: "mens-shirts",
    name: "Fashion",
    imageTintClass: "bg-indigo-50",
    imageUrl:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=600&q=80",
    productCount: 142,
  },
  {
    slug: "smartphones",
    name: "Electronics",
    imageTintClass: "bg-sky-50",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80",
    productCount: 120,
  },
  {
    slug: "furniture",
    name: "Home & Kitchen",
    imageTintClass: "bg-amber-50",
    imageUrl:
      "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=600&q=80",
    productCount: 94,
  },
  {
    slug: "sports-accessories",
    name: "Sports & Automotive",
    imageTintClass: "bg-emerald-50",
    imageUrl:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=80",
    productCount: 67,
  },
  {
    slug: "mens-watches",
    name: "Watches & Accessories",
    imageTintClass: "bg-purple-50",
    imageUrl:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844cac?auto=format&fit=crop&w=600&q=80",
    productCount: 58,
  },
];

/** Nav mega-menu + shop category filter chips (shared with layout and `/shop`). */
export const categoryGroups: CategoryGroup[] = [
  {
    title: "Beauty & Personal Care",
    items: [
      { slug: "beauty", label: "Beauty" },
      { slug: "skin-care", label: "Skin Care" },
      { slug: "fragrances", label: "Fragrances" },
      { slug: "sunglasses", label: "Sunglasses" },
    ],
  },
  {
    title: "Fashion",
    items: [
      { slug: "mens-shirts", label: "Men's Shirts" },
      { slug: "mens-shoes", label: "Men's Shoes" },
      { slug: "mens-watches", label: "Men's Watches" },
      { slug: "womens-dresses", label: "Women's Dresses" },
      { slug: "tops", label: "Tops" },
      { slug: "womens-bags", label: "Women's Bags" },
      { slug: "womens-jewellery", label: "Women's Jewellery" },
      { slug: "womens-shoes", label: "Women's Shoes" },
      { slug: "womens-watches", label: "Women's Watches" },
    ],
  },
  {
    title: "Electronics",
    items: [
      { slug: "laptops", label: "Laptops" },
      { slug: "smartphones", label: "Smartphones" },
      { slug: "tablets", label: "Tablets" },
      { slug: "mobile-accessories", label: "Mobile Accessories" },
    ],
  },
  {
    title: "Home & Kitchen",
    items: [
      { slug: "furniture", label: "Furniture" },
      { slug: "home-decoration", label: "Home Decoration" },
      { slug: "kitchen-accessories", label: "Kitchen Accessories" },
      { slug: "groceries", label: "Groceries" },
    ],
  },
  {
    title: "Sports & Automotive",
    items: [
      { slug: "sports-accessories", label: "Sports Accessories" },
      { slug: "motorcycle", label: "Motorcycle" },
      { slug: "vehicle", label: "Vehicle" },
    ],
  },
];

export const clientReviews: ClientReview[] = [
  {
    name: "John Doe",
    role: "Verified Buyer",
    message:
      "Outstanding quality and lightning-fast delivery. The checkout was seamless and packaging felt premium — exactly what I expect from a top-tier store.",
    rating: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sarah Khan",
    role: "Verified Buyer",
    message:
      "Great product selection and honest pricing. Support resolved my query within minutes. I've already placed three repeat orders.",
    rating: 5,
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Amit Verma",
    role: "Verified Buyer",
    message:
      "Clean shopping experience with real discounts. Returns were hassle-free. DummyMart has become my go-to for electronics and fashion.",
    rating: 4,
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
  },
];

export const featuredBrands: FeaturedBrand[] = [
  { name: "Apple", logo: "🍎", search: "apple" },
  { name: "Samsung", logo: "📱", search: "samsung" },
  { name: "Nike", logo: "✓", search: "nike" },
  { name: "Sony", logo: "🎧", search: "sony" },
  { name: "Adidas", logo: "👟", search: "adidas" },
  { name: "Dell", logo: "💻", search: "dell" },
];

export const SOCIAL_PROOF_STATS = {
  customers: "50,000+",
  satisfaction: "98%",
  products: "2,500+",
  rating: "4.8",
};
