"use client";

export const CART_UPDATED_KEY = "cart:lastUpdated";

export function notifyCartUpdated() {
  try {
    localStorage.setItem(CART_UPDATED_KEY, String(Date.now()));
  } catch {
    // ignore storage errors in unsupported/private environments
  }
}
