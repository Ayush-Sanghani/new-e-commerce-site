import { randomBytes } from "node:crypto";
import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db";
import { getRazorpay, getRazorpayKeyId } from "@/lib/razorpay";
import {
  computeLineTotal,
  computeOrderTotalsFromLines,
  effectiveUnitPriceInr,
  rupeesToPaise,
} from "@/lib/pricing";

function decimalToNumber(value: Prisma.Decimal): number {
  return value.toNumber();
}

export type OrderListRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  itemCount: number;
};

export type OrderDetailItemRow = {
  id: string;
  productId: string;
  title: string;
  sku: string;
  thumbnail: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type OrderCheckoutFields = {
  amount: number;
  currency: string;
  razorpayOrderId: string;
  keyId: string;
};

export type OrderDetailRow = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  items: OrderDetailItemRow[];
  paymentStatus: PaymentStatus | null;
  shippingAddress: Record<string, unknown> | null;
  /** Present only for pending_payment orders with an active Razorpay order */
  checkout: OrderCheckoutFields | null;
};

export async function listOrdersForUser(userId: string): Promise<OrderListRow[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      subtotal: true,
      tax: true,
      shipping: true,
      discount: true,
      total: true,
      currency: true,
      createdAt: true,
      _count: { select: { items: true } },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: decimalToNumber(order.subtotal),
    tax: decimalToNumber(order.tax),
    shipping: decimalToNumber(order.shipping),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    itemCount: order._count.items,
  }));
}

export async function getOrderForUser(
  userId: string,
  orderId: string
): Promise<OrderDetailRow | null> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) {
    return null;
  }

  const shippingAddress =
    order.shippingAddress &&
    typeof order.shippingAddress === "object" &&
    !Array.isArray(order.shippingAddress)
      ? (order.shippingAddress as Record<string, unknown>)
      : null;

  const latestPayment = order.payments[0];
  const checkout =
    order.status === OrderStatus.pending_payment && order.razorpayOrderId
      ? {
          amount: rupeesToPaise(order.total),
          currency: order.currency,
          razorpayOrderId: order.razorpayOrderId,
          keyId: getRazorpayKeyId(),
        }
      : null;

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    subtotal: decimalToNumber(order.subtotal),
    tax: decimalToNumber(order.tax),
    shipping: decimalToNumber(order.shipping),
    discount: decimalToNumber(order.discount),
    total: decimalToNumber(order.total),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      title: item.title,
      sku: item.sku,
      thumbnail: item.thumbnail,
      unitPrice: decimalToNumber(item.unitPrice),
      quantity: item.quantity,
      lineTotal: decimalToNumber(computeLineTotal(item.unitPrice, item.quantity)),
    })),
    paymentStatus: latestPayment?.status ?? null,
    shippingAddress,
    checkout,
  };
}

const MIN_CART_QUANTITY = 1;

/** Block a second checkout while a recent pending_payment order exists */
export const PENDING_ORDER_MAX_AGE_MS = 24 * 60 * 60 * 1000;

const productForOrder = {
  id: true,
  title: true,
  thumbnail: true,
  price: true,
  discountPercentage: true,
  sku: true,
  stock: true,
} as const;

function generateOrderNumber(): string {
  const y = new Date().getFullYear();
  return `ORD-${y}-${randomBytes(6).toString("hex")}`;
}

export type CreateOrderFromCartInput = {
  userId: string;
  shippingAddress?: Prisma.InputJsonValue;
  billingAddress?: Prisma.InputJsonValue;
};

export type CreateOrderFromCartResult =
  | {
      ok: true;
      data: {
        orderId: string;
        orderNumber: string;
        amount: number;
        currency: string;
        razorpayOrderId: string;
        keyId: string;
      };
    }
  | { ok: false; error: "empty_cart" }
  | { ok: false; error: "cart_not_found" }
  | {
      ok: false;
      error: "insufficient_stock";
      productId: string;
      max: number;
    }
  | {
      ok: false;
      error: "minimum_quantity";
      productId: string;
      min: number;
    }
  | {
      ok: false;
      error: "razorpay_failed";
      orderId: string;
      orderNumber: string;
      message: string;
    }
  | {
      ok: false;
      error: "pending_order_exists";
      orderId: string;
      orderNumber: string;
      razorpayOrderId?: string;
      amount?: number;
      keyId?: string;
    };

