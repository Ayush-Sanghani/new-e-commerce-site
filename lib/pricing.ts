import { Prisma } from "@prisma/client";

/** All catalog and checkout amounts are stored and charged in INR. */
export const PRODUCT_CURRENCY = "INR" as const;

/** Free shipping when subtotal (after line discounts) is at or above this amount (INR). */
export const FREE_SHIPPING_MIN_SUBTOTAL_INR = 999;

/** GST-style tax applied to subtotal (e.g. 0.05 = 5%). */
export const TAX_RATE = 0.05;

const inrFormatter = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type ProductPriceFields = {
  price: Prisma.Decimal;
  discountPercentage: Prisma.Decimal;
};

export type OrderTotals = {
  subtotal: Prisma.Decimal;
  tax: Prisma.Decimal;
  shipping: Prisma.Decimal;
  discount: Prisma.Decimal;
  total: Prisma.Decimal;
  currency: typeof PRODUCT_CURRENCY;
};

export type OrderTotalsLine = {
  lineTotal: Prisma.Decimal;
};

function toDecimal(value: number | Prisma.Decimal): Prisma.Decimal {
  return value instanceof Prisma.Decimal ? value : new Prisma.Decimal(value);
}

function roundInr(value: Prisma.Decimal): Prisma.Decimal {
  return value.toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/**
 * Unit price in INR after catalog discount: list price × (1 − discount%).
 */
export function effectiveUnitPriceInr(product: ProductPriceFields): Prisma.Decimal {
  const price = new Prisma.Decimal(product.price);
  const pct = new Prisma.Decimal(product.discountPercentage);
  const factor = new Prisma.Decimal(1).minus(pct.div(100));
  return roundInr(price.mul(factor));
}

/** Line total for one cart/order row (unit × quantity). */
export function computeLineTotal(
  unitPrice: Prisma.Decimal | number,
  quantity: number
): Prisma.Decimal {
  const qty = Math.max(0, Math.floor(quantity));
  return roundInr(toDecimal(unitPrice).mul(qty));
}

/**
 * Checkout totals from line totals. Server source of truth for cart summary and orders.
 * No cart-level order discount — only per-product catalog discount is in line totals.
 */
export function computeOrderTotalsFromLines(lines: OrderTotalsLine[]): OrderTotals {
  let subtotal = new Prisma.Decimal(0);
  for (const line of lines) {
    subtotal = subtotal.add(line.lineTotal);
  }
  subtotal = roundInr(subtotal);

  const tax = roundInr(subtotal.mul(TAX_RATE));
  const shipping =
    subtotal.gte(FREE_SHIPPING_MIN_SUBTOTAL_INR) || subtotal.lte(0)
      ? new Prisma.Decimal(0)
      : new Prisma.Decimal(40);
  const discount = new Prisma.Decimal(0);
  const total = roundInr(subtotal.add(tax).add(shipping).sub(discount));

  return {
    subtotal,
    tax,
    shipping,
    discount,
    total,
    currency: PRODUCT_CURRENCY,
  };
}

/** Razorpay expects integer paise (INR × 100). */
export function rupeesToPaise(rupees: Prisma.Decimal): number {
  return rupees.mul(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber();
}

export type CatalogPrices = {
  /** List/MRP in INR (DB `Product.price`). */
  listPrice: number;
  /** Payable unit price after catalog discount %. */
  effectivePrice: number;
  discountPercentage: number;
  /** List price when on sale (for strikethrough); omitted when not discounted. */
  oldPrice?: number;
};

/** Resolve list vs effective INR prices for catalog UI (shop, home, product pages). */
export function resolveCatalogPrices(
  listPrice: number,
  discountPercentage: number
): CatalogPrices {
  const list = new Prisma.Decimal(listPrice);
  const pct = new Prisma.Decimal(discountPercentage);
  const effective = effectiveUnitPriceInr({ price: list, discountPercentage: pct });
  const listRounded = roundInr(list);
  const onSale = pct.gt(0) && pct.lt(100) && effective.lt(listRounded);

  return {
    listPrice: listRounded.toNumber(),
    effectivePrice: effective.toNumber(),
    discountPercentage: pct.toNumber(),
    oldPrice: onSale ? listRounded.toNumber() : undefined,
  };
}

/** Display INR amounts (values are already INR, not USD). */
export function formatInr(amount: number | Prisma.Decimal): string {
  const value =
    amount instanceof Prisma.Decimal ? amount.toNumber() : Number.isFinite(amount) ? amount : 0;
  return `₹${inrFormatter.format(value)}`;
}
