import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { mapApiCartPayload } from "@/components/cart/mappers";
import { CartPageView } from "@/components/cart/cart-page-view";
import { EMPTY_CART_SUMMARY } from "@/components/cart/types";
import { CURRENCY_COOKIE_NAME } from "@/lib/currency-config";
import { getSessionUserFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildCartPayload, getCartForUser } from "@/lib/services/cart";
import { resolveDisplayCurrency } from "@/lib/services/currency";

export default async function CartPage() {
  const user = await getSessionUserFromCookies();
  if (!user) redirect("/login");

  const [cart, profile, cookieStore, headerStore] = await Promise.all([
    getCartForUser(user.id),
    prisma.userProfile.findUnique({
      where: { userId: user.id },
      select: { preferredCurrency: true, country: true },
    }),
    cookies(),
    headers(),
  ]);

  const { context } = await resolveDisplayCurrency({
    cookieCurrency: cookieStore.get(CURRENCY_COOKIE_NAME)?.value ?? null,
    preferredCurrency: profile?.preferredCurrency ?? null,
    country: profile?.country ?? null,
    acceptLanguage: headerStore.get("accept-language"),
  });

  const built = buildCartPayload(cart, context);
  const { items, summary } = built ? mapApiCartPayload(built) : { items: [], summary: EMPTY_CART_SUMMARY };

  return (
    <div className="min-h-screen bg-neutral-50 text-slate-900">
      <CartPageView
        initialItems={items}
        initialSummary={summary}
        initialDisplayMeta={built?.display ?? null}
      />
    </div>
  );
}
