import Link from "next/link";
import { Card } from "@/components/home/ui/card";
import type { CartSummary } from "./types";

type CartSummaryCardProps = {
  summary: CartSummary;
  disabledCheckout?: boolean;
  onCheckout?: () => void;
  checkoutLabel?: string;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

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
          <span>{formatMoney(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>{summary.shipping === 0 ? "Free" : formatMoney(summary.shipping)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Discount</span>
          <span>-{formatMoney(summary.discount)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax</span>
          <span>{formatMoney(summary.tax)}</span>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatMoney(summary.total)}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={disabledCheckout}
        onClick={onCheckout}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {checkoutLabel}
      </button>

      <Link
        href="/shop"
        className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
      >
        Continue Shopping
      </Link>

      <p className="text-xs text-slate-500">Final payable amount may update at checkout.</p>
    </Card>
  );
}
