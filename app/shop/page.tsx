import { ShopListingPage } from "@/components/shop/shop-listing-page";
import { toShopCategoryChips } from "@/lib/shop/categories";
import {
  defaultProductListQuery,
  mapListItemToShopProduct,
  normalizeShopSearchParams,
  resolveCategorySlug,
  shopStateToApiSearchParams,
} from "@/lib/shop/listing-params";
import { listCategories, listProducts } from "@/lib/services/product-queries";
import { parseProductListQuery } from "@/lib/validations/product-query";

type ShopPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    sort?: string | string[];
    search?: string | string[];
    page?: string | string[];
    minPrice?: string | string[];
    maxPrice?: string | string[];
    inStock?: string | string[];
  }>;
};

function firstString(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const normalized = normalizeShopSearchParams({
    search: firstString(params.search),
    category: firstString(params.category),
    sort: firstString(params.sort),
    page: firstString(params.page),
    minPrice: firstString(params.minPrice),
    maxPrice: firstString(params.maxPrice),
    inStock: firstString(params.inStock),
  });

  const catalogCategories = await listCategories();
  const categoryLookup = toShopCategoryChips(catalogCategories);
  const categorySlug = resolveCategorySlug(normalized.categoryParam, categoryLookup);
  const apiSearchParams = shopStateToApiSearchParams({
    q: normalized.search,
    categorySlug,
    sort: normalized.sort,
    page: normalized.page,
    minPrice: normalized.minPrice,
    maxPrice: normalized.maxPrice,
    inStock: normalized.inStock,
  });
  const parsed = parseProductListQuery(apiSearchParams);
  const query = parsed.success ? parsed.data : defaultProductListQuery();

  let products: ReturnType<typeof mapListItemToShopProduct>[] = [];
  let categories: string[] = [];
  let total = 0;
  let page = normalized.page;
  let totalPages = 1;
  let error: string | null = null;

  try {
    const data = await listProducts(query);
    products = data.products.map((row) =>
      mapListItemToShopProduct({
        id: row.id,
        title: row.title,
        price: Number(row.price),
        discountPercentage: Number(row.discountPercentage),
        rating: row.rating,
        thumbnail: row.thumbnail,
        stock: row.stock,
        minimumOrderQuantity: row.minimumOrderQuantity,
        availabilityStatus: row.availabilityStatus,
        category: row.category,
        images: row.images,
      })
    );
    categories = Array.from(
      new Set(
        data.products
          .map(
            (row) =>
              (row as { category?: { name?: string } }).category?.name?.trim()
          )
          .filter((name): name is string => Boolean(name))
      )
    );
    total = data.total;
    page = data.page;
    totalPages = data.totalPages;
  } catch {
    error = "Failed to load products. Please try again.";
  }

  const categoryChips = [
    { value: "All", label: "All" },
    ...categoryLookup.map((c) => ({ value: c.slug, label: c.name })),
  ];

  const activeCategoryValue = categorySlug ?? "All";

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <ShopListingPage
        products={products}
        categories={categories}
        categoryChips={categoryChips}
        total={total}
        page={page}
        totalPages={totalPages}
        error={error}
        category={activeCategoryValue}
        sort={normalized.sort}
        search={normalized.search}
        minPrice={normalized.minPrice}
        maxPrice={normalized.maxPrice}
        inStock={normalized.inStock}
      />
    </div>
  );
}
