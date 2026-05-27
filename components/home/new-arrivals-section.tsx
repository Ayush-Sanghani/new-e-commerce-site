import type { HomeProduct } from "./types";
import { ProductGridSection } from "./product-grid-section";

type NewArrivalsSectionProps = {
  products: HomeProduct[];
};

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  return (
    <ProductGridSection
      title="New Arrivals"
      subtitle="Fresh picks just landed"
      products={products}
      actionHref="/shop?sort=latest"
      actionLabel="Shop all collection"
    />
  );
}
