import { getCurrencyDisplayName, getCurrencySymbol } from "@/lib/currency-config";
import { formatMoney } from "@/lib/money";

type OrderSummaryCardProps = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  currencySymbol?: string;
};

export function OrderSummaryCard({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  currency,
  currencySymbol,
}: OrderSummaryCardProps) {
  const symbol = currencySymbol ?? getCurrencySymbol(currency);
  const formatAmount = (amount: number) =>
    formatMoney(amount, { currencyCode: currency, symbol });

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 lg:sticky lg:top-20">
      <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatAmount(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : formatAmount(shipping)}</span>
        </div>
        {discount > 0 ? (
          <div className="flex items-center justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatAmount(discount)}</span>
          </div>
        ) : null}
        <div className="flex items-center justify-between text-slate-600">
          <span>Tax (GST)</span>
          <span>{formatAmount(tax)}</span>
        </div>
      </div>

      <div className="mt-4 border-t border-neutral-200 pt-3">
        <div className="flex items-center justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatAmount(total)}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Currency: {getCurrencyDisplayName(currency)} ({currency})
        </p>
      </div>
    </section>
  );
}
