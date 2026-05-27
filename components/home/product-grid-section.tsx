import type { HomeProduct } from "./types";
import { HomeProductCard } from "./home-product-card";
import { SectionHeader } from "./section-header";
import { SectionContainer } from "./ui/section-container";

type ProductGridSectionProps = {
  id?: string;
  title: string;
  subtitle?: string;
  products: HomeProduct[];
  actionLabel?: string;
  actionHref?: string;
  className?: string;
  bgClassName?: string;
};

export function ProductGridSection({
  id,
  title,
  subtitle,
  products,
  actionLabel = "View all",
  actionHref = "/shop",
  className,
  bgClassName,
}: ProductGridSectionProps) {
  if (products.length === 0) return null;

  return (
    <SectionContainer id={id} className={className}>
      <div
        className={`mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8 ${bgClassName ?? ""}`}
      >
        <SectionHeader
          title={title}
          subtitle={subtitle}
          actionLabel={actionLabel}
          actionHref={actionHref}
        />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
          {products.map((product, index) => (
            <HomeProductCard
              key={product.id ?? product.title}
              product={product}
              index={index}
            />
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
