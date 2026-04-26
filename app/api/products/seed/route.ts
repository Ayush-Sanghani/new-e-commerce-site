import { NextResponse } from "next/server";
import { seedProductsFromDummyJson } from "@/lib/services/product-seed";

/**
 * POST /api/products/seed
 * Fetches products from https://dummyjson.com/products and upserts them
 * into the database with Category, Brand, Tag, ProductImage, and Review relations.
 *
 * In production, protect this route (e.g. admin-only or secret header).
 */
export async function POST() {
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
