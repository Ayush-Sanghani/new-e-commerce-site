import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { seedProductsFromDummyJson } from "@/lib/services/product-seed";

/**
 * POST /api/products/seed — admin only.
 * Fetches products from DummyJSON and upserts catalog data.
 * Do not run on production after prices are stored as INR (overwrites with USD-scale values).
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error, data: null },
      { status: auth.status }
    );
  }

  try {
    const result = await seedProductsFromDummyJson();

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        data: {
          created: result.created,
          updated: result.updated,
          errors: result.errors,
        },
      },
      { status: result.success ? 200 : 207 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Seed failed.";
    return NextResponse.json(
      { success: false, message, data: null },
      { status: 500 }
    );
  }
}
