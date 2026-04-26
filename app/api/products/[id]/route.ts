import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, updateProduct } from "@/lib/services/product-mutations";
import { getProductById } from "@/lib/services/product-queries";
import { updateProductBodySchema } from "@/lib/validations/product-mutation";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/products/:id
 * Full product with category, brand, images, tags, reviews.
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { success: false, message: "Product id is required.", data: null },
      { status: 400 }
    );
  }

  try {
    const product = await getProductById(id.trim());
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found.", data: null },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Product fetched.",
      data: { product },
    });
  } catch (err) {
    console.error("GET /api/products/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch product.", data: null },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/products/:id — update product (admin only).
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error, data: null },
      { status: auth.status }
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { success: false, message: "Product id is required.", data: null },
      { status: 400 }
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

  const parsed = updateProductBodySchema.safeParse(body);
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
    const product = await updateProduct(id.trim(), parsed.data);
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found.", data: null },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Product updated.",
      data: { product },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    const status =
      msg.includes("not found") || msg.includes("already exists") || msg.includes("required")
        ? 400
        : 500;
    if (status === 500) console.error("PATCH /api/products/[id]:", err);
    return NextResponse.json({ success: false, message: msg, data: null }, { status });
  }
}

/**
 * DELETE /api/products/:id — delete product (admin only). Cascades images, tags, reviews.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  const auth = await requireAdmin(request);
  if ("error" in auth) {
    return NextResponse.json(
      { success: false, message: auth.error, data: null },
      { status: auth.status }
    );
  }

  const { id } = await context.params;
  if (!id?.trim()) {
    return NextResponse.json(
      { success: false, message: "Product id is required.", data: null },
      { status: 400 }
    );
  }

  try {
    const deleted = await deleteProduct(id.trim());
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Product not found.", data: null },
        { status: 404 }
      );
    }
    return NextResponse.json({
      success: true,
      message: "Product deleted.",
      data: null,
    });
  } catch (err) {
    console.error("DELETE /api/products/[id]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to delete product.", data: null },
      { status: 500 }
    );
  }
}
