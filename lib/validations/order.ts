import { z } from "zod";

/** Optional JSON address blobs for v1 checkout. */
export const createOrderBodySchema = z.object({
  shippingAddress: z.record(z.string(), z.unknown()).optional(),
  billingAddress: z.record(z.string(), z.unknown()).optional(),
  /** ISO 4217 charge currency; server validates against active Currency rows. */
  currency: z
    .string()
    .trim()
    .length(3)
    .transform((value) => value.toUpperCase())
    .optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderBodySchema>;

export const verifyOrderPaymentBodySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type VerifyOrderPaymentBody = z.infer<typeof verifyOrderPaymentBodySchema>;
