/**
 * Maps API error responses to user-facing messages and action links.
 */

export type ClientErrorLink = {
  label: string;
  href: string;
};

export type ClientErrorKind =
  | "network"
  | "unauthorized"
  | "empty_cart"
  | "insufficient_stock"
  | "minimum_quantity"
  | "not_available"
  | "incomplete_profile"
  | "razorpay_failed"
  | "pending_order_exists"
  | "insufficient_stock_at_capture"
  | "payment_verify_failed"
  | "payment_cancelled"
  | "razorpay_load_failed"
  | "generic";

export type ClientErrorDisplay = {
  kind: ClientErrorKind;
  message: string;
  links: ClientErrorLink[];
  highlightProductId?: string;
  orderId?: string;
  orderNumber?: string;
};

export type ApiJsonBody = {
  success?: boolean;
  message?: string;
  data?: Record<string, unknown> | null;
};

const SHOP_LINK: ClientErrorLink = { label: "Continue shopping", href: "/shop" };
const ACCOUNT_LINK: ClientErrorLink = { label: "Update address in Account", href: "/account" };
const CONTACT_LINK: ClientErrorLink = { label: "Contact support", href: "/contact" };

function productLink(productId: string, label = "View product"): ClientErrorLink {
  return { label, href: `/shop/${productId}` };
}

function orderLink(orderId: string, label = "View order"): ClientErrorLink {
  return { label, href: `/orders/${orderId}` };
}

function inferCartItemCode(
  status: number,
  body: ApiJsonBody,
  productId?: string
): string | undefined {
  const code = body.data?.code;
  if (typeof code === "string") return code;

  const message = body.message ?? "";
  if (message.includes("Maximum available") || body.data?.maxStock != null) {
    return "insufficient_stock";
  }
  if (message.includes("Minimum order quantity") || body.data?.minimumOrderQuantity != null) {
    return "minimum_quantity";
  }
  if (message.includes("cannot be added to cart") || body.data?.code === "not_available") {
    return "not_available";
  }
  if (status === 404 && message.includes("Product not found")) return "product_not_found";
  if (status === 401) return "unauthorized";
  return undefined;
}

function inferCheckoutCode(status: number, body: ApiJsonBody): string | undefined {
  const code = body.data?.code;
  if (typeof code === "string") return code;
  if (status === 401) return "unauthorized";
  return undefined;
}

function inferVerifyCode(body: ApiJsonBody): string | undefined {
  const code = body.data?.code;
  if (typeof code === "string") return code;
  return undefined;
}

type CartItemLookup = { productId: string; title: string };

function titleForProduct(
  productId: string | undefined,
  cartItems?: CartItemLookup[]
): string | undefined {
  if (!productId || !cartItems) return undefined;
  return cartItems.find((i) => i.productId === productId)?.title;
}

export function resolveIncompleteProfileError(): ClientErrorDisplay {
  return {
    kind: "incomplete_profile",
    message: "Add your name and full shipping address in Account before checkout.",
    links: [ACCOUNT_LINK],
  };
}

export function resolveNetworkError(fallback = "Network error. Please try again."): ClientErrorDisplay {
  return {
    kind: "network",
    message: fallback,
    links: [SHOP_LINK, CONTACT_LINK],
  };
}

export function resolveRazorpayLoadError(): ClientErrorDisplay {
  return {
    kind: "razorpay_load_failed",
    message: "Unable to open the payment window. Check your connection and try again.",
    links: [CONTACT_LINK],
  };
}

export function resolvePaymentCancelledError(orderId?: string): ClientErrorDisplay {
  const links: ClientErrorLink[] = [];
  if (orderId) links.push(orderLink(orderId, "Complete payment — view order"));
  return {
    kind: "payment_cancelled",
    message: "Payment was cancelled. You can try again when ready.",
    links,
    orderId,
  };
}

export function resolveCartItemPatchError(
  status: number,
  body: ApiJsonBody,
  productId: string,
  productTitle?: string
): ClientErrorDisplay {
  const code = inferCartItemCode(status, body, productId);
  const title = productTitle ?? "This item";
  const apiMessage = body.message?.trim();

  if (code === "unauthorized" || status === 401) {
    return {
      kind: "unauthorized",
      message: apiMessage || "Sign in to update your cart.",
      links: [{ label: "Log in", href: "/login" }],
      highlightProductId: productId,
    };
  }

  if (code === "insufficient_stock") {
    const max =
      typeof body.data?.maxStock === "number" ? body.data.maxStock : undefined;
    return {
      kind: "insufficient_stock",
      message:
        apiMessage ||
        (max != null
          ? `Not enough stock for ${title}. Maximum available: ${max}.`
          : `Not enough stock for ${title}. Lower the quantity or remove the item.`),
      links: [productLink(productId), SHOP_LINK],
      highlightProductId: productId,
    };
  }

  if (code === "minimum_quantity") {
    const min =
      typeof body.data?.minimumOrderQuantity === "number"
        ? body.data.minimumOrderQuantity
        : undefined;
    return {
      kind: "minimum_quantity",
      message:
        apiMessage ||
        (min != null
          ? `${title} requires a minimum quantity of ${min}.`
          : `${title} is below the minimum order quantity.`),
      links: [productLink(productId)],
      highlightProductId: productId,
    };
  }

  if (code === "not_available") {
    return {
      kind: "not_available",
      message: apiMessage || `${title} is currently unavailable.`,
      links: [productLink(productId), SHOP_LINK],
      highlightProductId: productId,
    };
  }

  return {
    kind: "generic",
    message: apiMessage || "Unable to update cart item.",
    links: [productLink(productId), SHOP_LINK],
    highlightProductId: productId,
  };
}

