"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CART_UPDATED_KEY, notifyCartUpdated } from "@/lib/cart-sync";
import { mapApiCartToUiItems } from "./mappers";
import { CartEmptyState } from "./cart-empty-state";
import { CartItemRow } from "./cart-item-row";
import { CartSummaryCard } from "./cart-summary-card";
import type { CartItem, CartSummary } from "./types";

type CartPageViewProps = {
  initialItems: CartItem[];
};

function computeSummary(items: CartItem[]): CartSummary {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = subtotal >= 1000 || subtotal === 0 ? 0 : 40;
  const discount = subtotal > 2500 ? 100 : 0;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + shipping + tax - discount;
  return { subtotal, shipping, discount, tax, total };
}

export function CartPageView({ initialItems }: CartPageViewProps) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [isLoading, setIsLoading] = useState(true);
  const [busyProductIds, setBusyProductIds] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const summary = useMemo(() => computeSummary(items), [items]);

  const reloadCart = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/cart", { method: "GET" });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { cart?: unknown };
      };
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to refresh cart.");
        return;
      }
      setItems(mapApiCartToUiItems(data.data?.cart as Parameters<typeof mapApiCartToUiItems>[0]));
    } catch {
      setErrorMessage("Network error while refreshing cart.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void reloadCart();
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
    setErrorMessage(null);
    setItemBusy(productId, true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { cart?: unknown };
      };
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to update cart item.");
        return;
      }
      setItems(mapApiCartToUiItems(data.data?.cart as Parameters<typeof mapApiCartToUiItems>[0]));
      notifyCartUpdated();
    } catch {
      setErrorMessage("Network error while updating cart.");
    } finally {
      setItemBusy(productId, false);
    }
  };

  const removeItem = async (productId: string) => {
    setErrorMessage(null);
    setItemBusy(productId, true);
    try {
      const res = await fetch(`/api/cart/items?productId=${encodeURIComponent(productId)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as {
        success?: boolean;
        message?: string;
        data?: { cart?: unknown };
      };
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Unable to remove cart item.");
        return;
      }
      setItems(mapApiCartToUiItems(data.data?.cart as Parameters<typeof mapApiCartToUiItems>[0]));
      notifyCartUpdated();
    } catch {
      setErrorMessage("Network error while removing cart item.");
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

  const loadRazorpayScript = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if ((window as { Razorpay?: unknown }).Razorpay) return true;

    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const startCheckout = async () => {
    if (isCheckingOut) return;

    setErrorMessage(null);
    setIsCheckingOut(true);

    try {
      const createRes = await fetch("/api/orders", { method: "POST" });
      const createData = (await createRes.json()) as {
        success?: boolean;
        message?: string;
        data?: {
          orderId: string;
          amount: number;
          currency: string;
          razorpayOrderId: string;
          keyId: string;
        };
      };

      if (!createRes.ok || !createData.success || !createData.data) {
        setErrorMessage(createData.message || "Unable to create order.");
        return;
      }

      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        setErrorMessage("Unable to load Razorpay checkout.");
        return;
      }

      const { orderId, amount, currency, razorpayOrderId, keyId } = createData.data;

      const RazorpayCtor = (window as { Razorpay?: new (options: unknown) => { open: () => void } }).Razorpay;
      if (!RazorpayCtor) {
        setErrorMessage("Razorpay SDK is not available.");
        return;
      }

      const rzp = new RazorpayCtor({
        key: keyId,
        amount,
        currency,
        order_id: razorpayOrderId,
        name: "DummyMart",
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch(`/api/orders/${orderId}/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = (await verifyRes.json()) as {
            success?: boolean;
            message?: string;
          };

          if (!verifyRes.ok || !verifyData.success) {
            setErrorMessage(verifyData.message || "Payment verification failed.");
            return;
          }

          await reloadCart();
          notifyCartUpdated();
          alert("Payment successful and order confirmed.");
        },
      });

      rzp.open();
    } catch {
      setErrorMessage("Network error while starting checkout.");
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

      {!isLoading && errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </section>
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
    </main>
  );
}
