import Link from "next/link";
import { Card } from "@/components/home/ui/card";

export function CartEmptyState() {
  return (
    <Card className="p-8 text-center sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-blue-50 text-2xl">
        🛒
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">Your cart is empty</h2>
      <p className="mt-2 text-sm text-slate-600">
        Looks like you have not added any products yet.
      </p>
      <Link
        href="/shop"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Continue shopping
      </Link>
    </Card>
  );
}
