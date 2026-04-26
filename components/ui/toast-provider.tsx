"use client";

import { createContext, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error";

type ToastState = {
  message: string;
  type: ToastType;
} | null;

type ToastContextValue = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState>(null);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast: (message, type = "success") => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 2200);
      },
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-4 z-[100] -translate-x-1/2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-lg">
          <div
            className={
              toast.type === "success"
                ? "rounded-md bg-emerald-600 px-3 py-2"
                : "rounded-md bg-red-600 px-3 py-2"
            }
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
