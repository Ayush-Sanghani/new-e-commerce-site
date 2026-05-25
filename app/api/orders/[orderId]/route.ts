import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getOrderForUser } from "@/lib/services/order";

/**
 * GET /api/orders/[orderId] — full order for the current user.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> }
) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  const { orderId } = await context.params;
  if (!orderId) {
    return NextResponse.json(
      { success: false, message: "Invalid order id.", data: null },
      { status: 400 }
    );
  }

  try {
    const order = await getOrderForUser(user.id, orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found.", data: null },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order fetched.",
      data: { order },
    });
  } catch (err) {
    console.error("GET /api/orders/[orderId]:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch order.", data: null },
      { status: 500 }
    );
  }
}
