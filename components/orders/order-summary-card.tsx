import { formatInr } from "@/lib/pricing";

type OrderSummaryCardProps = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
};

export function OrderSummaryCard({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  currency,
}: OrderSummaryCardProps) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatInr(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatInr(shipping)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatInr(discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax (GST)</span>
          <span>{formatInr(tax)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatInr(total)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Currency: Indian Rupee ({currency})</p>
      </div>
    </section>
  );
}
