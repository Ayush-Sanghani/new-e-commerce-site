import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/home/ui/card";
import { formatInr } from "@/lib/pricing";
import type { CartItem } from "./types";

type CartItemRowProps = {
  item: CartItem;
  isBusy?: boolean;
  highlighted?: boolean;
  onDecrease: (productId: string) => void;
  onIncrease: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function CartItemRow({
  item,
  isBusy,
  highlighted,
  onDecrease,
  onIncrease,
  onRemove,
}: CartItemRowProps) {
  const onSale = item.discountPercentage > 0 && item.listPrice > item.unitPrice;

  return (
    <Card
      as="article"
      className={`p-4 sm:p-5 ${highlighted ? "ring-2 ring-red-300 bg-red-50/40" : ""}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row">
        <Link href={`/shop/${item.productId}`} className="shrink-0">
          <img
            src={item.imageUrl}
            alt={item.title}
            className="h-36 w-full rounded-xl object-cover sm:h-40 sm:w-44"
            loading="lazy"
          />
        </Link>

        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <Link href={`/shop/${item.productId}`}>
              <h3 className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-blue-700">
                {item.title}
              </h3>
            </Link>
            <p className="text-xs text-slate-500">SKU: {item.sku}</p>
            {onSale ? (
              <p className="mt-1 text-xs font-medium text-emerald-700">
                {Math.round(item.discountPercentage)}% off
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-700">
              <span className="text-slate-500">Unit: </span>
              <span className="font-semibold">{formatInr(item.unitPrice)}</span>
              {onSale ? (
                <span className="ml-2 text-slate-400 line-through">{formatInr(item.listPrice)}</span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onDecrease(item.productId)}
                disabled={isBusy || item.quantity <= 1}
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
                disabled={isBusy || item.quantity >= item.maxQuantity}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Increase quantity of ${item.title}`}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-blue-700">
              Line total: {formatInr(item.lineTotal)}
              {onSale ? (
                <span className="ml-2 text-xs font-normal text-slate-400 line-through">
                  {formatInr(item.listLineTotal)}
                </span>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {isBusy ? "Updating..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
