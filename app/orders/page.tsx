import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { verifyToken } from "@/lib/jwt";
import { formatInr } from "@/lib/pricing";
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

  const orders = await listOrdersForUser(userId);

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
            <p className="text-sm font-medium text-slate-700">You have not placed any orders yet.</p>
            <Link
              href="/shop"
              className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Start Shopping
            </Link>
          </section>
        ) : (
          <section className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{order.orderNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatOrderDate(order.createdAt)} · {order.itemCount}{" "}
                      {order.itemCount === 1 ? "item" : "items"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <OrderStatusBadge status={order.status} />
                    <p className="text-base font-bold text-slate-900">{formatInr(order.total)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
