"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  resolvePaymentCancelledError,
  type ClientErrorDisplay,
} from "@/lib/client-api-errors";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { OrderPaymentError } from "./order-payment-error";

type OrderPayNowButtonProps = {
  orderId: string;
  orderNumber?: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  keyId: string;
};

export function OrderPayNowButton({
  orderId,
  orderNumber,
  amount,
  currency,
  razorpayOrderId,
  keyId,
}: OrderPayNowButtonProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [errorDisplay, setErrorDisplay] = useState<ClientErrorDisplay | null>(null);

  const openCheckout = async () => {
    if (isPaying) return;
    setErrorDisplay(null);
    setIsPaying(true);

    try {
      await openRazorpayCheckout({
        keyId,
        amount,
        currency,
        razorpayOrderId,
        orderId,
        orderNumber,
        onSuccess: () => {
          router.push(`/orders/${orderId}?paid=1`);
          router.refresh();
        },
        onError: (error) => setErrorDisplay(error),
        onDismiss: () => setErrorDisplay(resolvePaymentCancelledError(orderId)),
      });
    } catch {
      setErrorDisplay({
        kind: "network",
        message: "Network error while opening payment.",
        links: [
          { label: "View order", href: `/orders/${orderId}` },
          { label: "Contact support", href: "/contact" },
        ],
        orderId,
      });
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void openCheckout()}
        disabled={isPaying}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPaying ? "Opening checkout…" : "Pay now"}
      </button>
      {errorDisplay ? <OrderPaymentError display={errorDisplay} /> : null}
    </div>
  );
}
