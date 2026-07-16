import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { enforceApiRateLimit } from "@/lib/rate-limit";
import {
  addItemToCart,
  buildCartPayload,
  removeCartItemFromCart,
  updateCartItemQuantity,
} from "@/lib/services/cart";
import { resolveCartCurrencyFromRequest } from "@/lib/services/currency";
import { addCartItemBodySchema } from "@/lib/validations/cart";

type CartMutationFailure =
  | Extract<Awaited<ReturnType<typeof addItemToCart>>, { ok: false }>
  | Extract<Awaited<ReturnType<typeof updateCartItemQuantity>>, { ok: false }>
  | Extract<Awaited<ReturnType<typeof removeCartItemFromCart>>, { ok: false }>;

function cartMutationErrorResponse(
  result: CartMutationFailure,
  productId: string
): NextResponse {
  if (result.error === "product_not_found") {
    return NextResponse.json(
      { success: false, message: "Product not found.", data: null },
      { status: 404 }
    );
  }

  if (result.error === "cart_not_found") {
    return NextResponse.json(
      { success: false, message: "Cart not found.", data: null },
      { status: 404 }
    );
  }

  if (result.error === "item_not_in_cart") {
    return NextResponse.json(
      { success: false, message: "Item not in cart.", data: null },
      { status: 404 }
    );
  }

  if (result.error === "not_available") {
    return NextResponse.json(
      {
        success: false,
        message: `${result.reason}. This product cannot be added to cart.`,
        data: {
          code: "not_available",
          productId,
          reason: result.reason,
        },
      },
      { status: 400 }
    );
  }

  if (result.error === "insufficient_stock") {
    return NextResponse.json(
      {
        success: false,
        message: `Not enough stock. Maximum available: ${result.max}.`,
        data: {
          code: "insufficient_stock",
          productId,
          maxStock: result.max,
        },
      },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      message: `Minimum order quantity is ${result.min}.`,
      data: {
        code: "minimum_quantity",
        productId,
        minimumOrderQuantity: result.min,
      },
    },
    { status: 400 }
  );
}

/**
 * PATCH /api/cart/items — set quantity for one line (logged-in only). Body same shape as POST.
 */
export async function PATCH(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  const limited = await enforceApiRateLimit(request, "cart-mutation");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body.", data: null },
      { status: 400 }
    );
  }

  const parsed = addCartItemBodySchema.safeParse(body);
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

  const { productId, quantity } = parsed.data;

  try {
    const { context } = await resolveCartCurrencyFromRequest(request, user.id);
    const result = await updateCartItemQuantity(user.id, productId.trim(), quantity);
    if (!result.ok) {
      return cartMutationErrorResponse(result, productId);
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated.",
      data: { cart: buildCartPayload(result.cart, context) },
    });
  } catch (err) {
    console.error("PATCH /api/cart/items:", err);
    return NextResponse.json(
      { success: false, message: "Failed to update cart item.", data: null },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items?productId=... — remove one line (logged-in only).
 */
export async function DELETE(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  const limited = await enforceApiRateLimit(request, "cart-mutation");
  if (limited) return limited;

  const productId = request.nextUrl.searchParams.get("productId")?.trim();
  if (!productId) {
    return NextResponse.json(
      { success: false, message: "Query parameter productId is required.", data: null },
      { status: 400 }
    );
  }

  try {
    const { context } = await resolveCartCurrencyFromRequest(request, user.id);
    const result = await removeCartItemFromCart(user.id, productId);
    if (!result.ok) {
      return cartMutationErrorResponse(result, productId);
    }

    return NextResponse.json({
      success: true,
      message: "Item removed from cart.",
      data: { cart: buildCartPayload(result.cart, context) },
    });
  } catch (err) {
    console.error("DELETE /api/cart/items:", err);
    return NextResponse.json(
      { success: false, message: "Failed to remove item.", data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart/items — add line (logged-in only). Creates cart on first add.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  const limited = await enforceApiRateLimit(request, "cart-mutation");
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body.", data: null },
      { status: 400 }
    );
  }

  const parsed = addCartItemBodySchema.safeParse(body);
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

  const { productId, quantity } = parsed.data;

  try {
    const { context } = await resolveCartCurrencyFromRequest(request, user.id);
    const result = await addItemToCart(user.id, productId.trim(), quantity);
    if (!result.ok) {
      return cartMutationErrorResponse(result, productId);
    }

    return NextResponse.json({
      success: true,
      message: "Item added to cart.",
      data: { cart: buildCartPayload(result.cart, context) },
    });
  } catch (err) {
    console.error("POST /api/cart/items:", err);
    return NextResponse.json(
      { success: false, message: "Failed to add item to cart.", data: null },
      { status: 500 }
    );
  }
}
