import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    cart: { findUnique: vi.fn() },
    order: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/razorpay", () => ({
  getRazorpay: vi.fn(),
  getRazorpayKeyId: () => "rzp_test_key",
}));

import {
  createOrderFromCart,
  finalizePaidOrder,
  PENDING_ORDER_MAX_AGE_MS,
} from "@/lib/services/order";

describe("finalizePaidOrder", () => {
  const orderId = "order-1";
  const userId = "user-1";

  const paidOrder = {
    id: orderId,
    orderNumber: "ORD-2026-abc",
    userId,
    status: OrderStatus.paid,
    items: [{ productId: "prod-1", quantity: 2 }],
    payments: [{ status: PaymentStatus.captured }],
  };

  const pendingOrder = {
    ...paidOrder,
    status: OrderStatus.pending_payment,
    payments: [{ status: PaymentStatus.pending }],
  };

  let productUpdateMany: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    productUpdateMany = vi.fn().mockResolvedValue({ count: 1 });

    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
        const tx = {
          order: {
            findUnique: vi.fn(),
            update: vi.fn(),
            findUniqueOrThrow: vi.fn(),
          },
          product: { updateMany: productUpdateMany },
          payment: { findFirst: vi.fn(), update: vi.fn() },
          cart: { findUnique: vi.fn().mockResolvedValue({ id: "cart-1" }) },
          cartItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
        };
        return fn(tx);
      }
    );
  });

  it("decrements stock on first capture and is idempotent on second call", async () => {
    const txOrderFindUnique = vi
      .fn()
      .mockResolvedValueOnce(pendingOrder)
      .mockResolvedValueOnce(paidOrder);

    prismaMock.$transaction.mockImplementation(
      async (fn: (tx: Record<string, unknown>) => Promise<unknown>) => {
        const tx = {
          order: {
            findUnique: txOrderFindUnique,
            update: vi.fn(),
            findUniqueOrThrow: vi.fn().mockResolvedValue({
              ...paidOrder,
              payments: [{ status: PaymentStatus.captured }],
            }),
          },
          product: { updateMany: productUpdateMany },
          payment: {
            findFirst: vi.fn().mockResolvedValue({ id: "pay-1" }),
            update: vi.fn(),
          },
          cart: { findUnique: vi.fn().mockResolvedValue({ id: "cart-1" }) },
          cartItem: { deleteMany: vi.fn() },
        };
        return fn(tx);
      }
    );

    const first = await finalizePaidOrder({
      orderId,
      razorpayPaymentId: "pay_rzp_1",
    });
    expect(first.ok).toBe(true);
    expect(productUpdateMany).toHaveBeenCalledTimes(1);
    expect(productUpdateMany).toHaveBeenCalledWith({
      where: { id: "prod-1", stock: { gte: 2 } },
      data: { stock: { decrement: 2 } },
    });

    const second = await finalizePaidOrder({ orderId, razorpayPaymentId: "pay_rzp_1" });
    expect(second.ok).toBe(true);
    expect(productUpdateMany).toHaveBeenCalledTimes(1);
  });
});

describe("createOrderFromCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns pending_order_exists when a recent pending_payment order exists", async () => {
    const userId = "user-2";
    const unitPrice = new Prisma.Decimal(100);

    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-2",
      items: [
        {
          quantity: 1,
          product: {
            id: "prod-9",
            title: "Widget",
            thumbnail: null,
            price: unitPrice,
            discountPercentage: new Prisma.Decimal(0),
            sku: "W-1",
            stock: 5,
          },
        },
      ],
    });

    prismaMock.order.findFirst.mockResolvedValue({
      id: "pending-order",
      orderNumber: "ORD-2026-pending",
      razorpayOrderId: "order_rzp_existing",
      total: new Prisma.Decimal(118),
      currency: "INR",
    });

    const result = await createOrderFromCart({ userId });

    expect(result).toMatchObject({
      ok: false,
      error: "pending_order_exists",
      orderId: "pending-order",
      orderNumber: "ORD-2026-pending",
      razorpayOrderId: "order_rzp_existing",
      keyId: "rzp_test_key",
    });
    expect(prismaMock.order.create).not.toHaveBeenCalled();
    expect(prismaMock.order.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId,
          status: OrderStatus.pending_payment,
          createdAt: expect.objectContaining({
            gte: expect.any(Date),
          }),
        }),
      })
    );

    const cutoffArg = prismaMock.order.findFirst.mock.calls[0][0].where.createdAt.gte as Date;
    const ageMs = Date.now() - cutoffArg.getTime();
    expect(ageMs).toBeGreaterThanOrEqual(PENDING_ORDER_MAX_AGE_MS - 1000);
    expect(ageMs).toBeLessThanOrEqual(PENDING_ORDER_MAX_AGE_MS + 1000);
  });
});
