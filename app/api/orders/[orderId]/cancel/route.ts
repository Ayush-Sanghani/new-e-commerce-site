import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { cancelPendingOrder } from "@/lib/services/order";

/**
 * POST /api/orders/[orderId]/cancel — cancel a pending_payment order so checkout can start again.
 */
export async function POST(
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
    const result = await cancelPendingOrder(user.id, orderId);

    if (!result.ok) {
      if (result.error === "order_not_found") {
        return NextResponse.json(
          { success: false, message: "Order not found.", data: { code: result.error } },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Only pending orders can be cancelled.",
          data: { code: result.error },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Order cancelled. You can checkout again.",
      data: result.data,
    });
  } catch (err) {
    console.error("POST /api/orders/[orderId]/cancel:", err);
    return NextResponse.json(
      { success: false, message: "Failed to cancel order.", data: null },
      { status: 500 }
    );
  }
}
