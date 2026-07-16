import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { CurrencyProvider } from "@/components/currency/currency-provider";
import { StaleRateBanner } from "@/components/currency/stale-rate-banner";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { MobileBottomNav } from "@/components/home/mobile-bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";
import { verifyToken } from "@/lib/jwt";
import { toCategoryGroups } from "@/lib/shop/categories";
import { getCartForUser } from "@/lib/services/cart";
import { listCategories } from "@/lib/services/product-queries";
import { getServerCurrencyBundle } from "@/lib/server-currency";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VrajPharma — Premium Online Shopping",
  description: "Shop medical equipment and pharma essentials with fast delivery and secure checkout.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  let payload: { sub: string; email?: string } | null = null;

  if (token) {
    try {
      payload = await verifyToken(token);
    } catch {
      payload = null;
    }
  }

  const displayName = payload?.email?.split("@")[0] || "Guest";
  const [cart, catalogCategories, currencyBundle] = await Promise.all([
    payload ? getCartForUser(payload.sub) : Promise.resolve(null),
    listCategories(),
    getServerCurrencyBundle(),
  ]);
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const categoryGroups = toCategoryGroups(catalogCategories);
  const { context } = currencyBundle;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ToastProvider>
          <CurrencyProvider
            initialCode={context.code}
            initialSymbol={context.symbol}
            initialDecimalDigits={context.decimalDigits}
            initialRateToInr={context.rateToInr.toNumber()}
            initialRateUpdatedAt={context.rateUpdatedAt.toISOString()}
            initialRateStale={context.rateStale}
            disclaimer={currencyBundle.disclaimer}
            currencies={currencyBundle.currencies}
          >
            <HomeHeader
              displayName={displayName}
              categoryGroups={categoryGroups}
              cartCount={cartCount}
              isAuthenticated={Boolean(payload)}
            />
            <StaleRateBanner />
            {children}
            <HomeFooter isAuthenticated={Boolean(payload)} />
            <MobileBottomNav
              cartCount={cartCount}
              isAuthenticated={Boolean(payload)}
            />
          </CurrencyProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
