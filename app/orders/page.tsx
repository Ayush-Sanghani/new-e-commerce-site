import Link from "next/link";
import { redirect } from "next/navigation";
import { ShoppingBag, ArrowRight, CreditCard } from "lucide-react";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { getSessionUserFromCookies } from "@/lib/auth";
import { formatInr } from "@/lib/pricing";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { listOrdersForUser } from "@/lib/services/order";

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function OrdersPage() {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");

  const orders = await listOrdersForUser(user.id);
  const paymentsEnabled = isPaymentsEnabled();

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
          <p className="text-sm text-slate-500">
            <Link href="/home" className="hover:text-slate-800">
              Home
            </Link>{" "}
            / <span className="text-slate-700">Orders</span>
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-2 text-sm text-slate-500">View your order history and order details.</p>
        </section>

        {orders.length === 0 ? (
          <section className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-neutral-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">You have not placed any orders yet.</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </section>
        ) : (
          <section className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm transition hover:border-neutral-300 hover:shadow-md sm:p-5"
              >
                <div className="flex gap-4">
                  {/* Thumbnail placeholder */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-100 text-neutral-400">
                    <ShoppingBag className="h-6 w-6" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
                      {/* Left: ID, date, status */}
                      <div className="min-w-0 space-y-1.5">
                        <span className="inline-block max-w-[180px] truncate rounded-md bg-neutral-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700 sm:max-w-[240px]">
                          #{order.orderNumber}
                        </span>
                        <p className="text-sm text-slate-500">
                          {formatOrderDate(order.createdAt)} · {order.itemCount}{" "}
                          {order.itemCount === 1 ? "item" : "items"}
                        </p>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      {/* Right: amount + actions */}
                      <div className="flex flex-col items-end gap-3">
                        <p className="text-lg font-bold text-slate-900">{formatInr(order.total)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          {order.status === "pending_payment" ? (
                            paymentsEnabled ? (
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                                Pay Now
                              </Link>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">
                                <CreditCard className="h-3.5 w-3.5" />
                                Payment soon
                              </span>
                            )
                          ) : null}
                          <Link
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-neutral-50"
                          >
                            View Order
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
