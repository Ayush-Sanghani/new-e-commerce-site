import { categoryGroups } from "@/components/home/data";
import { ShopListingPage } from "@/components/shop/shop-listing-page";
import { listProducts } from "@/lib/services/product-queries";
import {
  defaultProductListQuery,
  mapListItemToShopProduct,
  normalizeShopSearchParams,
  resolveCategorySlug,
  shopStateToApiSearchParams,
  type ShopCategoryChip,
} from "@/lib/shop/listing-params";
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

  const categoryLookup: ShopCategoryChip[] = categoryGroups.flatMap((group) =>
    group.items.map((item) => ({
      id: item.slug,
      slug: item.slug,
      name: item.label,
    }))
  );
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
      mapListItemToShopProduct(
        row as Parameters<typeof mapListItemToShopProduct>[0]
      )
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
