"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck, Shield, Package, Clock, Phone, FileText, CheckCircle2 } from "lucide-react";
import { HomeButton } from "@/components/home/ui/button";
import { Card } from "@/components/home/ui/card";
import { useToast } from "@/components/ui/toast-provider";
import { addToCart } from "@/lib/cart-client";
import { formatMoney } from "@/lib/money";
import { notifyCartUpdated } from "@/lib/cart-sync";
import type { ProductDetail, RelatedProduct } from "./types";

type ProductDetailViewProps = {
  product: ProductDetail;
  relatedProducts: RelatedProduct[];
  currencyCode?: string;
  currencySymbol?: string;
};



function getHighlightIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("ship") || lower.includes("delivery")) {
    return <Truck className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />;
  }
  if (lower.includes("return")) {
    return <Shield className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />;
  }
  if (lower.includes("stock") || lower.includes("status") || lower.includes("order") || lower.includes("unit")) {
    return <Package className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />;
  }
  return <Clock className="mt-0.5 h-4 w-4 shrink-0 text-orange-400" />;
}

function isNegativeInfo(text: string) {
  const lower = text.toLowerCase();
  return (
    lower.includes("no return") ||
    lower.includes("non-returnable") ||
    lower.includes("not returnable") ||
    lower.includes("no refund")
  );
}

export function ProductDetailView({
  product,
  relatedProducts,
  currencyCode = "INR",
  currencySymbol = "₹",
}: ProductDetailViewProps) {
  const formatAmount = (amount: number) =>
    formatMoney(amount, { currencyCode, symbol: currencySymbol });

  const [quantity, setQuantity] = useState(product.minimumOrderQuantity);
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, Math.max(product.stock, product.minimumOrderQuantity)));
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, product.minimumOrderQuantity));
  };

  const handleAddToCart = async () => {
    if (!product.isPurchasable) {
      showToast(product.unavailabilityReason ?? "Product is currently unavailable.", "error");
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
            {product.usesIndications && (
              <p className="text-sm font-medium text-slate-600">
                <span className="text-slate-500 font-normal">Uses:</span> {product.usesIndications}
              </p>
            )}
          </div>

          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-blue-700">{formatAmount(product.price)}</p>
            {product.oldPrice ? (
              <p className="pb-1 text-sm text-slate-400 line-through">
                {formatAmount(product.oldPrice)}
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
            <ul className="space-y-2">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                  {getHighlightIcon(item)}
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
            {product.deliveryInfo.map((item) => (
              <p
                key={item}
                className={
                  isNegativeInfo(item)
                    ? "font-medium text-orange-600"
                    : "text-emerald-800"
                }
              >
                {item}
              </p>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-700">Quantity</span>
              <button
                type="button"
                onClick={decreaseQuantity}
                disabled={quantity <= product.minimumOrderQuantity || isAdding || !product.isPurchasable}
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="min-w-8 text-center text-sm font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={increaseQuantity}
                disabled={
                  isAdding ||
                  !product.isPurchasable ||
                  quantity >= Math.max(product.stock, product.minimumOrderQuantity)
                }
                className="h-8 w-8 rounded-md border border-neutral-300 bg-white text-slate-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {product.minimumOrderQuantity > 1 ? (
              <p className="text-xs text-slate-500">
                Minimum order quantity: {product.minimumOrderQuantity}
              </p>
            ) : null}

            {!product.isPurchasable ? (
              <p className="text-sm font-medium text-orange-600">
                {product.unavailabilityReason ?? "Currently unavailable"}
              </p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <HomeButton
                variant="dark"
                className="w-full py-2.5 text-sm font-bold tracking-wide shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isAdding || !product.isPurchasable}
                onClick={handleAddToCart}
              >
                {isAdding ? "Adding..." : product.isPurchasable ? "Add to Cart" : "Unavailable"}
              </HomeButton>
              <Link
                href="/cart"
                className="inline-flex w-full items-center justify-center rounded-lg border-2 border-slate-800 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Go to Cart
              </Link>
            </div>
            <Link
              href="/shop"
              className="inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
            >
              Continue Shopping
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
                {product.specs.map((spec, idx) => (
                  <tr
                    key={spec.label}
                    className={`border-b border-neutral-200 last:border-b-0 ${idx % 2 === 0 ? "bg-neutral-50" : "bg-white"}`}
                  >
                    <td className="w-2/5 px-4 py-3 font-semibold text-slate-700">{spec.label}</td>
                    <td className="px-4 py-3 text-slate-600">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {product.keyFeatures && product.keyFeatures.length > 0 && (
          <Card as="section" className="lg:col-span-2 p-5 sm:p-6">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5 text-blue-600" /> Key Features
             </h3>
             <ul className="mt-4 space-y-2">
               {product.keyFeatures.map((feature, i) => (
                 <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span> <span>{feature}</span>
                 </li>
               ))}
             </ul>
          </Card>
        )}

        {product.keyBenefits && product.keyBenefits.length > 0 && (
          <Card as="section" className="lg:col-span-2 p-5 sm:p-6">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <CheckCircle2 className="w-5 h-5 text-blue-600" /> Key Benefits
             </h3>
             <ul className="mt-4 space-y-2">
               {product.keyBenefits.map((benefit, i) => (
                 <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">•</span> <span>{benefit}</span>
                 </li>
               ))}
             </ul>
          </Card>
        )}

        {(product.directionsForUse || product.safetyInformation || product.storageConditions) && (
          <Card as="section" className="lg:col-span-2 p-5 sm:p-6">
             <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
               <FileText className="w-5 h-5 text-blue-600" /> Additional Information
             </h3>
             <div className="mt-4 space-y-4 text-sm text-slate-600">
               {product.directionsForUse && (
                 <div>
                   <span className="font-semibold text-slate-800">Directions for Use:</span>
                   <p className="mt-1">{product.directionsForUse}</p>
                 </div>
               )}
               {product.safetyInformation && (
                 <div>
                   <span className="font-semibold text-slate-800">Safety Information:</span>
                   <p className="mt-1">{product.safetyInformation}</p>
                 </div>
               )}
               {product.storageConditions && (
                 <div>
                   <span className="font-semibold text-slate-800">Storage Conditions:</span>
                   <p className="mt-1">{product.storageConditions}</p>
                 </div>
               )}
             </div>
          </Card>
        )}

        <Card as="section" className="space-y-3 p-5 sm:p-6 h-fit">
          <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
          <p className="text-sm text-slate-600">
            Have questions about compatibility, delivery, or returns?
          </p>
          <Link
            href="/contact"
            className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Contact Support
          </Link>
          <div className="space-y-1.5 rounded-lg bg-neutral-50 p-3">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Phone className="h-4 w-4 text-blue-500" />
              +91 98765 43210
            </p>
            <p className="text-xs text-slate-500 pl-6">Mon – Sat, 9:00 AM – 8:00 PM IST</p>
          </div>
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
            <Card key={item.id} as="article" className="group overflow-hidden rounded-xl">
              <Link href={`/shop/${item.id}`} className="block overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-bold text-blue-700">{formatAmount(item.price)}</p>
                  {item.oldPrice ? (
                    <p className="text-sm text-slate-400 line-through">{formatAmount(item.oldPrice)}</p>
                  ) : null}
                </div>
                <div className="translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <HomeButton
                    variant="dark"
                    className="w-full py-2.5 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={addingRelatedId === item.id}
                    onClick={() => handleAddRelatedToCart(item.id)}
                  >
                    {addingRelatedId === item.id ? "Adding..." : "Add to Cart"}
                  </HomeButton>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
