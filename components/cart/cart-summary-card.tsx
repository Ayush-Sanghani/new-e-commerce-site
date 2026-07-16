"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, Truck, RotateCcw, Tag } from "lucide-react";
import { Card } from "@/components/home/ui/card";
import { formatMoney } from "@/lib/money";
import type { CartSummary } from "./types";

type CartSummaryCardProps = {
  summary: CartSummary;
  disclaimer?: string;
  rateStale?: boolean;
  disabledCheckout?: boolean;
  onCheckout?: () => void;
  checkoutLabel?: string;
};

const TRUST_BADGES = [
  { icon: Lock, label: "Secure Checkout" },
  { icon: Truck, label: "Free Shipping" },
  { icon: RotateCcw, label: "Easy Returns" },
];

export function CartSummaryCard({
  summary,
  disclaimer,
  rateStale,
  disabledCheckout,
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
}: CartSummaryCardProps) {
  const formatAmount = (amount: number) =>
    formatMoney(amount, {
      currencyCode: summary.currency,
      symbol: summary.symbol,
    });

  return (
    <Card as="section" className="space-y-4 p-5 sm:p-6 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatAmount(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>{summary.shipping === 0 ? "Free" : formatAmount(summary.shipping)}</span>
        </div>
        {summary.discount > 0 ? (
          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatAmount(summary.discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax (GST)</span>
          <span>{formatAmount(summary.tax)}</span>
        </div>
      </div>

      <div className="border-t border-neutral-200 pt-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatAmount(summary.total)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Payable at checkout · {summary.currency}</p>
        {disclaimer ? (
          <p className={`mt-2 text-xs leading-5 ${rateStale ? "text-amber-700" : "text-slate-500"}`}>
            {disclaimer}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        disabled={disabledCheckout}
        onClick={onCheckout}
        className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
      >
        {checkoutLabel}
      </button>

      {/* Trust badges */}
      <div className="flex flex-col gap-2 rounded-xl bg-neutral-50 p-3">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            {label}
          </div>
        ))}
      </div>

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
