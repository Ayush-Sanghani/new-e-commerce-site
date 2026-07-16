import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getCurrencyCookieFromRequest } from "@/lib/currency-cookie";
import { createOrderFromCart, listOrdersForUser } from "@/lib/services/order";
import { prisma } from "@/lib/db";
import { resolveDisplayCurrency } from "@/lib/services/currency";
import { createOrderBodySchema } from "@/lib/validations/order";

/**
 * GET /api/orders — list current user's orders (newest first).
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
    const orders = await listOrdersForUser(user.id);
    return NextResponse.json({
      success: true,
      message: "Orders fetched.",
      data: { orders },
    });
  } catch (err) {
    console.error("GET /api/orders:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch orders.", data: null },
      { status: 500 }
    );
  }
}

/**
 * POST /api/orders — create order from cart + Razorpay order (Option A: DB first, then gateway).
 * Auth: logged-in only.
 */
export async function POST(request: NextRequest) {
  const user = await getSessionUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Sign in required.", data: null },
      { status: 401 }
    );
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = createOrderBodySchema.safeParse(body);
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

  const { shippingAddress, billingAddress, currency: bodyCurrency } = parsed.data;

  try {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { preferredCurrency: true, country: true },
    });
    const resolved = await resolveDisplayCurrency({
      queryCurrency: bodyCurrency,
      cookieCurrency: getCurrencyCookieFromRequest(request),
      preferredCurrency: profile?.preferredCurrency,
      country: profile?.country,
      acceptLanguage: request.headers.get("accept-language"),
    });

    const result = await createOrderFromCart({
      userId: user.id,
      currencyCode: bodyCurrency ?? resolved.code,
      shippingAddress: shippingAddress as Prisma.InputJsonValue | undefined,
      billingAddress: billingAddress as Prisma.InputJsonValue | undefined,
    });

    if (!result.ok) {
      if (result.error === "cart_not_found" || result.error === "empty_cart") {
        return NextResponse.json(
          {
            success: false,
            message:
              result.error === "empty_cart"
                ? "Cart is empty. Add items before checkout."
                : "Cart not found.",
            data: { code: result.error },
          },
          { status: 400 }
        );
      }

      if (result.error === "currency_unavailable") {
        return NextResponse.json(
          {
            success: false,
            message: "Selected currency is not available. Try INR or refresh rates.",
            data: { code: result.error },
          },
          { status: 400 }
        );
      }

      if (result.error === "currency_not_supported_for_payment") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Selected currency cannot be charged via Razorpay yet. Switch to INR or another supported currency.",
            data: { code: result.error },
          },
          { status: 400 }
        );
      }

      if (result.error === "insufficient_stock") {
        return NextResponse.json(
          {
            success: false,
            message: "Not enough stock for one or more items.",
            data: {
              code: result.error,
              productId: result.productId,
              max: result.max,
            },
          },
          { status: 400 }
        );
      }

      if (result.error === "minimum_quantity") {
        return NextResponse.json(
          {
            success: false,
            message: "Quantity is below the minimum for one or more items.",
            data: {
              code: result.error,
              productId: result.productId,
              min: result.min,
            },
          },
          { status: 400 }
        );
      }

      if (result.error === "razorpay_failed") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Order was saved but payment setup failed. Try again or contact support with your order number.",
            data: {
              code: result.error,
              orderId: result.orderId,
              orderNumber: result.orderNumber,
              detail: result.message,
            },
          },
          { status: 502 }
        );
      }

      if (result.error === "pending_order_exists") {
        return NextResponse.json(
          {
            success: false,
            message:
              "You already have a pending order. Complete payment or cancel it before starting a new checkout.",
            data: {
              code: result.error,
              orderId: result.orderId,
              orderNumber: result.orderNumber,
              currency: result.currency,
              razorpayOrderId: result.razorpayOrderId,
              amount: result.amount,
              keyId: result.keyId,
            },
          },
          { status: 409 }
        );
      }

      return NextResponse.json({ success: false, message: "Unknown error.", data: null }, { status: 500 });
    }

    return NextResponse.json(
      {
        success: true,
        message: result.data.paymentsEnabled
          ? "Order created. Complete payment."
          : "Order created. Online payment is coming soon.",
        data: result.data,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/orders:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create order.", data: null },
      { status: 500 }
    );
  }
}
