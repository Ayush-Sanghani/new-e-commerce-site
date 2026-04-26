import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import type { ProductListQuery } from "@/lib/validations/product-query";

/** Fields required for shop / GET list cards only (no description, brand, tags, etc.). */
const productListSelect = {
  id: true,
  title: true,
  price: true,
  discountPercentage: true,
  rating: true,
  thumbnail: true,
  category: { select: { name: true } },
  images: {
    orderBy: { sortOrder: "asc" as const },
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

export type ProductListItem = Prisma.ProductGetPayload<{ select: typeof productListSelect }>;

function resolveSort(
  sortKey: ProductListQuery["sortKey"],
  sortOrder: ProductListQuery["sortOrder"]
): Prisma.ProductOrderByWithRelationInput {
  const dir = sortOrder;
  const field =
    sortKey === "all" ? "createdAt" : sortKey === "price" ? "price" : sortKey === "rating" ? "rating" : sortKey === "createdAt" ? "createdAt" : sortKey === "title" ? "title" : "stock";

  if (field === "rating") {
    return { rating: { sort: dir, nulls: "last" } };
  }
  return { [field]: dir } as Prisma.ProductOrderByWithRelationInput;
}

function buildSearchWhere(
  q: string,
  searchKey: ProductListQuery["searchKey"]
): Prisma.ProductWhereInput | undefined {
  if (!q) return undefined;

  const mode: Prisma.QueryMode = "insensitive";
  const contains = { contains: q, mode };

  if (searchKey === "all") {
    return {
      OR: [
        { title: contains },
        { description: contains },
        { sku: contains },
      ],
    };
  }

  if (searchKey === "title") return { title: contains };
  if (searchKey === "description") return { description: contains };

  return { sku: contains };
}

function buildFilterWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const { filterKey } = query;
  const and: Prisma.ProductWhereInput[] = [];

  if (filterKey === "category") {
    if (query.categoryId) and.push({ categoryId: query.categoryId });
    else if (query.categorySlug) {
      and.push({ category: { slug: query.categorySlug } });
    }
  } else if (filterKey === "brand" && query.brandId) {
    and.push({ brandId: query.brandId });
  } else if (filterKey === "tag" && query.tag) {
    and.push({
      tags: { some: { tag: { name: { equals: query.tag, mode: "insensitive" } } } },
    });
  } else if (filterKey === "price") {
    const price: Prisma.DecimalFilter = {};
    if (query.minPrice !== undefined) price.gte = query.minPrice;
    if (query.maxPrice !== undefined) price.lte = query.maxPrice;
    and.push({ price });
  } else if (filterKey === "availability" && query.availabilityStatus) {
    and.push({ availabilityStatus: query.availabilityStatus });
  } else if (filterKey === "stock" && query.inStock !== undefined) {
    and.push(query.inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } });
  }

  if (filterKey !== "price" && (query.minPrice !== undefined || query.maxPrice !== undefined)) {
    const price: Prisma.DecimalFilter = {};
    if (query.minPrice !== undefined) price.gte = query.minPrice;
    if (query.maxPrice !== undefined) price.lte = query.maxPrice;
    and.push({ price });
  }
  if (filterKey !== "availability" && query.availabilityStatus) {
    and.push({ availabilityStatus: query.availabilityStatus });
  }
  if (filterKey !== "stock" && query.inStock !== undefined) {
    and.push(query.inStock ? { stock: { gt: 0 } } : { stock: { lte: 0 } });
  }

  if (and.length === 0) return {};
  return { AND: and };
}

function buildWhere(query: ProductListQuery): Prisma.ProductWhereInput {
  const search = buildSearchWhere(query.q, query.searchKey);
  const filter = buildFilterWhere(query);

  const parts: Prisma.ProductWhereInput[] = [];
  if (search) parts.push(search);
  if (Object.keys(filter).length > 0) parts.push(filter);

  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0]!;
  return { AND: parts };
}

/** Prisma Decimal → number (recursive for nested includes) */
export function serializeProduct<T>(row: T): T {
  function walk(v: unknown): unknown {
    if (v === null || v === undefined) return v;
    if (typeof v === "object") {
      if (typeof (v as { toNumber?: () => number }).toNumber === "function") {
        return (v as { toNumber: () => number }).toNumber();
      }
      if (Array.isArray(v)) return v.map(walk);
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = walk(val);
      }
      return out;
    }
    return v;
  }
  return walk(row) as T;
}

export async function listProducts(query: ProductListQuery) {
  const where = buildWhere(query);
  const skip = (query.page - 1) * query.pageSize;
  const orderBy = resolveSort(query.sortKey, query.sortOrder);

  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: query.pageSize,
      select: productListSelect,
    }),
  ]);

  return {
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(total / query.pageSize) || 1,
    products: rows.map((p) => serializeProduct(p as unknown as Record<string, unknown>)),
  };
}

const productDetailInclude = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  tags: { include: { tag: true } },
  reviews: { orderBy: { createdAt: "desc" as const } },
} satisfies Prisma.ProductInclude;

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
  if (!product) return null;
  return serializeProduct(product as unknown as Record<string, unknown>);
}
