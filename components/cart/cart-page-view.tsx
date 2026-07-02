"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  buildShippingAddressFromProfile,
  isShippingAddressComplete,
  type MeProfileFields,
} from "@/lib/checkout-shipping";
import type { CartPayload } from "@/lib/services/cart";
import { CART_UPDATED_KEY, notifyCartUpdated } from "@/lib/cart-sync";
import {
  resolveCartItemPatchError,
  resolveCheckoutError,
  resolveIncompleteProfileError,
  resolveNetworkError,
  resolvePaymentCancelledError,
  type ApiJsonBody,
  type ClientErrorDisplay,
} from "@/lib/client-api-errors";
import { openRazorpayCheckout } from "@/lib/razorpay-client";
import { isPaymentsEnabled } from "@/lib/payments-config";
import { OrderCancelButton } from "@/components/orders/order-cancel-button";
import { PaymentsComingSoonModal } from "@/components/payments/payments-coming-soon-modal";
import { mapApiCartPayload } from "./mappers";
import { CartEmptyState } from "./cart-empty-state";
import { CartErrorBanner } from "./cart-error-banner";
import { CartItemRow } from "./cart-item-row";
import { CartSummaryCard } from "./cart-summary-card";
import type { CartItem, CartSummary } from "./types";

type CartPageViewProps = {
  initialItems: CartItem[];
  initialSummary: CartSummary;
};

type CartApiResponse = ApiJsonBody & {
  data?: { cart?: CartPayload | null };
};

function applyCartResponse(
  cart: CartPayload | null | undefined,
  setItems: (items: CartItem[]) => void,
  setSummary: (summary: CartSummary) => void
) {
  const mapped = mapApiCartPayload(cart);
  setItems(mapped.items);
  setSummary(mapped.summary);
}

function cartItemLookups(items: CartItem[]) {
  return items.map((item) => ({ productId: item.productId, title: item.title }));
}

type MeApiResponse = {
  success?: boolean;
  message?: string;
  data?: {
    user: { name: string | null };
    profile: MeProfileFields | null;
  };
};

