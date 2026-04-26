import type {
  Category,
  CategoryGroup,
  ClientReview,
  FeaturedProduct,
  NewArrivalProduct,
} from "./types";

export const categories: Category[] = [
  {
    slug: "beauty",
    name: "Beauty & Personal Care",
    emoji: "💄",
    items: ["Beauty", "Skin Care", "Fragrances", "Sunglasses"],
    imageTintClass: "bg-rose-50 border-rose-100",
  },
  {
    slug: "mens-shirts",
    name: "Fashion",
    emoji: "👕",
    items: ["Men's Shirts", "Women's Dresses", "Bags", "Shoes"],
    imageTintClass: "bg-indigo-50 border-indigo-100",
  },
  {
    slug: "smartphones",
    name: "Electronics",
    emoji: "📱",
    items: ["Smartphones", "Laptops", "Tablets", "Accessories"],
    imageTintClass: "bg-sky-50 border-sky-100",
  },
  {
    slug: "furniture",
    name: "Home & Kitchen",
    emoji: "🏠",
    items: ["Furniture", "Home Decoration", "Kitchen Accessories", "Groceries"],
    imageTintClass: "bg-amber-50 border-amber-100",
  },
  {
    slug: "sports-accessories",
    name: "Sports & Automotive",
    emoji: "🏍️",
    items: ["Sports Accessories", "Motorcycle", "Vehicle", "Travel Gear"],
    imageTintClass: "bg-emerald-50 border-emerald-100",
  },
  {
    slug: "mens-watches",
    name: "Watches & Accessories",
    emoji: "⌚",
    items: ["Men's Watches", "Women's Watches", "Jewellery", "Wallets"],
    imageTintClass: "bg-purple-50 border-purple-100",
  },
];

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

export const featuredProducts: FeaturedProduct[] = [
  {
    title: "Organic Apples",
    price: "$8.90",
    oldPrice: "$11.00",
    tag: "Best Seller",
    imageUrl:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Fresh Avocado Pack",
    price: "$6.20",
    oldPrice: "$7.80",
    tag: "New",
    imageUrl:
      "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Whole Grain Bread",
    price: "$4.50",
    oldPrice: "$5.50",
    tag: "Popular",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Farm Fresh Eggs",
    price: "$5.75",
    oldPrice: "$6.40",
    tag: "Limited",
    imageUrl:
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?auto=format&fit=crop&w=900&q=80",
  },
];

export const newArrivalProducts: NewArrivalProduct[] = [
  {
    title: "Full Sleeve Cap T-Shirt",
    price: "$15.00",
    oldPrice: "$20.00",
    badge: "Sale",
    colors: ["#71c8f3", "#4ee3da", "#b0efef"],
    sizes: ["S", "M", "X", "XL"],
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Classic Leather Purse",
    price: "$80.00",
    oldPrice: "$100.00",
    badge: "New",
    colors: ["#cc77f3", "#ff7dc5", "#f6e36f", "#d9d26e"],
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Fancy Ladies Sandal",
    price: "$80.00",
    oldPrice: "$100.00",
    badge: "-5%",
    colors: ["#ef9ecf", "#f0d76f", "#62caf8", "#6ce08a"],
    sizes: ["6", "7", "8", "9"],
    imageUrl:
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Womens Leather Backpack",
    price: "$80.00",
    oldPrice: "$100.00",
    colors: ["#f0d76f", "#a0e9af", "#ee8fd0", "#d882fb"],
    sizes: ["6", "7", "8", "9"],
    imageUrl:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
];

export const clientReviews: ClientReview[] = [
  {
    name: "John Doe",
    role: "General Manager",
    message:
      "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen.",
    rating: 5,
  },
  {
    name: "Sarah Khan",
    role: "Product Designer",
    message:
      "Great product quality and really fast delivery. The packaging was neat and support team helped me quickly with order updates.",
    rating: 5,
  },
  {
    name: "Amit Verma",
    role: "Store Owner",
    message:
      "I like the clean shopping flow and discount offers. Repeat purchases are smooth and checkout is very reliable.",
    rating: 4,
  },
];