/**
 * Option A: persist Order + OrderItems + Payment (pending), then create Razorpay Order, then set `razorpayOrderId`.
 */
export async function createOrderFromCart(
  input: CreateOrderFromCartInput
): Promise<CreateOrderFromCartResult> {
  const cart =  await prisma.cart.findUnique({
    where: { userId: input.userId },
    include: {
      items: {
        include: { product: { select: productForOrder } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    return { ok: false, error: "cart_not_found" };
  }
  if (cart.items.length === 0) {
    return { ok: false, error: "empty_cart" };
  }

  type Line = {
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    title: string;
    sku: string;
    thumbnail: string | null;
    lineTotal: Prisma.Decimal;
  };

  const lines: Line[] = [];

  for (const item of cart.items) {
    const p = item.product;
    if (item.quantity > p.stock) {
      return { ok: false, error: "insufficient_stock", productId: p.id, max: p.stock };
    }
    if (item.quantity < MIN_CART_QUANTITY) {
      return {
        ok: false,
        error: "minimum_quantity",
        productId: p.id,
        min: MIN_CART_QUANTITY,
      };
    }

    const unitPrice = effectiveUnitPriceInr(p);
    const lineTotal = computeLineTotal(unitPrice, item.quantity);

    lines.push({
      productId: p.id,
      quantity: item.quantity,
      unitPrice,
      title: p.title,
      sku: p.sku,
      thumbnail: p.thumbnail,
      lineTotal,
    });
  }

  const { subtotal, tax, shipping, discount, total } = computeOrderTotalsFromLines(
    lines.map((line) => ({ lineTotal: line.lineTotal }))
  );

  if (total.lte(0)) {
    return { ok: false, error: "empty_cart" };
  }

  const pendingCutoff = new Date(Date.now() - PENDING_ORDER_MAX_AGE_MS);
  const existingPending = await prisma.order.findFirst({
    where: {
      userId: input.userId,
      status: OrderStatus.pending_payment,
      createdAt: { gte: pendingCutoff },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      razorpayOrderId: true,
      total: true,
      currency: true,
    },
  });

  if (existingPending) {
    const resumeAmount = existingPending.razorpayOrderId
      ? rupeesToPaise(existingPending.total)
      : undefined;
    return {
      ok: false,
      error: "pending_order_exists",
      orderId: existingPending.id,
      orderNumber: existingPending.orderNumber,
      razorpayOrderId: existingPending.razorpayOrderId ?? undefined,
      amount: resumeAmount,
      keyId: existingPending.razorpayOrderId ? getRazorpayKeyId() : undefined,
    };
  }

  const amountPaise = rupeesToPaise(total);
  if (amountPaise < 1) {
    return { ok: false, error: "empty_cart" };
  }

  const orderNumber = generateOrderNumber();

  const { orderId } = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        status: OrderStatus.pending_payment,
        currency: "INR",
        subtotal,
        tax,
        shipping,
        discount,
        total,
        shippingAddress: input.shippingAddress ?? undefined,
        billingAddress: input.billingAddress ?? undefined,
        items: {
          create: lines.map((line) => ({
            productId: line.productId,
            title: line.title,
            sku: line.sku,
            thumbnail: line.thumbnail,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
          })),
        },
        payments: {
          create: {
            amount: total,
            currency: "INR",
            status: PaymentStatus.pending,
            provider: "razorpay",
          },
        },
      },
      select: { id: true },
    });

    return { orderId: order.id };
  });

  const rz = getRazorpay();
  try {
    const receipt = orderNumber.slice(0, 40);
    const rzOrder = await rz.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes: {
        internalOrderId: orderId,
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { razorpayOrderId: rzOrder.id },
    });

    return {
      ok: true,
      data: {
        orderId,
        orderNumber,
        amount: amountPaise,
        currency: "INR",
        razorpayOrderId: rzOrder.id,
        keyId: getRazorpayKeyId(),
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Razorpay order creation failed";
    return {
      ok: false,
      error: "razorpay_failed",
      orderId,
      orderNumber,
      message,
    };
  }
}

