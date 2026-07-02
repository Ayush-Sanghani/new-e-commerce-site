"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, Heart, ShoppingCart, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { addToCart } from "@/lib/cart-client";
import { notifyCartUpdated } from "@/lib/cart-sync";
import { FALLBACK_IMAGE } from "@/lib/product-image";
import { cn } from "@/lib/utils";
import { isInWishlist, toggleWishlistId } from "@/lib/wishlist-storage";
import { useToast } from "@/components/ui/toast-provider";
import type { HomeProduct } from "./types";

type HomeProductCardProps = {
  product: HomeProduct;
  index?: number;
};

export function HomeProductCard({ product, index = 0 }: HomeProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const href = product.id ? `/shop/${product.id}` : "#";

  useEffect(() => {
    if (product.id) setWishlisted(isInWishlist(product.id));
  }, [product.id]);

  useEffect(() => {
    setImageError(false);
  }, [product.imageUrl]);

  const displayImageUrl = imageError ? FALLBACK_IMAGE : product.imageUrl;
  const showRating =
    product.rating != null && Number.isFinite(product.rating) && product.rating > 0;
  const displayRating = showRating ? product.rating! : 0;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.id) return;
    const added = toggleWishlistId(product.id);
    setWishlisted(added);
    showToast(added ? "Added to wishlist" : "Removed from wishlist", "success");
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.id) return;
    if (product.isPurchasable === false) {
      showToast(product.unavailabilityReason ?? "Product is currently unavailable.", "error");
      return;
    }
    setIsAdding(true);
    const result = await addToCart(product.id, 1);
    if (result.requiresAuth) {
      showToast(result.message, "error");
      router.push(`/login?next=${encodeURIComponent("/home")}`);
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

  const closeQuickView = useCallback(() => setQuickViewOpen(false), []);

  useEffect(() => {
    if (!quickViewOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewOpen, closeQuickView]);

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.35, delay: index * 0.05 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-hover"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-100 sm:aspect-square">
          <Link href={href} className="block h-full w-full">
            <img
              src={displayImageUrl}
              alt={product.title}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
          </Link>

          {(product.discountPercent ?? 0) > 0 ? (
            <span className="absolute left-3 top-3 rounded-lg bg-accent px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{product.discountPercent}%
            </span>
          ) : product.badge ? (
            <span className="absolute left-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              {product.badge}
            </span>
          ) : product.tag ? (
            <span className="absolute left-3 top-3 rounded-lg bg-slate-900/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {product.tag}
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={cn(
              "absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:scale-105",
              wishlisted ? "text-rose-500" : "text-slate-600 hover:text-rose-500"
            )}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </button>

          <div className="absolute inset-x-0 bottom-0 flex translate-y-full gap-2 p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/95 py-2.5 text-xs font-semibold text-slate-800 backdrop-blur-sm transition hover:bg-white"
            >
              <Eye className="h-4 w-4" />
              Quick View
            </button>
            <button
              type="button"
              disabled={isAdding || !product.id || product.isPurchasable === false}
              onClick={(e) => void handleAddToCart(e)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              <ShoppingCart className="h-4 w-4" />
              {isAdding ? "Adding…" : product.isPurchasable === false ? "Unavailable" : "Add to Cart"}
            </button>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          {showRating ? (
            <div className="mb-1.5 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "h-3.5 w-3.5",
                    i < Math.round(displayRating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  )}
                />
              ))}
              <span className="ml-1 text-xs text-slate-500">({displayRating.toFixed(1)})</span>
            </div>
          ) : null}

          <Link href={href}>
            <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-semibold leading-snug text-slate-900 transition hover:text-primary">
              {product.title}
            </h3>
          </Link>

          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="text-xl font-bold text-slate-900">{product.price}</p>
            {product.oldPrice ? (
              <>
                <p className="text-sm text-slate-400 line-through">{product.oldPrice}</p>
                {product.discountPercent ? (
                  <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-bold text-emerald-700">
                    Save {product.discountPercent}%
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          <div className="mt-3 flex gap-2 sm:hidden">
            <button
              type="button"
              disabled={isAdding || !product.id}
              onClick={(e) => void handleAddToCart(e)}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2.5 text-xs font-semibold text-white"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
          </div>
        </div>
      </motion.article>

      {quickViewOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view: ${product.title}`}
          onClick={closeQuickView}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={displayImageUrl}
              alt=""
              className="aspect-video w-full object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900">{product.title}</h3>
              <p className="mt-2 text-2xl font-bold text-primary">{product.price}</p>
              {product.oldPrice ? (
                <p className="text-sm text-slate-400 line-through">{product.oldPrice}</p>
              ) : null}
              <div className="mt-6 flex gap-3">
                <Link
                  href={href}
                  className="flex flex-1 items-center justify-center rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:bg-primary-hover"
                  onClick={closeQuickView}
                >
                  View Details
                </Link>
                <button
                  type="button"
                  disabled={isAdding || !product.id}
                  onClick={(e) => {
                    void handleAddToCart(e);
                    closeQuickView();
                  }}
                  className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-800 hover:border-primary hover:text-primary"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </>
  );
}
