import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OrderCancelButton } from "@/components/orders/order-cancel-button";
import { OrderPayNowButton } from "@/components/orders/order-pay-now-button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { OrderSummaryCard } from "@/components/orders/order-summary-card";
import { PaymentSuccessBanner } from "@/components/orders/payment-success-banner";
import { verifyToken } from "@/lib/jwt";
import { formatInr } from "@/lib/pricing";
import { getOrderForUser } from "@/lib/services/order";

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
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) redirect("/login");

  let userId: string;
  try {
    const payload = await verifyToken(token);
    userId = payload.sub;
  } catch {
    redirect("/login");
  }

  const { orderId } = await params;
  const { paid } = await searchParams;
  const order = await getOrderForUser(userId, orderId);

  if (!order) {
    notFound();
  }

  const showPaidBanner = paid === "1" && order.status === "paid";
  const showAwaitingPayment = order.status === "pending_payment";
  const address = order.shippingAddress;

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
                {order.orderNumber}
              </h1>
              <p className="mt-1 text-sm text-slate-500">Placed {formatOrderDate(order.createdAt)}</p>
            </div>
            <OrderStatusBadge status={order.status} paymentStatus={order.paymentStatus} />
          </div>
        </section>

        {showAwaitingPayment ? (
          <section className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
            <p className="font-semibold">Awaiting payment</p>
            <p className="mt-1 text-amber-800">
              {order.paymentStatus === "failed"
                ? "Your last payment attempt did not go through. You can try again below."
                : "Complete payment to confirm this order."}
            </p>
          </section>
        ) : null}

        {showPaidBanner ? (
          <PaymentSuccessBanner orderNumber={order.orderNumber} total={order.total} />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-4">
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="text-lg font-bold text-slate-900">Items</h2>
              <ul className="mt-4 divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
                      {item.thumbnail ? (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{item.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">SKU: {item.sku}</p>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatInr(item.unitPrice)} × {item.quantity}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-slate-900">
                      {formatInr(item.lineTotal)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            {address ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">Shipping address</h2>
                <address className="mt-3 space-y-1 text-sm not-italic text-slate-600">
                  {formatAddressField(address.name) ? (
                    <p className="font-medium text-slate-900">{formatAddressField(address.name)}</p>
                  ) : null}
                  {formatAddressField(address.phone) ? <p>{formatAddressField(address.phone)}</p> : null}
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
                        ? ` ${formatAddressField(address.postalCode)}`
                        : ""}
                    </p>
                  ) : null}
                  {formatAddressField(address.country) ? (
                    <p>{formatAddressField(address.country)}</p>
                  ) : null}
                </address>
              </section>
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
            />

            {order.paymentStatus ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5 text-sm">
                <h2 className="font-semibold text-slate-900">Payment</h2>
                <p className="mt-2 capitalize text-slate-600">{order.paymentStatus.replace("_", " ")}</p>
              </section>
            ) : null}

            {showAwaitingPayment ? (
              <section className="rounded-2xl border border-neutral-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900">Complete payment</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Total due: {formatInr(order.total)}
                </p>
                <div className="mt-4 space-y-2">
                  {order.checkout ? (
                    <OrderPayNowButton
                      orderId={order.id}
                      amount={order.checkout.amount}
                      currency={order.checkout.currency}
                      razorpayOrderId={order.checkout.razorpayOrderId}
                      keyId={order.checkout.keyId}
                    />
                  ) : null}
                  <OrderCancelButton orderId={order.id} />
                </div>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
