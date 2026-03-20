import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";

import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistProvider } from "@/components/wishlist-provider";
import "@/app/globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const accentFont = Fraunces({
  subsets: ["latin"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "Kios Sidomakmur",
  description:
    "Marketplace produk pertanian Sidomakmur yang terhubung dengan SiGe Manajer.",
  metadataBase: new URL("https://sidomakmur.com"),
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
