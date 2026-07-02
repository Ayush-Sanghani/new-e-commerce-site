import type { Cart, CartItem, Product } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import {
  computeLineTotal,
  computeOrderTotalsFromLines,
  effectiveUnitPriceInr,
  PRODUCT_CURRENCY,
} from "@/lib/pricing";
import { validateProductQuantity } from "@/lib/product-availability";

const productForValidation = {
  id: true,
  title: true,
  thumbnail: true,
  price: true,
  sku: true,
  stock: true,
  minimumOrderQuantity: true,
  availabilityStatus: true,
} as const;

const productForCart = {
  id: true,
  title: true,
  thumbnail: true,
  price: true,
  discountPercentage: true,
  sku: true,
  stock: true,
  minimumOrderQuantity: true,
  availabilityStatus: true,
} as const;

type CartItemWithProduct = CartItem & {
  product: Pick<
    Product,
    | "id"
    | "title"
    | "thumbnail"
    | "price"
    | "discountPercentage"
    | "sku"
    | "stock"
    | "minimumOrderQuantity"
    | "availabilityStatus"
  >;
};

export type CartWithItems = Cart & { items: CartItemWithProduct[] };

export type CartSummaryPayload = {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: typeof PRODUCT_CURRENCY;
};

export type CartLinePayload = {
  id: string;
  productId: string;
  quantity: number;
  /** Payable unit price in INR (after catalog discount). */
  unitPrice: number;
  /** List/MRP unit price in INR (before catalog discount). */
  listPrice: number;
  /** Catalog discount % on this product. */
  discountPercentage: number;
  /** unitPrice × quantity */
  lineTotal: number;
  /** listPrice × quantity (for strikethrough display). */
  listLineTotal: number;
  maxQuantity: number;
  product: {
    id: string;
    title: string;
    thumbnail: string | null;
    sku: string;
  };
};

export type CartPayload = {
  id: string;
  items: CartLinePayload[];
  summary: CartSummaryPayload;
};

function decimalToNumber(value: Prisma.Decimal): number {
  return value.toNumber();
}

function serializeSummary(totals: ReturnType<typeof computeOrderTotalsFromLines>): CartSummaryPayload {
  return {
    subtotal: decimalToNumber(totals.subtotal),
    tax: decimalToNumber(totals.tax),
    shipping: decimalToNumber(totals.shipping),
    discount: decimalToNumber(totals.discount),
    total: decimalToNumber(totals.total),
    currency: totals.currency,
  };
}

type CartQuantityError =
  | { ok: false; error: "not_available"; reason: string }
  | { ok: false; error: "insufficient_stock"; max: number }
  | { ok: false; error: "minimum_quantity"; min: number };

function mapQuantityValidation(result: CartQuantityError): CartQuantityError {
  return result;
}