export function CartPageView({ initialItems, initialSummary }: CartPageViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [summary, setSummary] = useState<CartSummary>(initialSummary);
  const [isLoading, setIsLoading] = useState(false);
  const [busyProductIds, setBusyProductIds] = useState<string[]>([]);
  const [errorDisplay, setErrorDisplay] = useState<ClientErrorDisplay | null>(null);
  const [highlightProductId, setHighlightProductId] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isPendingOrderConflict, setIsPendingOrderConflict] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [comingSoonOrder, setComingSoonOrder] = useState<{
    orderId: string;
    orderNumber?: string;
  } | null>(null);

  const clearErrors = () => {
    setErrorDisplay(null);
    setHighlightProductId(null);
  };

  const reloadCart = async () => {
    clearErrors();
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", { method: "GET" });
      const data = (await res.json()) as CartApiResponse;
      if (!res.ok || !data.success) {
        setErrorDisplay(
          resolveCheckoutError(res.status, data, cartItemLookups(items))
        );
        return;
      }
      applyCartResponse(data.data?.cart, setItems, setSummary);
    } catch {
      setErrorDisplay(resolveNetworkError("Network error while refreshing cart."));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === CART_UPDATED_KEY) {
        void reloadCart();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setItemBusy = (productId: string, busy: boolean) => {
    setBusyProductIds((prev) =>
      busy ? (prev.includes(productId) ? prev : [...prev, productId]) : prev.filter((id) => id !== productId)
    );
  };

  const patchQuantity = async (productId: string, quantity: number) => {
    clearErrors();
    setItemBusy(productId, true);
    const productTitle = items.find((i) => i.productId === productId)?.title;
    try {
      const res = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await res.json()) as CartApiResponse;
      if (!res.ok || !data.success) {
        const display = resolveCartItemPatchError(res.status, data, productId, productTitle);
        setErrorDisplay(display);
        setHighlightProductId(display.highlightProductId ?? productId);
        return;
      }
      applyCartResponse(data.data?.cart, setItems, setSummary);
      notifyCartUpdated();
    } catch {
      setErrorDisplay(resolveNetworkError("Network error while updating cart."));
      setHighlightProductId(productId);
    } finally {
      setItemBusy(productId, false);
    }
  };

  const removeItem = async (productId: string) => {
    clearErrors();
    setItemBusy(productId, true);
    try {
      const res = await fetch(`/api/cart/items?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as CartApiResponse;
      if (!res.ok || !data.success) {
        setErrorDisplay(resolveCartItemPatchError(res.status, data, productId));
        return;
      }
      applyCartResponse(data.data?.cart, setItems, setSummary);
      notifyCartUpdated();
    } catch {
      setErrorDisplay(resolveNetworkError("Network error while removing cart item."));
    } finally {
      setItemBusy(productId, false);
    }
  };

  const increaseQuantity = async (productId: string) => {
    const current = items.find((item) => item.productId === productId);
    if (!current) return;
    if (current.quantity >= current.maxQuantity) return;
    await patchQuantity(productId, current.quantity + 1);
  };

  const decreaseQuantity = async (productId: string) => {
    const current = items.find((item) => item.productId === productId);
    if (!current) return;
    if (current.quantity <= 1) return;
    await patchQuantity(productId, current.quantity - 1);
  };

  const openRazorpayCheckoutForOrder = async (checkout: {
    orderId: string;
    orderNumber?: string;
    amount: number;
    currency: string;
    razorpayOrderId: string;
    keyId: string;
  }) => {
    await openRazorpayCheckout({
      keyId: checkout.keyId,
      amount: checkout.amount,
      currency: checkout.currency,
      razorpayOrderId: checkout.razorpayOrderId,
      orderId: checkout.orderId,
      orderNumber: checkout.orderNumber,
      onSuccess: async () => {
        await reloadCart();
        notifyCartUpdated();
        setPendingOrderId(null);
        setIsPendingOrderConflict(false);
        router.push(`/orders/${checkout.orderId}?paid=1`);
      },
      onError: (display) => {
        setErrorDisplay(display);
        setPendingOrderId(checkout.orderId);
        if (display.highlightProductId) {
          setHighlightProductId(display.highlightProductId);
        }
      },
      onDismiss: () => {
        setErrorDisplay(resolvePaymentCancelledError(checkout.orderId));
        setPendingOrderId(checkout.orderId);
      },
    });
  };

  const showPaymentsComingSoon = (orderId: string, orderNumber?: string) => {
    setComingSoonOrder({ orderId, orderNumber });
  };

  const startCheckout = async () => {
    if (isCheckingOut) return;

    clearErrors();
    setPendingOrderId(null);
    setIsPendingOrderConflict(false);
    setIsCheckingOut(true);

    try {
      if (items.length === 0) {
        setErrorDisplay(resolveCheckoutError(400, { data: { code: "empty_cart" } }));
        return;
      }

      const meRes = await fetch("/api/me", { method: "GET" });
      const meData = (await meRes.json()) as MeApiResponse;

      if (!meRes.ok || !meData.success || !meData.data) {
        setErrorDisplay(
          resolveCheckoutError(meRes.status, {
            message: meData.message || "Unable to load your profile for checkout.",
          })
        );
        return;
      }

      const { user, profile } = meData.data;
      if (!isShippingAddressComplete(user.name, profile)) {
        setErrorDisplay(resolveIncompleteProfileError());
        return;
      }

      const shippingAddress = buildShippingAddressFromProfile(user.name!, profile!);

      const createRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress }),
      });

      const createData = (await createRes.json()) as ApiJsonBody;
      const lookups = cartItemLookups(items);

      if (createRes.status === 409 && createData.data?.code === "pending_order_exists") {
        const pending = createData.data;
        const orderId = typeof pending.orderId === "string" ? pending.orderId : null;
        setPendingOrderId(orderId);
        setIsPendingOrderConflict(true);
        setErrorDisplay(resolveCheckoutError(createRes.status, createData, lookups));

        if (
          isPaymentsEnabled() &&
          orderId &&
          typeof pending.amount === "number" &&
          typeof pending.currency === "string" &&
          typeof pending.razorpayOrderId === "string" &&
          typeof pending.keyId === "string"
        ) {
          await openRazorpayCheckoutForOrder({
            orderId,
            orderNumber:
              typeof pending.orderNumber === "string" ? pending.orderNumber : undefined,
            amount: pending.amount,
            currency: pending.currency,
            razorpayOrderId: pending.razorpayOrderId,
            keyId: pending.keyId,
          });
        } else if (orderId && !isPaymentsEnabled()) {
          showPaymentsComingSoon(
            orderId,
            typeof pending.orderNumber === "string" ? pending.orderNumber : undefined
          );
        }
        return;
      }

      if (!createRes.ok || !createData.success || !createData.data) {
        const display = resolveCheckoutError(createRes.status, createData, lookups);
        setErrorDisplay(display);
        if (display.orderId) setPendingOrderId(display.orderId);
        if (display.highlightProductId) setHighlightProductId(display.highlightProductId);
        return;
      }

      const payload = createData.data as {
        orderId: string;
        orderNumber?: string;
        amount?: number;
        currency: string;
        razorpayOrderId?: string;
        keyId?: string;
        paymentsEnabled?: boolean;
      };

      setPendingOrderId(payload.orderId);

      if (!isPaymentsEnabled() || payload.paymentsEnabled === false) {
        showPaymentsComingSoon(payload.orderId, payload.orderNumber);
        return;
      }

      if (
        typeof payload.amount !== "number" ||
        typeof payload.razorpayOrderId !== "string" ||
        typeof payload.keyId !== "string"
      ) {
        setErrorDisplay(
          resolveCheckoutError(502, {
            message: "Order was saved but payment setup failed. View your order or try again.",
            data: { orderId: payload.orderId },
          })
        );
        return;
      }

      await openRazorpayCheckoutForOrder({
        orderId: payload.orderId,
        orderNumber: payload.orderNumber,
        amount: payload.amount,
        currency: payload.currency,
        razorpayOrderId: payload.razorpayOrderId,
        keyId: payload.keyId,
      });
    } catch {
      setErrorDisplay(resolveNetworkError("Network error while starting checkout."));
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <p className="text-sm text-slate-500">
          <Link href="/home" className="hover:text-slate-800">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/shop" className="hover:text-slate-800">
            Shop
          </Link>{" "}
          / <span className="text-slate-700">Cart</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Your Cart</h1>
        <p className="mt-2 text-sm text-slate-500">
          Review products, update quantities, and proceed to checkout.
        </p>
      </section>

      {isLoading ? (
        <section className="rounded-2xl border border-neutral-200 bg-white p-10">
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-neutral-300 border-t-blue-600" />
            <p className="text-sm font-medium text-slate-600">Loading your cart...</p>
          </div>
        </section>
      ) : null}

      {!isLoading && errorDisplay ? (
        <CartErrorBanner display={errorDisplay}>
          {isPendingOrderConflict && pendingOrderId ? (
            <OrderCancelButton
              orderId={pendingOrderId}
              redirectTo={null}
              label="Cancel order"
              className="max-w-xs"
              onSuccess={() => {
                clearErrors();
                setPendingOrderId(null);
                setIsPendingOrderConflict(false);
                void reloadCart();
              }}
            />
          ) : null}
        </CartErrorBanner>
      ) : null}

      {!isLoading && items.length === 0 ? <CartEmptyState /> : null}

      {!isLoading && items.length > 0 ? (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                isBusy={busyProductIds.includes(item.productId)}
                highlighted={highlightProductId === item.productId}
                onDecrease={decreaseQuantity}
                onIncrease={increaseQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          <CartSummaryCard
            summary={summary}
            disabledCheckout={items.length === 0 || isCheckingOut}
            onCheckout={startCheckout}
            checkoutLabel={isCheckingOut ? "Starting checkout..." : "Proceed to Checkout"}
          />
        </section>
      ) : null}

      <PaymentsComingSoonModal
        open={comingSoonOrder !== null}
        onClose={() => setComingSoonOrder(null)}
        orderId={comingSoonOrder?.orderId}
        orderNumber={comingSoonOrder?.orderNumber}
      />
    </main>
  );
}
