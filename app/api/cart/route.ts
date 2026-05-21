import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { buildCartPayload, getCartForUser } from "@/lib/services/cart";

/**
 * GET /api/cart — current cart (logged-in only). Does not create a cart.
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
    const cart = await getCartForUser(user.id);
    return NextResponse.json({
      success: true,
      message: "Cart fetched.",
      data: { cart: buildCartPayload(cart) },
    });
  } catch (err) {
    console.error("GET /api/cart:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch cart.", data: null },
      { status: 500 }
    );
  }
}
