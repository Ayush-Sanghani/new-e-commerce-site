import Link from "next/link";
import type { FeaturedProduct } from "./types";
import { SectionHeader } from "./section-header";
import { Card } from "./ui/card";
import { SectionContainer } from "./ui/section-container";

type FeaturedProductsSectionProps = {
  products: FeaturedProduct[];
};

export function FeaturedProductsSection({
  products,
}: FeaturedProductsSectionProps) {
  return (
    <SectionContainer>
      <SectionHeader title="Featured Products" actionLabel="Browse shop" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
        {products.map((product) => (
          <FeaturedProductCard key={product.id ?? product.title} product={product} />
        ))}
      </div>
    </SectionContainer>
  );
}

type FeaturedProductCardProps = {
  product: FeaturedProduct;
};

function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  return (
    <Card as="article" className="rounded-lg p-3 sm:p-5 lg:p-6">
      <Link
        href={product.id ? `/shop/${product.id}` : "#"}
        className={`block ${product.id ? "cursor-pointer" : "cursor-default"}`}
      >
        <div className="overflow-hidden rounded-md bg-neutral-100">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="h-36 w-full object-cover transition duration-300 hover:scale-105 sm:h-52"
            loading="lazy"
          />
        </div>
        <p className="mt-3 inline-block rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700 sm:mt-5 sm:px-3 sm:py-1.5 sm:text-xs">
          {product.tag}
        </p>
        <h3 className="mt-3 min-h-10 text-sm font-semibold leading-snug text-slate-800 transition hover:text-blue-700 sm:mt-4 sm:min-h-12 sm:text-base">
          {product.title}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
          <p className="text-base font-bold text-blue-700 sm:text-lg">{product.price}</p>
          <p className="text-xs text-slate-400 line-through sm:text-sm">{product.oldPrice}</p>
        </div>
        <span className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-blue-900 py-2 text-sm font-semibold text-white sm:mt-5 sm:py-2.5 sm:text-base">
          View details
        </span>
      </Link>
    </Card>
  );
}
