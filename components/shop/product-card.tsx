"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import { addToCart } from "@/lib/cart-client";
import { formatInr } from "@/lib/pricing";
import { FALLBACK_IMAGE } from "@/lib/product-image";
import { notifyCartUpdated } from "@/lib/cart-sync";
import { formatCategoryDisplayName } from "@/lib/shop/listing-params";
import { useToast } from "@/components/ui/toast-provider";
import type { ShopProduct } from "./types";

type ProductCardProps = {
  product: ShopProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const displayImageUrl = imageError ? FALLBACK_IMAGE : product.imageUrl;
  const showRating = Number.isFinite(product.rating) && product.rating > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const result = await addToCart(product.id, 1);
    if (result.requiresAuth) {
      showToast(result.message, "error");
      router.push(`/login?next=${encodeURIComponent("/shop")}`);
      setIsAdding(false);
      return;
    }
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) {
      notifyCartUpdated();
      router.refresh();
    }
    setIsAdding(false);
  };

  const categoryLabel = formatCategoryDisplayName(product.category);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-lg">
      <div className="relative h-40 overflow-hidden sm:h-56">
        <Link href={`/shop/${product.id}`} className="block h-full">
          {imageError ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-neutral-100">
              <ImageOff className="h-10 w-10 text-neutral-300" />
              <p className="text-xs font-medium text-neutral-400">Image unavailable</p>
            </div>
          ) : (
            <img
              src={displayImageUrl}
              alt={product.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
              onError={() => setImageError(true)}
            />
          )}
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-md bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
              {product.badge}
            </span>
          ) : null}
        </Link>

        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 via-black/40 to-transparent p-3 opacity-100 transition duration-300 group-hover:translate-y-0 sm:opacity-0 sm:group-hover:opacity-100">
          <button
            type="button"
            disabled={isAdding}
            onClick={(e) => void handleAddToCart(e)}
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdding ? "Adding…" : "Add to cart"}
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-2 p-3 sm:space-y-2.5 sm:p-4">
        <p className="text-xs font-medium text-slate-600">{categoryLabel}</p>
        <Link href={`/shop/${product.id}`} className="block transition-colors hover:text-blue-700">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 sm:min-h-12 sm:text-base">
            {product.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <p className="text-base font-bold text-blue-700 sm:text-lg">
            {formatInr(product.price)}
          </p>
          {product.oldPrice ? (
            <p className="text-xs text-slate-400 line-through sm:text-sm">
              {formatInr(product.oldPrice)}
            </p>
          ) : null}
        </div>
        {showRating ? (
          <p className="text-xs text-slate-500 sm:text-sm">
            Rating: {product.rating.toFixed(1)} / 5
          </p>
        ) : null}
        <Link
          href={`/shop/${product.id}`}
          className="mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg border border-neutral-300 bg-white text-xs font-semibold text-slate-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-800 sm:h-11 sm:text-sm"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
