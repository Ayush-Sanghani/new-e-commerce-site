import Link from "next/link";
import { formatInr } from "@/lib/pricing";
import { formatCategoryDisplayName } from "@/lib/shop/listing-params";
import { ProductCard } from "./product-card";
import {
  ShopFiltersPanel,
  ShopFiltersProvider,
  ShopFiltersToggle,
} from "./shop-filters-collapsible";
import type { ShopProduct } from "./types";

export type ShopCategoryChip = { value: string; label: string };

type ShopListingPageProps = {
  products: ShopProduct[];
  categories: string[];
  categoryChips: ShopCategoryChip[];
  total: number;
  page: number;
  totalPages: number;
  error?: string | null;
  category?: string;
  sort?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

type ShopHrefParams = {
  category?: string;
  sort?: string;
  search?: string;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

function buildShopHref(params: ShopHrefParams) {
  const sp = new URLSearchParams();
  const trimmed = params.search?.trim();
  if (trimmed) sp.set("search", trimmed);
  if (params.category && params.category !== "All") sp.set("category", params.category);
  if (params.sort && params.sort !== "latest") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  if (params.minPrice !== undefined) sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) sp.set("maxPrice", String(params.maxPrice));
  if (params.inStock === true) sp.set("inStock", "true");
  const q = sp.toString();
  return q ? `/shop?${q}` : "/shop";
}

function hasActivePriceOrStockFilters(params: {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}) {
  return (
    params.minPrice !== undefined ||
    params.maxPrice !== undefined ||
    params.inStock === true
  );
}

function activeFilterLabels(params: {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): string[] {
  const labels: string[] = [];
  if (params.minPrice !== undefined && params.maxPrice !== undefined) {
    labels.push(`${formatInr(params.minPrice)}–${formatInr(params.maxPrice)}`);
  } else if (params.minPrice !== undefined) {
    labels.push(`from ${formatInr(params.minPrice)}`);
  } else if (params.maxPrice !== undefined) {
    labels.push(`up to ${formatInr(params.maxPrice)}`);
  }
  if (params.inStock) labels.push("In stock only");
  return labels;
}

function ShopPersistedFields({
  search,
  category,
  sort,
  minPrice,
  maxPrice,
  inStock,
  omitSort = false,
}: {
  search: string;
  category: string;
  sort: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  omitSort?: boolean;
}) {
  return (
    <>
      {search ? <input type="hidden" name="search" value={search} /> : null}
      {category !== "All" ? <input type="hidden" name="category" value={category} /> : null}
      {!omitSort && sort !== "latest" ? (
        <input type="hidden" name="sort" value={sort} />
      ) : null}
      {minPrice !== undefined ? (
        <input type="hidden" name="minPrice" value={String(minPrice)} />
      ) : null}
      {maxPrice !== undefined ? (
        <input type="hidden" name="maxPrice" value={String(maxPrice)} />
      ) : null}
      {inStock ? <input type="hidden" name="inStock" value="true" /> : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ShopListingPage({
  products,
  categoryChips,
  total,
  page,
  totalPages,
  error,
  category,
  sort = "latest",
  search,
  minPrice,
  maxPrice,
  inStock,
}: ShopListingPageProps) {
  const activeCategoryValue = category ?? "All";
  const activeCategoryLabel =
    categoryChips.find((c) => c.value === activeCategoryValue)?.label ??
    (activeCategoryValue === "All"
      ? "All"
      : formatCategoryDisplayName(activeCategoryValue));
  const searchTrimmed = search?.trim() ?? "";
  const filterState = { minPrice, maxPrice, inStock };
  const showClearFilters = hasActivePriceOrStockFilters(filterState);
  const filterLabels = activeFilterLabels(filterState);
  const activeFilterCount =
    (minPrice !== undefined ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0) +
    (inStock ? 1 : 0) +
    (sort !== "latest" ? 1 : 0);
  const filtersDefaultOpen = activeFilterCount > 0;

  const hrefBase: ShopHrefParams = {
    search: searchTrimmed,
    sort,
    minPrice,
    maxPrice,
    inStock,
  };

  const inputClass =
    "rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-800 transition placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <ShopFiltersProvider
        defaultOpen={filtersDefaultOpen}
        activeCount={activeFilterCount}
      >
        <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-end gap-3">
            <form action="/shop" method="get" className="min-w-0 flex-1">
              <label
                htmlFor="shop-search"
                className="mb-1.5 block text-sm font-medium text-slate-600"
              >
                Search
              </label>
              <div className="relative">
                <input
                  id="shop-search"
                  name="search"
                  type="search"
                  placeholder="Search by product name or category…"
                  defaultValue={searchTrimmed}
                  className={`${inputClass} w-full py-2.5 pr-12 pl-4`}
                  autoComplete="off"
                />
                <ShopPersistedFields
                  search=""
                  category={activeCategoryValue}
                  sort={sort}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  inStock={inStock}
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute top-1/2 right-1.5 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <SearchIcon />
                </button>
              </div>
            </form>
            <ShopFiltersToggle />
          </div>

          <form action="/shop" method="get" className="space-y-4">
            <ShopPersistedFields
              search={searchTrimmed}
              category={activeCategoryValue}
              sort={sort}
              omitSort
            />
            <ShopFiltersPanel>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
              <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
                <div className="min-w-[7rem] flex-1 sm:max-w-[9rem]">
                  <label
                    htmlFor="minPrice"
                    className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Min price (₹)
                  </label>
                  <input
                    id="minPrice"
                    name="minPrice"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="0"
                    defaultValue={minPrice !== undefined ? String(minPrice) : ""}
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div className="min-w-[7rem] flex-1 sm:max-w-[9rem]">
                  <label
                    htmlFor="maxPrice"
                    className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500"
                  >
                    Max price (₹)
                  </label>
                  <input
                    id="maxPrice"
                    name="maxPrice"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="Any"
                    defaultValue={maxPrice !== undefined ? String(maxPrice) : ""}
                    className={`${inputClass} w-full`}
                  />
                </div>
                <div className="flex items-center gap-3 pb-0.5 sm:pb-1">
                  <label
                    htmlFor="inStock"
                    className="text-sm font-medium text-slate-700"
                  >
                    In stock only
                  </label>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      id="inStock"
                      type="checkbox"
                      name="inStock"
                      value="true"
                      defaultChecked={inStock === true}
                      className="peer sr-only"
                    />
                    <span className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-blue-600 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500/40" />
                    <span className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
                  </label>
                </div>
              </div>
              <div className="flex min-w-[10rem] flex-1 flex-col gap-1 sm:max-w-[12rem]">
                <label
                  htmlFor="sort"
                  className="text-xs font-medium uppercase tracking-wide text-slate-500"
                >
                  Sort by
                </label>
                <select
                  id="sort"
                  name="sort"
                  defaultValue={sort}
                  className={`${inputClass} w-full`}
                >
                  <option value="latest">Latest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2 lg:pb-0.5">
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  Apply filters
                </button>
                {showClearFilters ? (
                  <Link
                    href={buildShopHref({
                      search: searchTrimmed,
                      category: activeCategoryValue,
                      sort,
                    })}
                    className="inline-flex items-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-neutral-400 hover:bg-neutral-50"
                  >
                    Clear filters
                  </Link>
                ) : null}
              </div>
            </div>
              </div>


            </ShopFiltersPanel>
          </form>
        </section>
      </ShopFiltersProvider>

      <section className="mt-4 space-y-6">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing {products.length} product{products.length === 1 ? "" : "s"}
            {total > products.length ? ` (of ${total})` : ""}
            {activeCategoryValue !== "All" ? ` in ${activeCategoryLabel}` : ""}
            {searchTrimmed ? ` for “${searchTrimmed}”` : ""}
            {filterLabels.length > 0 ? (
              <span className="text-slate-700">
                {" "}
                · Filters: {filterLabels.join(", ")}
              </span>
            ) : null}
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!error && products.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white px-4 py-8 text-center text-sm text-slate-600 shadow-sm">
            No products found for current filters.
            {showClearFilters ? (
              <>
                {" "}
                <Link
                  href={buildShopHref({
                    search: searchTrimmed,
                    category: activeCategoryValue,
                    sort,
                  })}
                  className="font-medium text-blue-700 underline transition hover:text-blue-800"
                >
                  Clear filters
                </Link>
              </>
            ) : null}
          </div>
        ) : null}

        {totalPages > 1 ? (
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => {
              const isActive = pageNumber === page;
              return (
                <Link
                  key={pageNumber}
                  href={buildShopHref({
                    ...hrefBase,
                    category: activeCategoryValue,
                    page: pageNumber,
                  })}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm transition duration-200 ${
                    isActive
                      ? "border-blue-600 bg-blue-600 font-bold text-white shadow-sm"
                      : "border-neutral-300 bg-white text-slate-600 hover:border-neutral-400 hover:bg-neutral-50 hover:shadow-sm"
                  }`}
                >
                  {pageNumber}
                </Link>
              );
            })}
          </div>
        ) : null}
      </section>
    </main>
  );
}
