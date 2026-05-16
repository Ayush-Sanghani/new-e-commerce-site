import {
  categories,
  clientReviews,
} from "@/components/home/data";
import { CategorySection } from "@/components/home/category-section";
import { ClientReviewSection } from "@/components/home/client-review-section";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { HeroSection } from "@/components/home/hero-section";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { ServiceFeaturesSection } from "@/components/home/service-features-section";
import { mapToFeaturedProduct, mapToNewArrivalProduct } from "@/lib/home/product-mappers";
import { listProducts } from "@/lib/services/product-queries";
import { defaultProductListQuery } from "@/lib/shop/listing-params";
import type { FeaturedProduct, NewArrivalProduct } from "@/components/home/types";
import type { HeroSlide } from "@/components/home/hero-section";

export default async function HomePage() {
  const featuredQuery = {
    ...defaultProductListQuery(),
    sortKey: "rating" as const,
    sortOrder: "desc" as const,
    pageSize: 4,
    inStock: true,
  };

  const newArrivalsQuery = {
    ...defaultProductListQuery(),
    sortKey: "createdAt" as const,
    sortOrder: "desc" as const,
    pageSize: 4,
    inStock: true,
  };

  let featuredProducts: FeaturedProduct[] = [];
  let newArrivalProducts: NewArrivalProduct[] = [];
  let heroSlides: HeroSlide[] = [];

  try {
    const [featuredData, newArrivalsData] = await Promise.all([
      listProducts(featuredQuery),
      listProducts(newArrivalsQuery),
    ]);
    featuredProducts = featuredData.products.map((row) =>
      mapToFeaturedProduct(
        row as Parameters<typeof mapToFeaturedProduct>[0]
      )
    );
    newArrivalProducts = newArrivalsData.products.map((row) =>
      mapToNewArrivalProduct(
        row as Parameters<typeof mapToNewArrivalProduct>[0]
      )
    );

    const topRated = featuredData.products[0] as Parameters<typeof mapToFeaturedProduct>[0] | undefined;
    const latest = newArrivalsData.products[0] as Parameters<typeof mapToNewArrivalProduct>[0] | undefined;

    heroSlides = [
      {
        id: "hero-top-rated",
        preTitle: "Top Rated Products",
        title: topRated?.title ?? "Top Rated Products",
        priceText: topRated ? `starting at ${mapToFeaturedProduct(topRated).price}` : "Shop best rated products",
        bgClassName: "from-indigo-500 via-blue-600 to-cyan-600",
        accent: "Highly Rated",
        imageUrl: topRated ? mapToFeaturedProduct(topRated).imageUrl : "https://placehold.co/1200x700?text=Top+Rated",
        ctaHref: "/shop?sort=rating",
      },
      {
        id: "hero-new-arrivals",
        preTitle: "New Arrivals",
        title: latest?.title ?? "Latest Collection",
        priceText: latest ? `starting at ${mapToNewArrivalProduct(latest).price}` : "Explore the newest products",
        bgClassName: "from-emerald-500 via-teal-600 to-cyan-700",
        accent: "Just In",
        imageUrl: latest ? mapToNewArrivalProduct(latest).imageUrl : "https://placehold.co/1200x700?text=New+Arrivals",
        ctaHref: "/shop?sort=latest",
      },
    ];
  } catch {
    featuredProducts = [];
    newArrivalProducts = [];
    heroSlides = [];
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <main className="w-full space-y-10 py-6 sm:space-y-14 sm:py-8 lg:py-10">
        <HeroSection slides={heroSlides} />
        <CategorySection categories={categories} />
        <div className="mx-auto w-full max-w-[1500px] space-y-10 px-4 sm:space-y-14 sm:px-6 lg:px-8">
          <FeaturedProductsSection products={featuredProducts} />
          <ServiceFeaturesSection />
          <NewArrivalsSection products={newArrivalProducts} />
          <ClientReviewSection reviews={clientReviews} />
          <NewsletterSection />
        </div>
      </main>
    </div>
  );
}
