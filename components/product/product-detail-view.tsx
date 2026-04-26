"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HomeButton } from "@/components/home/ui/button";
import { Card } from "@/components/home/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { addToCart } from "@/lib/cart-client";
import { formatInrFromUsd } from "@/lib/currency";
import { notifyCartUpdated } from "@/lib/cart-sync";
import type { ProductDetail, RelatedProduct } from "./types";

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: RelatedProduct[];
};

function stars(rating: number) {
  const fullStars = Math.round(rating);
  return "★★★★★".slice(0, fullStars).padEnd(5, "☆");
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, Math.max(product.stock, 1)));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  const handleAddToCart = async () => {
    if (product.stock <= 0) {
      showToast("Product is currently out of stock.", "error");
      return;
    }

    setIsAdding(true);
    const result = await addToCart(product.id, quantity);
    if (result.requiresAuth) {
      showToast(result.message, "error");
      router.push(`/login?next=${encodeURIComponent(`/shop/${product.id}`)}`);
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

  const [addingRelatedId, setAddingRelatedId] = useState<string | null>(null);

  const handleAddRelatedToCart = async (productId: string) => {
    setAddingRelatedId(productId);
    const result = await addToCart(productId, 1);
    if (result.requiresAuth) {
      showToast(result.message, "error");
      router.push(`/login?next=${encodeURIComponent(`/shop/${product.id}`)}`);
      setAddingRelatedId(null);
      return;
    }
    showToast(result.message, result.success ? "success" : "error");
    if (result.success) {
      notifyCartUpdated();
      router.refresh();
    }
    setAddingRelatedId(null);
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
          / <span className="text-slate-700">{product.title}</span>
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {product.title}
        </h1>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden p-4 sm:p-5">
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-[380px] w-full rounded-xl object-cover"
          />
          <div className="mt-3 grid grid-cols-3 gap-3">
            {product.images.slice(1).map((image, idx) => (
              <img
                key={`${product.id}-thumb-${idx}`}
                src={image}
                alt={`${product.title} thumbnail ${idx + 1}`}
                className="h-24 w-full rounded-lg object-cover"
                loading="lazy"
              />
            ))}
          </div>
        </Card>

        <Card as="section" className="space-y-5 p-5 sm:p-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              {product.category}
            </p>
            <h2 className="text-2xl font-bold text-slate-900">{product.title}</h2>
            <p className="text-sm text-slate-600">
              {stars(product.rating)} {product.rating.toFixed(1)} ({product.reviewCount} reviews)
            </p>
          </div>

          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-blue-700">{formatInrFromUsd(product.price)}</p>
            {product.oldPrice ? (
              <p className="pb-1 text-sm text-slate-400 line-through">
                {formatInrFromUsd(product.oldPrice)}
              </p>
            ) : null}
          </div>

          <p className="text-sm leading-6 text-slate-600">{product.description}</p>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-neutral-50 p-4 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Brand:</span> {product.brand}
            </p>
            <p>
              <span className="font-semibold">SKU:</span> {product.sku}
            </p>
            <p>
              <span className="font-semibold">Stock:</span>{" "}
              {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
            </p>
            <p>
              <span className="font-semibold">Category:</span> {product.category}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">Highlights</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
              {product.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
            {product.deliveryInfo.map((item) => (
              <p key={item}>{item}</p>
            ))}
            <p className="font-semibold">Warranty: {product.warranty}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= 1 || isAdding}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={increaseQuantity}
                disabled={isAdding || product.stock <= 0 || quantity >= Math.max(product.stock, 1)}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <HomeButton
                variant="dark"
                className="w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAdding || product.stock <= 0}
                onClick={handleAddToCart}
              >
                {isAdding ? "Adding..." : "Add to cart"}
              </HomeButton>
              <Link
                href="/cart"
                className="inline-flex w-full items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
              >
                Go to cart
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-neutral-50"
            >
              Continue shopping
            </Link>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card as="section" className="lg:col-span-2 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900">Technical Specifications</h3>
          <div className="mt-4 overflow-hidden rounded-lg border border-neutral-200">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {product.specs.map((spec) => (
                  <tr key={spec.label} className="border-b border-neutral-200 last:border-b-0">
                    <td className="bg-neutral-50 px-4 py-3 font-semibold text-slate-700">{spec.label}</td>
                    <td className="px-4 py-3 text-slate-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card as="section" className="space-y-3 p-5 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
          <p className="text-sm text-slate-600">
            Have questions about compatibility, delivery, or returns?
          </p>
          <Link
            href="#"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Contact Support
          </Link>
          <p className="text-xs text-slate-500">Support is available Mon-Sat, 9 AM to 8 PM.</p>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">Related Products</h3>
          <Link href="/shop" className="text-sm font-semibold text-blue-700 hover:text-blue-800">
            View all
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {relatedProducts.map((item) => (
            <Card key={item.id} as="article" className="overflow-hidden rounded-xl">
              <Link href={`/shop/${item.id}`} className="block">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-48 w-full object-cover"
                  loading="lazy"
                />
              </Link>
              <div className="space-y-2 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.category}</p>
                <Link href={`/shop/${item.id}`} className="block">
                  <h4 className="line-clamp-2 text-base font-semibold text-slate-900 hover:text-blue-700">
                    {item.title}
                  </h4>
                </Link>
                <p className="text-lg font-bold text-blue-700">{formatInrFromUsd(item.price)}</p>
                <HomeButton
                  variant="dark"
                  className="w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={addingRelatedId === item.id}
                  onClick={() => handleAddRelatedToCart(item.id)}
                >
                  {addingRelatedId === item.id ? "Adding..." : "Add to cart"}
                </HomeButton>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
