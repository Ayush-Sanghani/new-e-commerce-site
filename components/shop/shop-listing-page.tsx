import Link from "next/link";
import { ProductCard } from "./product-card";
import type { ShopProduct } from "./types";

type ShopListingPageProps = {
  products: ShopProduct[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  error?: string | null;
  category?: string;
  sort?: string;
  search?: string;
};

function buildShopHref(params: {
  category?: string;
  sort?: string;
  search?: string;
  page?: number;
}) {
  const sp = new URLSearchParams();
  const trimmed = params.search?.trim();
  if (trimmed) sp.set("search", trimmed);
  if (params.category && params.category !== "All") sp.set("category", params.category);
  if (params.sort && params.sort !== "latest") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const q = sp.toString();
  return q ? `/shop?${q}` : "/shop";
}

export function ShopListingPage({
  products,
  categories,
  total,
  page,
  totalPages,
  error,
  category,
  sort = "latest",
  search,
}: ShopListingPageProps) {
  const activeCategory = category ?? "All";
  const categoryChips = ["All", ...categories];
  const searchTrimmed = search?.trim() ?? "";

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">
          <Link href="/home" className="hover:text-slate-800">
            Home
          </Link>{" "}
          / <span className="text-slate-700">Shop</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Product Listing
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Search, filter by category, and sort products.
        </p>
      </section>

      <section className="rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
        <form
          action="/shop"
          method="get"
          className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-3"
        >
          <div className="min-w-0 flex-1">
            <label htmlFor="shop-search" className="mb-1 block text-sm font-medium text-slate-600">
              Search
            </label>
            <input
              id="shop-search"
              name="search"
              type="search"
              placeholder="Search by product name or category…"
              defaultValue={searchTrimmed}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
              autoComplete="off"
            />
          </div>
          {activeCategory !== "All" ? (
            <input type="hidden" name="category" value={activeCategory} />
          ) : null}
          {sort !== "latest" ? <input type="hidden" name="sort" value={sort} /> : null}
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 sm:mb-0"
          >
            Search
          </button>
        </form>

        <div className="flex flex-col gap-4 border-t border-neutral-200 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {categoryChips.map((item) => {
              const isActive = item === activeCategory;
              const href =
                item === "All"
                  ? buildShopHref({ search: searchTrimmed, sort })
                  : buildShopHref({
                      category: item,
                      search: searchTrimmed,
                      sort,
                    });

              return (
                <Link
                  key={item}
                  href={href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-100 text-slate-700 hover:bg-neutral-200"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          <form action="/shop" method="get" className="flex flex-wrap items-center gap-2">
            {searchTrimmed ? (
              <input type="hidden" name="search" value={searchTrimmed} />
            ) : null}
            {activeCategory !== "All" ? (
              <input type="hidden" name="category" value={activeCategory} />
            ) : null}
            <label htmlFor="sort" className="text-sm font-medium text-slate-600">
              Sort by:
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none"
            >
              <option value="latest">Latest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Apply
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Showing {products.length} product{products.length === 1 ? "" : "s"}
            {total > products.length ? ` (of ${total})` : ""}
            {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
            {searchTrimmed ? ` for “${searchTrimmed}”` : ""}
          </p>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!error && products.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white px-4 py-6 text-center text-sm text-slate-600">
            No products found for current filters.
          </div>
        ) : null}

        {totalPages > 1 ? (
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNumber) => {
              const isActive = pageNumber === page;
              return (
                <Link
                  key={pageNumber}
                  href={buildShopHref({
                    category: activeCategory,
                    sort,
                    search: searchTrimmed,
                    page: pageNumber,
                  })}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    isActive
                      ? "border-blue-600 bg-blue-600 font-semibold text-white"
                      : "border-neutral-300 bg-white text-slate-600"
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