async function loadCartWithItems(
  tx: Prisma.TransactionClient,
  cartId: string
): Promise<CartItemWithProduct[]> {
  return tx.cartItem.findMany({
    where: { cartId },
    include: { product: { select: productForCart } },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Server source of truth for cart line prices and checkout summary (INR).
 */
export function buildCartPayload(cart: CartWithItems | null): CartPayload | null {
  if (!cart) {
    return null;
  }

  const lines: CartLinePayload[] = [];
  const totalLines: { lineTotal: Prisma.Decimal }[] = [];

  for (const item of cart.items) {
    const listPrice = new Prisma.Decimal(item.product.price).toDecimalPlaces(
      2,
      Prisma.Decimal.ROUND_HALF_UP
    );
    const unitPrice = effectiveUnitPriceInr(item.product);
    const lineTotal = computeLineTotal(unitPrice, item.quantity);

    const discountPct = decimalToNumber(
      new Prisma.Decimal(item.product.discountPercentage).toDecimalPlaces(
        2,
        Prisma.Decimal.ROUND_HALF_UP
      )
    );
    const listLineTotal = computeLineTotal(listPrice, item.quantity);

    lines.push({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: decimalToNumber(unitPrice),
      listPrice: decimalToNumber(listPrice),
      discountPercentage: discountPct,
      lineTotal: decimalToNumber(lineTotal),
      listLineTotal: decimalToNumber(listLineTotal),
      maxQuantity: item.product.stock,
      product: {
        id: item.product.id,
        title: item.product.title,
        thumbnail: item.product.thumbnail,
        sku: item.product.sku,
      },
    });

    totalLines.push({ lineTotal });
  }

  return {
    id: cart.id,
    items: lines,
    summary: serializeSummary(computeOrderTotalsFromLines(totalLines)),
  };
}

/** Logged-in only. Returns null if the user has no cart yet. */
export async function getCartForUser(userId: string): Promise<CartWithItems | null> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { select: productForCart } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  return cart;
}

export type AddItemToCartResult =
  | { ok: true; cart: CartWithItems }
  | { ok: false; error: "product_not_found" }
  | { ok: false; error: "not_available"; reason: string }
  | { ok: false; error: "insufficient_stock"; max: number }
  | { ok: false; error: "minimum_quantity"; min: number };

/**
 * Logged-in users only. Creates a cart on first add; adds to existing line quantity if present.
 */
export async function addItemToCart(
  userId: string,
  productId: string,
  quantity: number
): Promise<AddItemToCartResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: productForValidation,
      });

      if (!product) {
        return { ok: false, error: "product_not_found" };
      }

      let cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        cart = await tx.cart.create({ data: { userId } });
      }

      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      const newQuantity = (existing?.quantity ?? 0) + quantity;
      const validation = validateProductQuantity(product, newQuantity);
      if (!validation.ok) {
        return mapQuantityValidation(validation);
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: newQuantity },
        });
      } else {
        try {
          await tx.cartItem.create({
            data: { cartId: cart.id, productId, quantity: newQuantity },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            const raced = await tx.cartItem.findUnique({
              where: { cartId_productId: { cartId: cart.id, productId } },
            });
            if (!raced) throw error;

            const mergedQuantity = raced.quantity + quantity;
            const retryValidation = validateProductQuantity(product, mergedQuantity);
            if (!retryValidation.ok) {
              return mapQuantityValidation(retryValidation);
            }

            await tx.cartItem.update({
              where: { id: raced.id },
              data: { quantity: mergedQuantity },
            });
          } else {
            throw error;
          }
        }
      }

      const items = await loadCartWithItems(tx, cart.id);
      return { ok: true, cart: { ...cart, items } };
    });
  } catch (error) {
    console.error("addItemToCart:", error);
    throw error;
  }
}

export type UpdateCartItemResult =
  | { ok: true; cart: CartWithItems }
  | { ok: false; error: "product_not_found" }
  | { ok: false; error: "cart_not_found" }
  | { ok: false; error: "item_not_in_cart" }
  | { ok: false; error: "not_available"; reason: string }
  | { ok: false; error: "insufficient_stock"; max: number }
  | { ok: false; error: "minimum_quantity"; min: number };

/**
 * Logged-in only. Sets final quantity for an existing line (quantity >= MOQ).
 */
export async function updateCartItemQuantity(
  userId: string,
  productId: string,
  quantity: number
): Promise<UpdateCartItemResult> {
  try {
    return await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        select: productForValidation,
      });
      if (!product) {
        return { ok: false, error: "product_not_found" };
      }

      const cart = await tx.cart.findUnique({ where: { userId } });
      if (!cart) {
        return { ok: false, error: "cart_not_found" };
      }

      const line = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });
      if (!line) {
        return { ok: false, error: "item_not_in_cart" };
      }

      const validation = validateProductQuantity(product, quantity);
      if (!validation.ok) {
        return mapQuantityValidation(validation);
      }

      await tx.cartItem.update({
        where: { id: line.id },
        data: { quantity },
      });

      const items = await loadCartWithItems(tx, cart.id);
      return { ok: true, cart: { ...cart, items } };
    });
  } catch (error) {
    console.error("updateCartItemQuantity:", error);
    throw error;
  }
}

export type RemoveCartItemResult =
  | { ok: true; cart: CartWithItems }
  | { ok: false; error: "cart_not_found" }
  | { ok: false; error: "item_not_in_cart" };

/** Logged-in only. Removes one line; empty cart still returns the Cart with items: []. */
export async function removeCartItemFromCart(
  userId: string,
  productId: string
): Promise<RemoveCartItemResult> {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    return { ok: false, error: "cart_not_found" };
  }

  const line = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
  });
  if (!line) {
    return { ok: false, error: "item_not_in_cart" };
  }

  await prisma.cartItem.delete({ where: { id: line.id } });

  const updated = await getCartForUser(userId);
  return { ok: true, cart: updated! };
}