export type FinalizePaidOrderInput = {
  orderId: string;
  razorpayPaymentId?: string;
};

export type FinalizePaidOrderResult =
  | {
      ok: true;
      data: {
        orderId: string;
        orderNumber: string;
        orderStatus: OrderStatus;
        paymentStatus: PaymentStatus;
        userId: string;
      };
    }
  | { ok: false; error: "order_not_found" }
  | { ok: false; error: "insufficient_stock_at_capture" };

/**
 * Single idempotent path to mark an order paid: capture payment, decrement stock, clear cart.
 * Used by client verify and Razorpay payment.captured webhook.
 */
export async function finalizePaidOrder(
  input: FinalizePaidOrderInput
): Promise<FinalizePaidOrderResult> {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      include: {
        items: { select: { productId: true, quantity: true } },
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    if (!order) {
      return { ok: false, error: "order_not_found" };
    }

    const latestPayment = order.payments[0];
    if (order.status === OrderStatus.paid && latestPayment?.status === PaymentStatus.captured) {
      return {
        ok: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          paymentStatus: latestPayment.status,
          userId: order.userId,
        },
      };
    }

    for (const item of order.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stock: { gte: item.quantity } },
        data: { stock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        return { ok: false, error: "insufficient_stock_at_capture" };
      }
    }

    const paymentRow = await tx.payment.findFirst({
      where: { orderId: order.id },
      orderBy: { createdAt: "desc" },
    });
    if (paymentRow) {
      await tx.payment.update({
        where: { id: paymentRow.id },
        data: {
          status: PaymentStatus.captured,
          ...(input.razorpayPaymentId
            ? { razorpayPaymentId: input.razorpayPaymentId }
            : {}),
        },
      });
    }

    await tx.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.paid },
    });

    const cart = await tx.cart.findUnique({ where: { userId: order.userId } });
    if (cart) {
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedOrder = await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        payments: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });

    return {
      ok: true,
      data: {
        orderId: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        orderStatus: updatedOrder.status,
        paymentStatus: updatedOrder.payments[0]?.status ?? PaymentStatus.captured,
        userId: order.userId,
      },
    };
  });
}

export type CancelPendingOrderResult =
  | { ok: true; data: { orderId: string; orderNumber: string } }
  | { ok: false; error: "order_not_found" }
  | { ok: false; error: "order_not_cancellable" };

export async function cancelPendingOrder(
  userId: string,
  orderId: string
): Promise<CancelPendingOrderResult> {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, orderNumber: true, status: true },
  });

  if (!order) {
    return { ok: false, error: "order_not_found" };
  }

  if (order.status !== OrderStatus.pending_payment) {
    return { ok: false, error: "order_not_cancellable" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.cancelled },
  });

  return {
    ok: true,
    data: { orderId: order.id, orderNumber: order.orderNumber },
  };
}

