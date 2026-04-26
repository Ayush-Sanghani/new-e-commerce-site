import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { categoryGroups } from "@/components/home/data";
import { mapApiCartToUiItems } from "@/components/cart/mappers";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { CartPageView } from "@/components/cart/cart-page-view";
import { verifyToken } from "@/lib/jwt";
import { getCartForUser } from "@/lib/services/cart";

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

  const displayName = payload.email?.split("@")[0] || "Guest";
  const cart = await getCartForUser(payload.sub); 
  const initialItems = mapApiCartToUiItems(
    cart as Parameters<typeof mapApiCartToUiItems>[0]
  );
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <HomeHeader displayName={displayName} categoryGroups={categoryGroups} cartCount={cartCount} />
      <CartPageView initialItems={initialItems} />
      <HomeFooter />
    </div>
  );
}
