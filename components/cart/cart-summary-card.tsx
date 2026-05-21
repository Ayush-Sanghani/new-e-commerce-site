import Link from "next/link";
import { Card } from "@/components/home/ui/card";
import { formatInr } from "@/lib/pricing";
import type { CartSummary } from "./types";

type CartSummaryCardProps = {
  summary: CartSummary;
  disabledCheckout?: boolean;
  onCheckout?: () => void;
  checkoutLabel?: string;
};

export function CartSummaryCard({
  summary,
  disabledCheckout,
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
}: CartSummaryCardProps) {
  return (
    <Card as="section" className="space-y-4 p-5 sm:p-6 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatInr(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>{summary.shipping === 0 ? "Free" : formatInr(summary.shipping)}</span>
        </div>
        {summary.discount > 0 ? (
          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatInr(summary.discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax (GST)</span>
          <span>{formatInr(summary.tax)}</span>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatInr(summary.total)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Payable at checkout · {summary.currency}</p>
      </div>

      <button
        type="button"
        disabled={disabledCheckout}
        onClick={onCheckout}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {checkoutLabel}
      </button>

      <p className="text-xs leading-5 text-slate-500">
        By proceeding to checkout, you agree to our{" "}
        <Link href="/terms-and-conditions" className="font-medium text-slate-700 hover:text-slate-900">
          Terms &amp; Conditions
        </Link>
        ,{" "}
        <Link href="/privacy-policy" className="font-medium text-slate-700 hover:text-slate-900">
          Privacy Policy
        </Link>
        , and{" "}
        <Link href="/return-refund-policy" className="font-medium text-slate-700 hover:text-slate-900">
          Return &amp; Refund Policy
        </Link>
        .
      </p>

      <Link
        href="/shop"
        className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
      >
        Continue Shopping
      </Link>
    </Card>
  );
}
