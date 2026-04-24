import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { AuthProvider } from "@/components/auth-provider";
import { CartProvider } from "@/components/cart/cart-provider";
import { JsonLd } from "@/components/json-ld";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { RuntimeConfigScript } from "@/components/runtime-config-script";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WishlistProvider } from "@/components/wishlist-provider";
import "@/app/globals.css";
import { getSiteUrl } from "@/lib/config";
import "@/lib/static-content-validation";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_SITE_TITLE,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  buildOrganizationJsonLd,
  buildWebsiteJsonLd,
} from "@/lib/seo";

const siteUrl = getSiteUrl();

const bodyFont = localFont({
  src: "./fonts/manrope/Manrope-VF.ttf",
  variable: "--font-body",
  display: "swap",
  fallback: ["Segoe UI", "Trebuchet MS", "sans-serif"],
});

const accentFont = localFont({
  src: [
    {
      path: "./fonts/fraunces/Fraunces-VF.ttf",
      style: "normal",
    },
    {
      path: "./fonts/fraunces/Fraunces-Italic-VF.ttf",
      style: "italic",
    },
  ],
  variable: "--font-accent",
  display: "swap",
  fallback: ["Palatino Linotype", "Book Antiqua", "serif"],
});

export const metadata: Metadata = {
  title: {
    default: DEFAULT_SITE_TITLE,
    template: "%s",
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(siteUrl),
  applicationName: SITE_NAME,
  authors: [{ name: "Tim Wiragro", url: `${siteUrl}/tentang-kami` }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Agriculture",
  formatDetection: {
    address: false,
    email: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  keywords: [
    "wiragro",
    "edukasi pertanian",
    "toko pertanian",
    "produk pertanian",
    "pupuk",
    "benih",
    "pestisida",
  ],
  openGraph: {
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl,
    siteName: SITE_NAME,
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        alt: "Wiragro",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_SITE_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/brand/wiragro-icon.svg",
    shortcut: "/brand/wiragro-icon.svg",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
        <JsonLd
          data={[buildOrganizationJsonLd(), buildWebsiteJsonLd()]}
          id="global-seo-jsonld"
        />
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