export function resolveCheckoutError(
  status: number,
  body: ApiJsonBody,
  cartItems?: CartItemLookup[]
): ClientErrorDisplay {
  const code = inferCheckoutCode(status, body);
  const apiMessage = body.message?.trim();
  const data = body.data ?? {};
  const productId = typeof data.productId === "string" ? data.productId : undefined;
  const productTitle = titleForProduct(productId, cartItems);
  const orderId = typeof data.orderId === "string" ? data.orderId : undefined;
  const orderNumber = typeof data.orderNumber === "string" ? data.orderNumber : undefined;

  if (code === "unauthorized" || status === 401) {
    return {
      kind: "unauthorized",
      message: apiMessage || "Sign in to checkout.",
      links: [{ label: "Log in", href: "/login" }],
    };
  }

  if (code === "empty_cart") {
    return {
      kind: "empty_cart",
      message: apiMessage || "Your cart is empty. Add items before checkout.",
      links: [SHOP_LINK],
    };
  }

  if (code === "insufficient_stock") {
    const max = typeof data.max === "number" ? data.max : undefined;
    const name = productTitle ?? "An item in your cart";
    return {
      kind: "insufficient_stock",
      message:
        apiMessage ||
        (max != null
          ? `Not enough stock for ${name}. Only ${max} available — lower the quantity in your cart.`
          : `Not enough stock for ${name}. Lower the quantity in your cart.`),
      links: productId
        ? [productLink(productId), SHOP_LINK]
        : [SHOP_LINK],
      highlightProductId: productId,
    };
  }

  if (code === "minimum_quantity") {
    const min = typeof data.min === "number" ? data.min : undefined;
    const name = productTitle ?? "An item in your cart";
    return {
      kind: "minimum_quantity",
      message:
        apiMessage ||
        (min != null
          ? `${name} requires a minimum quantity of ${min}.`
          : `${name} is below the minimum order quantity.`),
      links: productId ? [productLink(productId)] : [SHOP_LINK],
      highlightProductId: productId,
    };
  }

  if (code === "razorpay_failed") {
    const orderRef = orderNumber ? ` (${orderNumber})` : "";
    return {
      kind: "razorpay_failed",
      message:
        apiMessage ||
        `Your order${orderRef} was created but payment setup failed. Open the order page to try paying again.`,
      links: orderId
        ? [orderLink(orderId, "Try payment again"), CONTACT_LINK]
        : [CONTACT_LINK],
      orderId,
      orderNumber,
    };
  }

  if (code === "pending_order_exists") {
    return {
      kind: "pending_order_exists",
      message:
        apiMessage ||
        "You already have a pending order. Complete payment, view the order, or cancel it before starting a new checkout.",
      links: [
        ...(orderId ? [orderLink(orderId, "View pending order")] : []),
        { label: "All orders", href: "/orders" },
      ],
      orderId,
      orderNumber,
    };
  }

  if (orderId) {
    return {
      kind: "generic",
      message: apiMessage || "Unable to create order.",
      links: [orderLink(orderId), SHOP_LINK, CONTACT_LINK],
      orderId,
    };
  }

  return {
    kind: "generic",
    message: apiMessage || "Unable to start checkout.",
    links: [SHOP_LINK, CONTACT_LINK],
  };
}

export function resolvePaymentVerifyError(
  status: number,
  body: ApiJsonBody,
  orderId: string,
  orderNumber?: string
): ClientErrorDisplay {
  const code = inferVerifyCode(body);
  const apiMessage = body.message?.trim();
  const orderRef = orderNumber ?? "your order";

  if (code === "insufficient_stock_at_capture") {
    return {
      kind: "insufficient_stock_at_capture",
      message:
        apiMessage ||
        `Payment was received but items are no longer in stock. Contact support with order ${orderRef} — we will help resolve this.`,
      links: [
        orderLink(orderId, "View order"),
        CONTACT_LINK,
      ],
      orderId,
      orderNumber,
    };
  }

  if (code === "order_not_found") {
    return {
      kind: "payment_verify_failed",
      message: apiMessage || "Order not found.",
      links: [{ label: "My orders", href: "/orders" }, CONTACT_LINK],
      orderId,
    };
  }

  return {
    kind: "payment_verify_failed",
    message: apiMessage || "Payment verification failed. Try again from your order page.",
    links: [orderLink(orderId, "View order — try again"), CONTACT_LINK],
    orderId,
    orderNumber,
  };
}
