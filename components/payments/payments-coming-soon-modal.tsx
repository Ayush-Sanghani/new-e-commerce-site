"use client";

import Link from "next/link";
import { Clock } from "lucide-react";

type PaymentsComingSoonModalProps = {
  open: boolean;
  onClose: () => void;
  orderNumber?: string;
  orderId?: string;
};

export function PaymentsComingSoonModal({
  open,
  onClose,
  orderNumber,
  orderId,
}: PaymentsComingSoonModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Close dialog"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="payments-coming-soon-title"
        className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Clock className="h-6 w-6" aria-hidden />
        </div>
        <h2 id="payments-coming-soon-title" className="mt-4 text-xl font-bold text-slate-900">
          Payments coming soon
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We&apos;re setting up secure online payments. Your order has been saved and checkout will
          be available shortly. Sorry for the inconvenience.
        </p>
        {orderNumber ? (
          <p className="mt-3 rounded-lg bg-neutral-50 px-3 py-2 font-mono text-sm text-slate-700">
            Order #{orderNumber}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-neutral-50"
          >
            Continue shopping
          </button>
          {orderId ? (
            <Link
              href={`/orders/${orderId}`}
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View order
            </Link>
          ) : (
            <Link
              href="/contact"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Contact us
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
