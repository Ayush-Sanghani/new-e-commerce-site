import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mapApiCartToUiItems } from "@/components/cart/mappers";
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

  const cart = await getCartForUser(payload.sub); 
  const initialItems = mapApiCartToUiItems(
    cart as Parameters<typeof mapApiCartToUiItems>[0]
  );

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <CartPageView initialItems={initialItems} />
    </div>
  );
}
