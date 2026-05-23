import Link from "next/link";
import type { NewArrivalProduct } from "./types";
import { Card } from "./ui/card";
import { SectionContainer } from "./ui/section-container";

type NewArrivalsSectionProps = {
  products: NewArrivalProduct[];
};

export function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  return (
    <SectionContainer className="px-1 py-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800">New Arrivals</h2>
        <p className="mt-1 text-sm text-slate-500">Browse the collection of top products</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        {products.map((product) => (
          <Card key={product.id ?? product.title} as="article" className="rounded-lg p-3 sm:p-5 lg:p-6">
            <Link
              href={product.id ? `/shop/${product.id}` : "#"}
              className={`block ${product.id ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className="relative overflow-hidden rounded-md bg-neutral-100">
                {product.badge ? (
                  <span className="absolute left-2 top-2 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    {product.badge}
                  </span>
                ) : null}
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="h-36 w-full object-cover transition duration-300 hover:scale-105 sm:h-52"
                  loading="lazy"
                />
              </div>

              <h3 className="mt-3 min-h-10 text-sm font-semibold leading-snug text-slate-800 transition hover:text-blue-700 sm:mt-5 sm:min-h-12 sm:text-base">
                {product.title}
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:mt-3 sm:gap-2">
                <p className="text-base font-bold text-blue-700 sm:text-lg">{product.price}</p>
                {product.oldPrice ? (
                  <p className="text-xs text-slate-400 line-through sm:text-sm">{product.oldPrice}</p>
                ) : null}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2 sm:mt-3">
                {product.colors.map((color) => (
                  <span
                    key={`${product.title}-${color}`}
                    className="h-4 w-4 rounded-full border border-white shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
                {product.sizes?.map((size) => (
                  <span
                    key={`${product.title}-${size}`}
                    className="rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center">
        <a href="#" className="inline-block border-b-2 border-slate-700 text-sm font-semibold text-slate-800">
          Shop All Collection
        </a>
      </div>
    </SectionContainer>
  );
}
