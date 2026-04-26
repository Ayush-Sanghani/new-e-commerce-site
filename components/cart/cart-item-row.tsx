import Link from "next/link";
import { Card } from "@/components/home/ui/card";
import type { CartItem } from "./types";

type CartItemRowProps = {
  item: CartItem;
  isBusy?: boolean;
  onDecrease: (productId: string) => void;
  onIncrease: (productId: string) => void;
  onRemove: (productId: string) => void;
};

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function CartItemRow({ item, isBusy, onDecrease, onIncrease, onRemove }: CartItemRowProps) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <Card as="article" className="p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href={`/shop/${item.productId}`} className="shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-28 w-full rounded-lg object-cover sm:w-32"
            loading="lazy"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p>
            <Link href={`/shop/${item.productId}`}>
              <h3 className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-blue-700">
                {item.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500">SKU: {item.sku}</p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-700">
              Unit Price: <span className="font-semibold">{formatMoney(item.unitPrice)}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDecrease(item.productId)}
                disabled={isBusy}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Decrease quantity of ${item.title}`}
              >
                -
              </button>
              <span className="min-w-7 text-center text-sm font-semibold text-slate-800">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onIncrease(item.productId)}
                disabled={isBusy}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Increase quantity of ${item.title}`}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-700">Line Total: {formatMoney(lineTotal)}</p>
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              disabled={isBusy}
              className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isBusy ? "Updating..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
