import { redirect } from "next/navigation";
import { mapApiCartPayload } from "@/components/cart/mappers";
import { CartPageView } from "@/components/cart/cart-page-view";
import { EMPTY_CART_SUMMARY } from "@/components/cart/types";
import { getSessionUserFromCookies } from "@/lib/auth";
import { buildCartPayload, getCartForUser } from "@/lib/services/cart";

export default async function CartPage() {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");

  const cart = await getCartForUser(user.id);
  const built = buildCartPayload(cart);
  const { items, summary } = built ? mapApiCartPayload(built) : { items: [], summary: EMPTY_CART_SUMMARY };

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <CartPageView initialItems={items} initialSummary={summary} />
    </div>
  );
}
