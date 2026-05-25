import Link from "next/link";
import { formatInr } from "@/lib/pricing";

type PaymentSuccessBannerProps = {
  orderNumber: string;
  total: number;
};

export function PaymentSuccessBanner({ orderNumber, total }: PaymentSuccessBannerProps) {
  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-900">
      <p className="font-semibold">Payment successful</p>
      <p className="mt-1">
        Order <span className="font-medium">{orderNumber}</span> is confirmed. Total paid:{" "}
        <span className="font-medium">{formatInr(total)}</span>.
      </p>
      <Link
        href="/orders"
        className="mt-3 inline-flex text-sm font-medium text-emerald-800 underline hover:text-emerald-950"
      >
        View all orders
      </Link>
    </section>
  );
}
