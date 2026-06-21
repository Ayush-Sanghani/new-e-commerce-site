import type { CategoryGroup } from "./types";

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

export const SOCIAL_PROOF_STATS = {
  customers: "50,000+",
  satisfaction: "98%",
  products: "2,500+",
  rating: "4.8",
};
