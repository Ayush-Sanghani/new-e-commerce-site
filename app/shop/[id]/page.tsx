import { notFound } from "next/navigation";
import { mapProductRecordToDetail, mapRelatedRecord } from "@/components/product/mappers";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { TrackRecentlyViewed } from "@/components/product/track-recently-viewed";
import { convertInrPriceForDisplay } from "@/lib/catalog-display";
import { getServerDisplayCurrency } from "@/lib/server-currency";
import { getProductById, listProducts } from "@/lib/services/product-queries";
import type { ProductListQuery } from "@/lib/validations/product-query";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const { context } = await getServerDisplayCurrency();
  const rawProduct = await getProductById(id);
  if (!rawProduct) notFound();

  const productInr = mapProductRecordToDetail(
    rawProduct as Parameters<typeof mapProductRecordToDetail>[0]
  );
  const product = {
    ...productInr,
    price: convertInrPriceForDisplay(productInr.price, context),
    oldPrice:
      productInr.oldPrice != null
        ? convertInrPriceForDisplay(productInr.oldPrice, context)
        : undefined,
  };

  const categorySlug = (rawProduct as { category?: { slug?: string } }).category?.slug;
  const relatedQuery: ProductListQuery = {
    q: "",
    searchKey: "all",
    sortKey: "createdAt",
    sortOrder: "desc",
    filterKey: categorySlug ? "category" : "all",
    categorySlug,
    categoryId: undefined,
    brandId: undefined,
    tag: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    availabilityStatus: undefined,
    inStock: undefined,
    page: 1,
    pageSize: 8,
  };
  const relatedList = await listProducts(relatedQuery);
  const relatedProducts = relatedList.products
    .filter((item) => item.id !== id)
    .slice(0, 3)
    .map((item) => {
      const related = mapRelatedRecord({
        id: item.id,
        title: item.title,
        category: item.category,
        price: Number(item.price),
        discountPercentage: Number(item.discountPercentage),
        images: item.images,
        thumbnail: item.thumbnail,
      });
      return {
        ...related,
        price: convertInrPriceForDisplay(related.price, context),
        oldPrice:
          related.oldPrice != null
            ? convertInrPriceForDisplay(related.oldPrice, context)
            : undefined,
      };
    });

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <TrackRecentlyViewed productId={id} />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        currencyCode={context.code}
        currencySymbol={context.symbol}
      />
    </div>
  );
}
