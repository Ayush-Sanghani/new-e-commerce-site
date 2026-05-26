import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { categoryGroups } from "@/components/home/data";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeHeader } from "@/components/home/home-header";
import { ToastProvider } from "@/components/ui/toast-provider";
import { verifyToken } from "@/lib/jwt";
import { getCartForUser } from "@/lib/services/cart";
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
  title: "DummyApp",
  description: "Your personal workspace dashboard",
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
  const cart = payload ? await getCartForUser(payload.sub) : null;
  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          <HomeHeader
            displayName={displayName}
            categoryGroups={categoryGroups}
            cartCount={cartCount}
            isAuthenticated={Boolean(payload)}
          />
          {children}
          <HomeFooter isAuthenticated={Boolean(payload)} />
        </ToastProvider>
      </body>
    </html>
  );
}
