import {
  resolvePaymentVerifyError,
  resolveRazorpayLoadError,
  type ApiJsonBody,
  type ClientErrorDisplay,
} from "@/lib/client-api-errors";

export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if ((window as { Razorpay?: unknown }).Razorpay) return true;

  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type VerifyPaymentClientResult =
  | { ok: true }
  | { ok: false; error: ClientErrorDisplay };

export async function verifyOrderPaymentClient(
  orderId: string,
  response: RazorpayPaymentResponse,
  orderNumber?: string
): Promise<VerifyPaymentClientResult> {
  try {
    const verifyRes = await fetch(`/api/orders/${orderId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    });

    const verifyData = (await verifyRes.json()) as ApiJsonBody;

    if (!verifyRes.ok || !verifyData.success) {
      return {
        ok: false,
        error: resolvePaymentVerifyError(verifyRes.status, verifyData, orderId, orderNumber),
      };
    }

    return { ok: true };
  } catch {
    return {
      ok: false,
      error: {
        kind: "network",
        message: "Network error while confirming payment.",
        links: [
          { label: "View order", href: `/orders/${orderId}` },
          { label: "Contact support", href: "/contact" },
        ],
        orderId,
      },
    };
  }
}

export async function openRazorpayCheckout(options: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderId: string;
  orderNumber?: string;
  onSuccess: () => void;
  onError: (error: ClientErrorDisplay) => void;
  onDismiss?: () => void;
}): Promise<void> {
  const sdkReady = await loadRazorpayScript();
  if (!sdkReady) {
    options.onError(resolveRazorpayLoadError());
    return;
  }

  const RazorpayCtor = (window as {
    Razorpay?: new (opts: unknown) => { open: () => void };
  }).Razorpay;
  if (!RazorpayCtor) {
    options.onError({
      kind: "razorpay_load_failed",
      message: "Payment window is not available in this browser.",
      links: [{ label: "Contact support", href: "/contact" }],
    });
    return;
  }

  const rzp = new RazorpayCtor({
    key: options.keyId,
    amount: options.amount,
    currency: options.currency,
    order_id: options.razorpayOrderId,
    name: "VrajPharma",
    handler: async (response: RazorpayPaymentResponse) => {
      const result = await verifyOrderPaymentClient(
        options.orderId,
        response,
        options.orderNumber
      );
      if (!result.ok) {
        options.onError(result.error);
        return;
      }
      options.onSuccess();
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.();
      },
    },
  });

  rzp.open();
}
