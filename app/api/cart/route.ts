import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildCartPayload, getCartForUser } from "@/lib/services/cart";
import { resolveCartCurrencyFromRequest } from "@/lib/services/currency";

/**
 * GET /api/cart — current cart (logged-in only). Does not create a cart.
 * Optional ?currency=USD uses live exchange rate for display (locked at checkout).
 */
export async function GET(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  try {
    const { context } = await resolveCartCurrencyFromRequest(request, user.id);
    const cart = await getCartForUser(user.id);
    return NextResponse.json({
      success: true,
      message: "Cart fetched.",
      data: { cart: buildCartPayload(cart, context) },
    });
  } catch (err) {
    console.error("GET /api/cart:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart.", data: null },
      { status: 500 }
    );
  }
}
