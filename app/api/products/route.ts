import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createProduct } from "@/lib/services/product-mutations";
import { listProducts } from "@/lib/services/product-queries";
import { createProductBodySchema } from "@/lib/validations/product-mutation";
import { parseProductListQuery } from "@/lib/validations/product-query";

/**
 * GET /api/products
 *
 * Query params:
 * - q: search text (optional)
 * - searchKey: all | title | description | sku (default all)
 * - sortKey: all | price | rating | createdAt | title | stock (default all → createdAt)
 * - sortOrder: asc | desc (default desc)
 * - filterKey: all | category | brand | tag | price | availability | stock (default all)
 * - categoryId, categorySlug, brandId, tag, minPrice, maxPrice, availabilityStatus, inStock
 * - page, pageSize (default 1, 20; max pageSize 100)
 */
export async function GET(request: NextRequest) {
  const parsed = parseProductListQuery(request.nextUrl.searchParams);
  if (!parsed.success) {
    const first = parsed.error.flatten();
    return NextResponse.json(
      {
        success: false,
        message: "Invalid query parameters.",
        error: first.fieldErrors,
      },
      { status: 400 }
    );
  }

  try {
    const data = await listProducts(parsed.data);
    return NextResponse.json({
      success: true,
      message: "Products fetched.",
      data,
    });
  } catch (err) {
    console.error("GET /api/products:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch products.", data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products — create product (admin only).
 * Body: JSON matching createProductBodySchema (categoryId or categorySlug required).
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error, data: null },
      { status: auth.status }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body.", data: null },
      { status: 400 }
    );
  }

  const parsed = createProductBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Validation failed.",
        error: parsed.error.flatten().fieldErrors,
        data: null,
      },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(
      {
        success: true,
        message: "Product created.",
        data: { product },
      },
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Create failed.";
    const status =
      msg.includes("not found") || msg.includes("already exists") || msg.includes("required")
        ? 400
        : 500;
    if (status === 500) console.error("POST /api/products:", err);
    return NextResponse.json({ success: false, message: msg, data: null }, { status });
  }
}
