import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RuntimeConfigScript } from "@/components/runtime-config-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistProvider } from "@/components/wishlist-provider";
import "@/app/globals.css";
import { getSiteUrl } from "@/lib/config";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const accentFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-accent",
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "Wiragro",
  description:
    "Platform pertanian digital Wiragro untuk katalog, checkout, dan storefront Sidomakmur.",
  metadataBase: new URL(siteUrl),
  icons: {
    icon: "/brand/wiragro-icon.svg",
    shortcut: "/brand/wiragro-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#74c365",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${bodyFont.variable} ${accentFont.variable}`}>
        <RuntimeConfigScript />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <div className="app-shell">
                <SiteHeader />
                <main className="app-main">{children}</main>
                <SiteFooter />
                <MobileBottomNav />
              </div>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
