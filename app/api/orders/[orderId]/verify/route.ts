import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { verifyOrderPayment } from "@/lib/services/order";
import { verifyOrderPaymentBodySchema } from "@/lib/validations/order";

/**
 * POST /api/orders/[orderId]/verify
 * Verifies Razorpay callback values and marks order/payment as paid.
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body.", data: null },
      { status: 400 }
    );
  }

  const parsed = verifyOrderPaymentBodySchema.safeParse(body);
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
    const result = await verifyOrderPayment({
      userId: user.id,
      orderId,
      razorpayOrderId: parsed.data.razorpay_order_id,
      razorpayPaymentId: parsed.data.razorpay_payment_id,
      razorpaySignature: parsed.data.razorpay_signature,
    });

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
          message: "Payment verification failed.",
          data: { code: result.error },
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified. Order marked as paid.",
      data: result.data,
    });
  } catch (err) {
    console.error("POST /api/orders/[orderId]/verify:", err);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment.", data: null },
      { status: 500 }
    );
  }
}
