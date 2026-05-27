"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast-provider";

type OrderCancelButtonProps = {
  orderId: string;
  /** Called after a successful cancel (before navigation when redirectTo is set). */
  onSuccess?: () => void;
  /** Where to go after cancel. Default `/orders`. Pass `null` to stay on the current page. */
  redirectTo?: string | null;
  className?: string;
  label?: string;
};

export function OrderCancelButton({
  orderId,
  onSuccess,
  redirectTo = "/orders",
  className,
  label = "Cancel order",
}: OrderCancelButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isCancelling, setIsCancelling] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cancelOrder = async () => {
    if (isCancelling) return;
    if (
      !window.confirm(
        "Cancel this order? You can checkout again from your cart."
      )
    ) {
      return;
    }

    setErrorMessage(null);
    setIsCancelling(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
      };

      if (res.status === 401) {
        setErrorMessage(data.message || "Sign in to cancel this order.");
        router.push("/login");
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to cancel order.");
        return;
      }

      showToast(data.message || "Order cancelled. You can checkout again.");
      onSuccess?.();

      const destination = redirectTo === undefined ? "/orders" : redirectTo;
      if (destination) {
        router.push(destination);
      }
      router.refresh();
    } catch {
      setErrorMessage("Network error while cancelling order.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className={className ?? "space-y-2"}>
      <button
        type="button"
        onClick={() => void cancelOrder()}
        disabled={isCancelling}
        className="inline-flex w-full items-center justify-center rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isCancelling ? "Cancelling…" : label}
      </button>
      {errorMessage ? (
        <p className="text-sm text-red-600">
          {errorMessage}
          {errorMessage.toLowerCase().includes("sign in") ? (
            <>
              {" "}
              <Link href="/login" className="font-medium underline">
                Log in
              </Link>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
