"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderPayNowButtonProps = {
  orderId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  keyId: string;
};

async function loadRazorpayScript(): Promise<boolean> {
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

export function OrderPayNowButton({
  orderId,
  amount,
  currency,
  razorpayOrderId,
  keyId,
}: OrderPayNowButtonProps) {
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const openCheckout = async () => {
    if (isPaying) return;
    setErrorMessage(null);
    setIsPaying(true);

    try {
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        setErrorMessage("Unable to load Razorpay checkout.");
        return;
      }

      const RazorpayCtor = (window as {
        Razorpay?: new (options: unknown) => { open: () => void };
      }).Razorpay;
      if (!RazorpayCtor) {
        setErrorMessage("Razorpay SDK is not available.");
        return;
      }

      const rzp = new RazorpayCtor({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "DummyMart",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch(`/api/orders/${orderId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = (await verifyRes.json()) as {
            success?: boolean;
            message?: string;
          };

          if (!verifyRes.ok || !verifyData.success) {
            setErrorMessage(verifyData.message || "Payment verification failed.");
            return;
          }

          router.push(`/orders/${orderId}?paid=1`);
          router.refresh();
        },
        modal: {
          ondismiss: () => {
            setErrorMessage("Payment cancelled.");
          },
        },
      });

      rzp.open();
    } catch {
      setErrorMessage("Network error while opening payment.");
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
      {errorMessage ? <p className="text-sm text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
