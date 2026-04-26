import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { categoryGroups } from "@/components/home/data";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { mapProductRecordToDetail, mapRelatedRecord } from "@/components/product/mappers";
import { ProductDetailView } from "@/components/product/product-detail-view";
import { verifyToken } from "@/lib/jwt";
import { getCartForUser } from "@/lib/services/cart";
import { getProductById, listProducts } from "@/lib/services/product-queries";
import type { ProductListQuery } from "@/lib/validations/product-query";

type ProductDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) redirect("/login");

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    redirect("/login");
  }

  const { id } = await params;
  const rawProduct = await getProductById(id);
  if (!rawProduct) notFound();

  const product = mapProductRecordToDetail(
    rawProduct as Parameters<typeof mapProductRecordToDetail>[0]
  );

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
    .map((item) => mapRelatedRecord(item as Parameters<typeof mapRelatedRecord>[0]));

  const displayName = payload.email?.split("@")[0] || "Guest";
  const cart = await getCartForUser(payload.sub);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <HomeHeader displayName={displayName} categoryGroups={categoryGroups} cartCount={cartCount} />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
      <HomeFooter />
    </div>
  );
}
