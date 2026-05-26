import type { OrderStatus, PaymentStatus } from "@prisma/client";

const statusStyles: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-neutral-100 text-slate-600 ring-neutral-200",
  refunded: "bg-blue-50 text-blue-800 ring-blue-200",
};

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const failedPaymentStyle = "bg-red-50 text-red-800 ring-red-200";

function resolveLabel(status: OrderStatus, paymentStatus: PaymentStatus | null | undefined): string {
  if (status === "pending_payment" && paymentStatus === "failed") {
    return "Payment failed";
  }
  return statusLabels[status];
}

function resolveStyle(status: OrderStatus, paymentStatus: PaymentStatus | null | undefined): string {
  if (status === "pending_payment" && paymentStatus === "failed") {
    return failedPaymentStyle;
  }
  return statusStyles[status];
}

type OrderStatusBadgeProps = {
  status: OrderStatus;
  paymentStatus?: PaymentStatus | null;
};

export function OrderStatusBadge({ status, paymentStatus }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${resolveStyle(status, paymentStatus)}`}
    >
      {resolveLabel(status, paymentStatus)}
    </span>
  );
}
