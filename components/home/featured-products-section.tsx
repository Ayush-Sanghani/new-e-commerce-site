import type { HomeProduct } from "./types";
import { ProductGridSection } from "./product-grid-section";

type FeaturedProductsSectionProps = {
  products: HomeProduct[];
};

export function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  return (
    <ProductGridSection
      title="Featured Products"
      subtitle="Hand-picked deals for you"
      products={products}
      actionLabel="Browse shop"
      actionHref="/shop"
    />
  );
}
