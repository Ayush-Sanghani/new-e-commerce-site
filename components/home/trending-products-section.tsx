import type { HomeProduct } from "./types";
import { ProductGridSection } from "./product-grid-section";

type TrendingProductsSectionProps = {
  products: HomeProduct[];
};

export function TrendingProductsSection({ products }: TrendingProductsSectionProps) {
  return (
    <ProductGridSection
      title="Trending Now"
      subtitle="What's hot this week"
      products={products}
      actionHref="/shop?sort=latest"
      actionLabel="Explore trending"
    />
  );
}
