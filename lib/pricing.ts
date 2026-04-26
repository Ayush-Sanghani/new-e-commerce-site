import { Prisma } from "@prisma/client";

type ProductPriceFields = {
  price: Prisma.Decimal;
  discountPercentage: Prisma.Decimal;
};

/**
 * Unit price in INR after catalog discount (matches typical storefront: price × (1 − discount%)).
 */
export function effectiveUnitPriceInr(product: ProductPriceFields): Prisma.Decimal {
  const price = new Prisma.Decimal(product.price);
  const pct = new Prisma.Decimal(product.discountPercentage);
  const factor = new Prisma.Decimal(1).minus(pct.div(100));
  return price.mul(factor).toDecimalPlaces(2, Prisma.Decimal.ROUND_HALF_UP);
}

/** Razorpay expects integer paise (INR × 100). */
export function rupeesToPaise(rupees: Prisma.Decimal): number {
  return rupees.mul(100).toDecimalPlaces(0, Prisma.Decimal.ROUND_HALF_UP).toNumber();
}
