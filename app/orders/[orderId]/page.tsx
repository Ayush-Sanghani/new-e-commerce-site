import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  User,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { OrderCancelButton } from "@/components/orders/order-cancel-button";
import { OrderPayNowButton } from "@/components/orders/order-pay-now-button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { PaymentSuccessBanner } from "@/components/orders/payment-success-banner";
import { PaymentsComingSoonNotice } from "@/components/payments/payments-coming-soon-notice";
import { getSessionUserFromCookies } from "@/lib/auth";
import { getCurrencySymbol } from "@/lib/currency-config";
import { formatMoney } from "@/lib/money";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { getOrderForUser } from "@/lib/services/order";
import type { OrderStatus } from "@prisma/client";

const TIMELINE_STEPS = [
  { key: "placed",   label: "Order Placed" },
  { key: "payment",  label: "Payment" },
  { key: "confirmed",label: "Confirmed" },
  { key: "shipped",  label: "Shipped" },
  { key: "delivered",label: "Delivered" },
] as const;

function resolveTimelineStep(status: OrderStatus): number {
  switch (status) {
    case "pending_payment": return 1;
    case "paid":            return 4;
    case "refunded":        return 2;
    case "cancelled":       return 0;
    default:                return 0;
  }
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddressField(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type OrderDetailPageProps = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function OrderDetailPage({ params, searchParams }: OrderDetailPageProps) {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");

  const { orderId } = await params;
  const { paid } = await searchParams;
  const order = await getOrderForUser(user.id, orderId);

  if (!order) {
    notFound();
  }

  const showPaidBanner = paid === "1" && order.status === "paid";
  const showAwaitingPayment = order.status === "pending_payment";
  const paymentsEnabled = isPaymentsEnabled();
  const address = order.shippingAddress;
  const currencySymbol = getCurrencySymbol(order.currency);
  const formatOrderMoney = (amount: number) =>
    formatMoney(amount, { currencyCode: order.currency, symbol: currencySymbol });

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-slate-500">
            <Link href="/home" className="hover:text-slate-800">
              Home
            </Link>{" "}
            /{" "}
            <Link href="/orders" className="hover:text-slate-800">
              Orders
            </Link>{" "}
            / <span className="text-slate-700">{order.orderNumber}</span>
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Order Details
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-3">
                <span className="inline-block rounded-md bg-neutral-100 px-2.5 py-1 font-mono text-sm font-semibold text-slate-700">
                  #{order.orderNumber}
                </span>
                <p className="text-sm text-slate-500">Placed {formatOrderDate(order.createdAt)}</p>
              </div>
            </div>
            <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          </div>
        </section>

        {showAwaitingPayment ? (
          <section className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold">Awaiting payment</p>
              <p className="mt-1 text-amber-800">
                {order.paymentStatus === "failed"
                  ? "Your last payment attempt did not go through. You can try again below."
                  : "Complete payment to confirm this order."}
              </p>
            </div>
          </section>
        ) : null}

        {showPaidBanner ? (
          <PaymentSuccessBanner
            orderNumber={order.orderNumber}
            total={order.total}
            currency={order.currency}
          />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Items</h2>
              <ul className="mt-4 divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:h-28 sm:w-28">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">SKU: {item.sku}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatOrderMoney(item.displayUnitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatOrderMoney(item.displayLineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {address ? (
              <>
                <div className="border-t border-neutral-200" />
                <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
                  <address className="mt-4 space-y-2.5 text-sm not-italic text-slate-600">
                    {formatAddressField(address.name) ? (
                      <p className="flex items-start gap-2.5 font-semibold text-slate-900">
                        <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        {formatAddressField(address.name)}
                      </p>
                    ) : null}
                    {formatAddressField(address.phone) ? (
                      <p className="flex items-start gap-2.5">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        {formatAddressField(address.phone)}
                      </p>
                    ) : null}
                    {(formatAddressField(address.addressLine1) ||
                      formatAddressField(address.addressLine2) ||
                      formatAddressField(address.city)) ? (
                      <div className="flex items-start gap-2.5">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="space-y-0.5">
                          {formatAddressField(address.addressLine1) ? (
                            <p>{formatAddressField(address.addressLine1)}</p>
                          ) : null}
                          {formatAddressField(address.addressLine2) ? (
                            <p>{formatAddressField(address.addressLine2)}</p>
                          ) : null}
                          {[formatAddressField(address.city), formatAddressField(address.state)]
                            .filter(Boolean)
                            .join(", ") ? (
                            <p>
                              {[formatAddressField(address.city), formatAddressField(address.state)]
                                .filter(Boolean)
                                .join(", ")}
                              {formatAddressField(address.postalCode)
                                ? ` – ${formatAddressField(address.postalCode)}`
                                : ""}
                            </p>
                          ) : null}
                          {formatAddressField(address.country) ? (
                            <p className="font-medium text-slate-700">{formatAddressField(address.country)}</p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </address>
                </section>
              </>
            ) : null}
          </div>

          <div className="space-y-4">
            <OrderSummaryCard
              subtotal={order.subtotal}
              tax={order.tax}
              shipping={order.shipping}
              discount={order.discount}
              total={order.total}
              currency={order.currency}
              currencySymbol={currencySymbol}
            />

            {order.paymentStatus ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
                <h2 className="font-semibold text-slate-900">Payment</h2>
                <div className="mt-2">
                  {order.paymentStatus === "pending" || order.paymentStatus === "failed" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                      <Clock className="h-3 w-3" />
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace("_", " ")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      <CheckCircle2 className="h-3 w-3" />
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1).replace("_", " ")}
                    </span>
                  )}
                </div>
              </section>
            ) : null}

            {showAwaitingPayment ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900">Complete payment</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Total due: {formatOrderMoney(order.total)}
                </p>
                <div className="mt-4 space-y-2">
                  {!paymentsEnabled ? (
                    <PaymentsComingSoonNotice />
                  ) : order.checkout ? (
                    <OrderPayNowButton
                      orderId={order.id}
                      orderNumber={order.orderNumber}
                      amount={order.checkout.amount}
                      currency={order.checkout.currency}
                      razorpayOrderId={order.checkout.razorpayOrderId}
                      keyId={order.checkout.keyId}
                    />
                  ) : (
                    <PaymentsComingSoonNotice />
                  )}
                  <OrderCancelButton orderId={order.id} />
                </div>
              </section>
            ) : null}
          </div>
        </section>

        {order.status !== "cancelled" ? (
          <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
            <h2 className="mb-6 text-base font-bold text-slate-900">Order Timeline</h2>
            <div className="relative flex items-start justify-between">
              {/* connector line */}
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-neutral-200" aria-hidden />
              <div
                className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-500"
                style={{ width: `${(resolveTimelineStep(order.status) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                aria-hidden
              />

              {TIMELINE_STEPS.map((step, idx) => {
                const activeStep = resolveTimelineStep(order.status);
                const isDone = idx < activeStep;
                const isCurrent = idx === activeStep;
                return (
                  <div key={step.key} className="relative z-10 flex flex-1 flex-col items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone
                          ? "border-blue-500 bg-blue-500 text-white"
                          : isCurrent
                          ? "border-blue-500 bg-white text-blue-600"
                          : "border-neutral-300 bg-white text-neutral-400"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : isCurrent ? (
                        <Circle className="h-3 w-3 fill-blue-500" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </span>
                    <span
                      className={`text-center text-xs font-medium leading-tight ${
                        isDone || isCurrent ? "text-slate-800" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center text-sm text-red-600 sm:p-6">
            This order was cancelled.
          </section>
        )}
      </main>
    </div>
  );
}
