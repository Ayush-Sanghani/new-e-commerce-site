import { z } from "zod";

/** Which field(s) the `q` search term applies to. `all` = title, description, sku. */
export const searchKeySchema = z.enum(["all", "title", "description", "sku"]);

/** Which column to order by. `all` = default sort (createdAt). */
export const sortKeySchema = z.enum(["all", "price", "rating", "createdAt", "title", "stock"]);

export const sortOrderSchema = z.enum(["asc", "desc"]);

/**
 * Which dimension filters active rows. `all` = no relation filter; optional
 * minPrice/maxPrice/inStock/availability still apply when passed.
 */
export const filterKeySchema = z.enum([
  "all",
  "category",
  "brand",
  "tag",
  "price",
  "availability",
  "stock",
]);

const baseQuery = z.object({
  q: z.string().trim().optional().default(""),
  searchKey: searchKeySchema.default("all"),
  sortKey: sortKeySchema.default("all"),
  sortOrder: sortOrderSchema.default("desc"),
  filterKey: filterKeySchema.default("all"),
  categoryId: z.string().trim().optional(),
  categorySlug: z.string().trim().optional(),
  brandId: z.string().trim().optional(),
  tag: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  availabilityStatus: z.string().trim().optional(),
  inStock: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const productListQuerySchema = baseQuery.superRefine((data, ctx) => {
  const { filterKey } = data;

  if (filterKey === "category") {
    if (!data.categoryId && !data.categorySlug) {
      ctx.addIssue({
        code: "custom",
        message: "When filterKey is category, provide categoryId or categorySlug.",
        path: ["categoryId"],
      });
    }
  }
  if (filterKey === "brand" && !data.brandId) {
    ctx.addIssue({
      code: "custom",
      message: "When filterKey is brand, provide brandId.",
      path: ["brandId"],
    });
  }
  if (filterKey === "tag" && !data.tag) {
    ctx.addIssue({
      code: "custom",
      message: "When filterKey is tag, provide tag (tag name).",
      path: ["tag"],
    });
  }
  if (filterKey === "price") {
    if (data.minPrice === undefined && data.maxPrice === undefined) {
      ctx.addIssue({
        code: "custom",
        message: "When filterKey is price, provide minPrice and/or maxPrice.",
        path: ["minPrice"],
      });
    }
  }
  if (filterKey === "availability" && !data.availabilityStatus) {
    ctx.addIssue({
      code: "custom",
      message: "When filterKey is availability, provide availabilityStatus.",
      path: ["availabilityStatus"],
    });
  }
  if (filterKey === "stock" && data.inStock === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "When filterKey is stock, provide inStock (true or false).",
      path: ["inStock"],
    });
  }

  if (
    data.minPrice !== undefined &&
    data.maxPrice !== undefined &&
    data.minPrice > data.maxPrice
  ) {
    ctx.addIssue({
      code: "custom",
      message: "minPrice cannot be greater than maxPrice.",
      path: ["minPrice"],
    });
  }
});

export type ProductListQuery = z.infer<typeof productListQuerySchema>;

/** Parse GET /api/products query string (all params optional; Zod applies defaults). */
export function parseProductListQuery(searchParams: URLSearchParams) {
  return productListQuerySchema.safeParse({
    q: searchParams.get("q") ?? undefined,
    searchKey: searchParams.get("searchKey") ?? undefined,
    sortKey: searchParams.get("sortKey") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
    filterKey: searchParams.get("filterKey") ?? undefined,
    categoryId: searchParams.get("categoryId") ?? undefined,
    categorySlug: searchParams.get("categorySlug") ?? undefined,
    brandId: searchParams.get("brandId") ?? undefined,
    tag: searchParams.get("tag") ?? undefined,
    minPrice: searchParams.get("minPrice") ?? undefined,
    maxPrice: searchParams.get("maxPrice") ?? undefined,
    availabilityStatus: searchParams.get("availabilityStatus") ?? undefined,
    inStock: searchParams.get("inStock") ?? undefined,
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
  });
}
