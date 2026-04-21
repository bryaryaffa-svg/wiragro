"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

type MobileNavIconKind = "home" | "grid" | "heart" | "cart" | "user";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavIcon({ kind }: { kind: MobileNavIconKind }) {
  switch (kind) {
    case "home":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 10.6 12 4l8 6.6v8.4a1 1 0 0 1-1 1h-4.5v-5.4h-5V20H5a1 1 0 0 1-1-1v-8.4Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "grid":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "heart":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 20.4 5.65 14.3C2.4 11.19 2.12 6.2 5.1 3.4C6.61 1.98 8.74 1.55 10.63 2.13C11.15 2.29 11.63 2.53 12.05 2.84C12.47 2.53 12.95 2.29 13.47 2.13C15.36 1.55 17.49 1.98 19 3.4C21.98 6.2 21.7 11.19 18.45 14.3L12 20.4Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
      );
    case "cart":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M4 6h2l1.5 8.2a1 1 0 0 0 1 .8h7.9a1 1 0 0 0 1-.8L19 8H7"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <circle cx="10" cy="19" fill="currentColor" r="1.5" />
          <circle cx="17" cy="19" fill="currentColor" r="1.5" />
        </svg>
      );
    case "user":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5.5 19c1.3-3 3.6-4.5 6.5-4.5s5.2 1.5 6.5 4.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.8"
          />
        </svg>
      );
  }
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { session } = useAuth();
  const { items } = useWishlist();
  const cartCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const mobileLinks = [
    { href: "/", label: "Beranda", badge: null, icon: "home" as const },
    { href: "/produk", label: "Produk", badge: null, icon: "grid" as const },
    {
      href: "/wishlist",
      label: "Wishlist",
      badge: items.length > 0 ? String(items.length) : null,
      icon: "heart" as const,
    },
    {
      href: "/keranjang",
      label: "Keranjang",
      badge: cartCount > 0 ? String(cartCount) : null,
      icon: "cart" as const,
    },
    {
      href: session ? "/akun" : "/masuk",
      label: session ? "Akun" : "Masuk",
      badge: null,
      icon: "user" as const,
    },
  ];

  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {mobileLinks.map((link) => {
        const isActive = isActivePath(pathname, link.href);
        return (
          <Link className={isActive ? "is-active" : undefined} href={link.href} key={link.href}>
            <span className="mobile-nav__icon">
              <MobileNavIcon kind={link.icon} />
            </span>
            <span className="mobile-nav__label">{link.label}</span>
            {link.badge ? <strong>{link.badge}</strong> : null}
          </Link>
        );
      })}
    </nav>
  );
}
