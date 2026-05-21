import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mapApiCartPayload } from "@/components/cart/mappers";
import { CartPageView } from "@/components/cart/cart-page-view";
import { EMPTY_CART_SUMMARY } from "@/components/cart/types";
import { verifyToken } from "@/lib/jwt";
import { buildCartPayload, getCartForUser } from "@/lib/services/cart";

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;

  if (!token) redirect("/login");

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    redirect("/login");
  }

  const cart = await getCartForUser(payload.sub);
  const built = buildCartPayload(cart);
  const { items, summary } = built ? mapApiCartPayload(built) : { items: [], summary: EMPTY_CART_SUMMARY };

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <CartPageView initialItems={items} initialSummary={summary} />
    </div>
  );
}
