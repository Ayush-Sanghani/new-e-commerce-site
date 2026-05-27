import type { OrderStatus, PaymentStatus } from "@prisma/client";

const statusStyles: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-50 text-amber-700 ring-amber-300",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-blue-50 text-blue-700 ring-blue-200",
};

const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Awaiting Payment",
  paid: "Delivered",
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
