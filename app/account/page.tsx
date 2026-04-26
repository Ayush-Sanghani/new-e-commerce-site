import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AccountPageView } from "@/components/account/account-page-view";
import { categoryGroups } from "@/components/home/data";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { verifyToken } from "@/lib/jwt";
import { getCartForUser } from "@/lib/services/cart";

export default async function AccountPage() {
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
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <HomeHeader displayName={displayName} categoryGroups={categoryGroups} cartCount={cartCount} />
      <AccountPageView />
      <HomeFooter />
    </div>
  );
}
