import { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    cart: { findUnique: vi.fn() },
    order: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    currency: { findFirst: vi.fn(), findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/razorpay", () => ({
  getRazorpay: vi.fn(),
  getRazorpayKeyId: () => "rzp_test_key",
}));

vi.mock("@/lib/payments-config", () => ({
  isPaymentsEnabled: vi.fn(() => true),
}));

vi.mock("@/lib/services/currency", () => ({
  getCurrencyContext: vi.fn(async (code: string) => {
    if (code === "USD") {
      return {
        code: "USD",
        symbol: "$",
        decimalDigits: 2,
        rateToInr: new Prisma.Decimal("83.5"),
        rateUpdatedAt: new Date(),
        rateStale: false,
      };
    }
    return {
      code: "INR",
      symbol: "₹",
      decimalDigits: 2,
      rateToInr: new Prisma.Decimal(1),
      rateUpdatedAt: new Date(),
      rateStale: false,
    };
  }),
}));

import {
  createOrderFromCart,
  finalizePaidOrder,
  PENDING_ORDER_MAX_AGE_MS,
} from "@/lib/services/order";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { getRazorpay } from "@/lib/razorpay";
import { getCurrencyContext } from "@/lib/services/currency";

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
    vi.mocked(isPaymentsEnabled).mockReturnValue(true);
    prismaMock.currency.findFirst.mockResolvedValue({ isRazorpaySupported: true });
    prismaMock.currency.findUnique.mockResolvedValue({ decimalDigits: 2 });
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
      currency: "INR",
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

  it("creates order without Razorpay when payments are disabled", async () => {
    vi.mocked(isPaymentsEnabled).mockReturnValue(false);

    const userId = "user-3";
    const unitPrice = new Prisma.Decimal(100);

    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-3",
      items: [
        {
          quantity: 1,
          product: {
            id: "prod-10",
            title: "Widget",
            thumbnail: null,
            price: unitPrice,
            discountPercentage: new Prisma.Decimal(0),
            sku: "W-2",
            stock: 5,
          },
        },
      ],
    });

    prismaMock.order.findFirst.mockResolvedValue(null);
    const orderCreate = vi.fn().mockResolvedValue({ id: "order-disabled-1" });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        order: {
          create: orderCreate,
        },
      })
    );

    const result = await createOrderFromCart({ userId, currencyCode: "USD" });

    expect(result).toMatchObject({
      ok: true,
      data: {
        orderId: "order-disabled-1",
        currency: "USD",
        paymentsEnabled: false,
      },
    });
    expect(getCurrencyContext).toHaveBeenCalledWith("USD");
    expect(orderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          currency: "USD",
          totalInInr: expect.anything(),
        }),
      })
    );
    expect(getRazorpay).not.toHaveBeenCalled();
  });

  it("locks USD FX snapshot on order + payment when payments are disabled", async () => {
    vi.mocked(isPaymentsEnabled).mockReturnValue(false);

    // ₹190 × 2 = ₹380 subtotal → tax ₹19 → shipping ₹40 → total ₹439
    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-usd",
      items: [
        {
          quantity: 2,
          product: {
            id: "prod-usd",
            title: "Vitamin D",
            thumbnail: null,
            price: new Prisma.Decimal(190),
            discountPercentage: new Prisma.Decimal(0),
            sku: "VD-1",
            stock: 10,
          },
        },
      ],
    });
    prismaMock.order.findFirst.mockResolvedValue(null);

    const orderCreate = vi.fn().mockResolvedValue({ id: "order-usd-1" });
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({ order: { create: orderCreate } })
    );

    const result = await createOrderFromCart({
      userId: "user-usd",
      currencyCode: "USD",
    });

    expect(result.ok).toBe(true);
    const createData = orderCreate.mock.calls[0][0].data;

    expect(createData.currency).toBe("USD");
    expect(Number(createData.exchangeRate)).toBe(83.5);
    expect(Number(createData.totalInInr)).toBe(439);
    expect(Number(createData.subtotal)).toBe(4.55);
    expect(Number(createData.tax)).toBe(0.23);
    expect(Number(createData.shipping)).toBe(0.48);
    expect(Number(createData.total)).toBe(5.26);
    expect(createData.items.create[0].unitPrice.toNumber()).toBe(190);
    expect(Number(createData.payments.create.amount)).toBe(5.26);
    expect(createData.payments.create.currency).toBe("USD");
    expect(Number(createData.payments.create.amountInInr)).toBe(439);
    expect(getRazorpay).not.toHaveBeenCalled();
  });

  it("passes charge currency and minor units to Razorpay when payments enabled", async () => {
    const createRazorpayOrder = vi.fn().mockResolvedValue({ id: "order_rzp_usd" });
    vi.mocked(getRazorpay).mockReturnValue({
      orders: { create: createRazorpayOrder },
    } as never);

    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-pay",
      items: [
        {
          quantity: 2,
          product: {
            id: "prod-pay",
            title: "Vitamin D",
            thumbnail: null,
            price: new Prisma.Decimal(190),
            discountPercentage: new Prisma.Decimal(0),
            sku: "VD-2",
            stock: 10,
          },
        },
      ],
    });
    prismaMock.order.findFirst.mockResolvedValue(null);
    prismaMock.order.update.mockResolvedValue({});
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        order: {
          create: vi.fn().mockResolvedValue({ id: "order-pay-1" }),
        },
      })
    );

    const result = await createOrderFromCart({
      userId: "user-pay",
      currencyCode: "USD",
    });

    expect(result).toMatchObject({
      ok: true,
      data: {
        orderId: "order-pay-1",
        currency: "USD",
        amount: 526,
        razorpayOrderId: "order_rzp_usd",
        paymentsEnabled: true,
      },
    });
    expect(createRazorpayOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 526,
        currency: "USD",
      })
    );
  });

  it("returns currency_not_supported_for_payment when Razorpay does not support currency", async () => {
    prismaMock.currency.findFirst.mockResolvedValue({ isRazorpaySupported: false });
    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-block",
      items: [
        {
          quantity: 1,
          product: {
            id: "prod-block",
            title: "Item",
            thumbnail: null,
            price: new Prisma.Decimal(100),
            discountPercentage: new Prisma.Decimal(0),
            sku: "B-1",
            stock: 5,
          },
        },
      ],
    });

    const result = await createOrderFromCart({
      userId: "user-block",
      currencyCode: "USD",
    });

    expect(result).toEqual({
      ok: false,
      error: "currency_not_supported_for_payment",
    });
    expect(getRazorpay).not.toHaveBeenCalled();
  });

  it("returns razorpay_failed with saved order when Razorpay keys are missing", async () => {
    vi.mocked(getRazorpay).mockImplementation(() => {
      throw new Error("Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET");
    });

    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-nokey",
      items: [
        {
          quantity: 1,
          product: {
            id: "prod-nokey",
            title: "Item",
            thumbnail: null,
            price: new Prisma.Decimal(100),
            discountPercentage: new Prisma.Decimal(0),
            sku: "NK-1",
            stock: 5,
          },
        },
      ],
    });
    prismaMock.order.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback) =>
      callback({
        order: {
          create: vi.fn().mockResolvedValue({ id: "order-nokey-1" }),
        },
      })
    );

    const result = await createOrderFromCart({
      userId: "user-nokey",
      currencyCode: "INR",
    });

    expect(result).toMatchObject({
      ok: false,
      error: "razorpay_failed",
      orderId: "order-nokey-1",
      message: "Missing RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET",
    });
  });

  it("resumes pending USD order with cents minor units", async () => {
    prismaMock.cart.findUnique.mockResolvedValue({
      id: "cart-resume",
      items: [
        {
          quantity: 1,
          product: {
            id: "prod-resume",
            title: "Item",
            thumbnail: null,
            price: new Prisma.Decimal(100),
            discountPercentage: new Prisma.Decimal(0),
            sku: "R-1",
            stock: 5,
          },
        },
      ],
    });
    prismaMock.order.findFirst.mockResolvedValue({
      id: "pending-usd",
      orderNumber: "ORD-2026-usd",
      razorpayOrderId: "order_rzp_usd_pending",
      total: new Prisma.Decimal("5.26"),
      currency: "USD",
    });

    const result = await createOrderFromCart({
      userId: "user-resume",
      currencyCode: "USD",
    });

    expect(result).toMatchObject({
      ok: false,
      error: "pending_order_exists",
      orderId: "pending-usd",
      currency: "USD",
      amount: 526,
      razorpayOrderId: "order_rzp_usd_pending",
    });
  });
});
