import { BestSellersSection } from "@/components/home/best-sellers-section";
import { HeroSection } from "@/components/home/hero-section";
import { NewArrivalsSection } from "@/components/home/new-arrivals-section";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { RecentlyViewedSection } from "@/components/home/recently-viewed-section";
import { ServiceFeaturesSection } from "@/components/home/service-features-section";
import { SocialProofSection } from "@/components/home/social-proof-section";
import { TrendingProductsSection } from "@/components/home/trending-products-section";
import { fetchHomePageData } from "@/lib/home/fetch-home-page-data";

export default async function HomePage() {
  const {
    bestSellers,
    trendingProducts,
    newArrivalProducts,
    catalogProducts,
    heroSlides,
    error,
  } = await fetchHomePageData();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 lg:pb-0">
      {error ? (
        <div
          className="mx-auto max-w-[1500px] px-4 pt-4 sm:px-6 lg:px-8"
          role="alert"
        >
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Some products could not be loaded. Please refresh the page or try again
            later.
          </p>
        </div>
      ) : null}
      <main className="w-full space-y-2 sm:space-y-4">
        <HeroSection slides={heroSlides} />
        <BestSellersSection products={bestSellers} />
        <ServiceFeaturesSection />
        <TrendingProductsSection products={trendingProducts} />
        <SocialProofSection />
        <NewArrivalsSection products={newArrivalProducts} />
        <RecentlyViewedSection catalog={catalogProducts} />
        <NewsletterSection />
      </main>
    </div>
  );
}