export type VerifyOrderPaymentInput = {
  userId: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

export type VerifyOrderPaymentResult =
  | {
      ok: true;
      data: {
        orderId: string;
        orderNumber: string;
        orderStatus: OrderStatus;
        paymentStatus: PaymentStatus;
      };
    }
  | { ok: false; error: "order_not_found" }
  | { ok: false; error: "order_mismatch" }
  | { ok: false; error: "invalid_signature" }
  | { ok: false; error: "payment_not_found" }
  | { ok: false; error: "payment_mismatch" }
  | { ok: false; error: "insufficient_stock_at_capture" };

export async function verifyOrderPayment(
  input: VerifyOrderPaymentInput
): Promise<VerifyOrderPaymentResult> {
  const order = await prisma.order.findFirst({
    where: { id: input.orderId, userId: input.userId },
    include: {
      payments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!order) {
    return { ok: false, error: "order_not_found" };
  }

  if (!order.razorpayOrderId || order.razorpayOrderId !== input.razorpayOrderId) {
    return { ok: false, error: "order_mismatch" };
  }

  // Idempotent success if already paid and a captured payment is present.
  const latestPayment = order.payments[0];
  if (order.status === OrderStatus.paid && latestPayment?.status === PaymentStatus.captured) {
    return {
      ok: true,
      data: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        orderStatus: order.status,
        paymentStatus: latestPayment.status,
      },
    };
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET");
  }

  const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const generated = createHmac("sha256", keySecret).update(payload).digest("hex");
  const generatedBuf = Buffer.from(generated);
  const receivedBuf = Buffer.from(input.razorpaySignature);
  if (generatedBuf.length !== receivedBuf.length || !timingSafeEqual(generatedBuf, receivedBuf)) {
    return { ok: false, error: "invalid_signature" };
  }

  const rz = getRazorpay();
  const payment = await rz.payments.fetch(input.razorpayPaymentId);
  if (!payment || typeof payment !== "object") {
    return { ok: false, error: "payment_not_found" };
  }

  const paymentOrderId = String((payment as { order_id?: string }).order_id ?? "");
  const paymentAmount = Number((payment as { amount?: number }).amount ?? -1);
  const paymentStatus = String((payment as { status?: string }).status ?? "");
  const paymentCaptured = Boolean((payment as { captured?: boolean }).captured);
  const expectedAmount = rupeesToPaise(order.total);

  const isCapturedLike = paymentStatus === "captured" || paymentCaptured === true;
  if (
    paymentOrderId !== input.razorpayOrderId ||
    paymentAmount !== expectedAmount ||
    !isCapturedLike
  ) {
    return { ok: false, error: "payment_mismatch" };
  }

  const finalized = await finalizePaidOrder({
    orderId: order.id,
    razorpayPaymentId: input.razorpayPaymentId,
  });

  if (!finalized.ok) {
    return finalized;
  }

  return {
    ok: true,
    data: {
      orderId: finalized.data.orderId,
      orderNumber: finalized.data.orderNumber,
      orderStatus: finalized.data.orderStatus,
      paymentStatus: finalized.data.paymentStatus,
    },
  };
}

type RazorpayWebhookPayment = {
  id: string;
  order_id: string;
  amount: number;
  status?: string;
  captured?: boolean | number;
};

export type ProcessRazorpayWebhookResult =
  | { ok: true; ignored: "order_not_found" | "unsupported_event" | "already_processed" }
  | { ok: true; updated: "captured" | "failed"; orderId: string }
  | { ok: false; error: "payment_mismatch" | "insufficient_stock_at_capture" };

export async function processRazorpayWebhook(
  event: string,
  payment: RazorpayWebhookPayment
): Promise<ProcessRazorpayWebhookResult> {
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: payment.order_id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!order) {
    return { ok: true, ignored: "order_not_found" };
  }

  const expectedAmount = rupeesToPaise(order.total);
  if (payment.amount !== expectedAmount) {
    return { ok: false, error: "payment_mismatch" };
  }

  const latestPayment = order.payments[0];

  if (event === "payment.captured") {
    if (order.status === OrderStatus.paid && latestPayment?.status === PaymentStatus.captured) {
      return { ok: true, ignored: "already_processed" };
    }

    const finalized = await finalizePaidOrder({
      orderId: order.id,
      razorpayPaymentId: payment.id,
    });

    if (!finalized.ok) {
      if (finalized.error === "insufficient_stock_at_capture") {
        return { ok: false, error: "insufficient_stock_at_capture" };
      }
      return { ok: true, ignored: "order_not_found" };
    }

    return { ok: true, updated: "captured", orderId: order.id };
  }

  if (event === "payment.failed") {
    if (latestPayment?.status === PaymentStatus.failed) {
      return { ok: true, ignored: "already_processed" };
    }

    await prisma.payment.updateMany({
      where: { orderId: order.id, status: { not: PaymentStatus.captured } },
      data: {
        status: PaymentStatus.failed,
      },
    });

    return { ok: true, updated: "failed", orderId: order.id };
  }

  return { ok: true, ignored: "unsupported_event" };
}
