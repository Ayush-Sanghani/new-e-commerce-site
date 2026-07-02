/** When false, orders are created but Razorpay checkout is replaced with a coming-soon message. */
export function isPaymentsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === "true";
}
