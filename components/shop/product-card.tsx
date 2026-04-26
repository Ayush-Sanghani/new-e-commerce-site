"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/home/ui/card";
import { HomeButton } from "@/components/home/ui/button";
import { addToCart } from "@/lib/cart-client";
import { formatInrFromUsd } from "@/lib/currency";
import { notifyCartUpdated } from "@/lib/cart-sync";
import { useToast } from "@/components/ui/toast-provider";
import type { ShopProduct } from "./types";

type ProductCardProps = {
  product: ShopProduct;
};

function formatCategory(category: string) {
  return category.replaceAll("-", " ");
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const handleAddToCart = async () => {
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

  return (
    <Card as="article" className="relative overflow-hidden rounded-xl">
      <Link href={`/shop/${product.id}`} className="relative block">
        <img
          src={product.imageUrl}
          alt={product.title}
          className="h-40 w-full object-cover sm:h-56"
          loading="lazy"
        />
        {product.badge ? (
          <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
            {product.badge}
          </span>
        ) : null}
      </Link>

      <div className="space-y-2 p-3 sm:space-y-3 sm:p-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
          {formatCategory(product.category)}
        </p>
        <Link href={`/shop/${product.id}`} className="block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-slate-900 hover:text-blue-700 sm:min-h-12 sm:text-base">
            {product.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <p className="text-base font-bold text-blue-700 sm:text-lg">
            {formatInrFromUsd(product.price)}
          </p>
          {product.oldPrice ? (
            <p className="text-xs text-slate-400 line-through sm:text-sm">
              {formatInrFromUsd(product.oldPrice)}
            </p>
          ) : null}
        </div>
        <p className="text-xs text-slate-500 sm:text-sm">Rating: {(Number.isFinite(product.rating) ? product.rating : 0).toFixed(1)} / 5</p>
        <div className="grid grid-cols-2 gap-2">
          <HomeButton
            variant="dark"
            className="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-lg py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:text-sm"
            disabled={isAdding}
            onClick={handleAddToCart}
          >
            {isAdding ? "Adding..." : "Add to cart"}
          </HomeButton>
          <Link
            href={`/shop/${product.id}`}
            className="inline-flex h-10 w-full cursor-pointer items-center justify-center whitespace-nowrap rounded-lg border border-blue-900 px-2 py-2 text-xs font-semibold text-blue-900 transition hover:bg-blue-50 sm:h-11 sm:px-3 sm:text-sm"
          >
            View details
          </Link>
        </div>
      </div>
    </Card>
  );
}
