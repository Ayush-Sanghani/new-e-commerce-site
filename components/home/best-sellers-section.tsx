import type { HomeProduct } from "./types";
import { ProductGridSection } from "./product-grid-section";

type BestSellersSectionProps = {
  products: HomeProduct[];
};

export function BestSellersSection({ products }: BestSellersSectionProps) {
  return (
    <ProductGridSection
      id="best-sellers"
      title="Best Sellers"
      subtitle="Most loved by our customers"
      products={products}
      actionHref="/shop?sort=rating"
      actionLabel="See best sellers"
      bgClassName="rounded-3xl bg-white py-8 sm:py-10"
    />
  );
}
