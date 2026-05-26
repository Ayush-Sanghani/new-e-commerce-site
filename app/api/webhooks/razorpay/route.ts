import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { processRazorpayWebhook } from "@/lib/services/order";

function verifyWebhookSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected);
  const receivedBuf = Buffer.from(signature);
  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}

export async function POST(request: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("Missing RAZORPAY_WEBHOOK_SECRET");
    return NextResponse.json(
      { success: false, message: "Webhook secret is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) {
    return NextResponse.json(
      { success: false, message: "Missing webhook signature." },
      { status: 400 }
    );
  }

  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ success: false, message: "Invalid signature." }, { status: 400 });
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, message: "Invalid webhook body." }, { status: 400 });
  }

  const eventObj = parsed as {
    event?: string;
    payload?: {
      payment?: {
        entity?: {
          id?: string;
          order_id?: string;
          amount?: number;
          status?: string;
          captured?: boolean | number;
        };
      };
    };
  };

  const event = eventObj.event ?? "";
  const payment = eventObj.payload?.payment?.entity;

  if (!event || !payment?.id || !payment.order_id || typeof payment.amount !== "number") {
    return NextResponse.json({ success: false, message: "Invalid webhook payload." }, { status: 400 });
  }

  try {
    const result = await processRazorpayWebhook(event, {
      id: payment.id,
      order_id: payment.order_id,
      amount: payment.amount,
      status: payment.status,
      captured: payment.captured,
    });

    if (!result.ok) {
      if (result.error === "insufficient_stock_at_capture") {
        return NextResponse.json(
          {
            success: false,
            message: "Payment captured but stock insufficient to fulfill order.",
            data: { code: result.error },
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Webhook payment mismatch.", data: { code: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Webhook processed.", data: result });
  } catch (err) {
    console.error("POST /api/webhooks/razorpay:", err);
    return NextResponse.json(
      { success: false, message: "Failed to process webhook." },
      { status: 500 }
    );
  }
}
