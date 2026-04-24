"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { isHybridNavActive } from "@/lib/hybrid-navigation";

type MobileNavIconKind = "learn" | "solve" | "shop" | "cart" | "user";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MobileNavIcon({ kind }: { kind: MobileNavIconKind }) {
  switch (kind) {
    case "learn":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M5 6.5A2.5 2.5 0 0 1 7.5 4H18v14.5A1.5 1.5 0 0 0 16.5 17H7.5A2.5 2.5 0 0 0 5 19.5V6.5Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path d="M8.5 8.5H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M8.5 12H15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "solve":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
          <path d="M8.8 11.1h4.4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "shop":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M5 7h14l-1.4 9.1a1 1 0 0 1-1 .9H7.4a1 1 0 0 1-1-.9L5 7Z"
            stroke="currentColor"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
          <path d="M8 7a4 4 0 1 1 8 0" stroke="currentColor" strokeWidth="1.8" />
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
  const cartCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const mobileLinks = [
    {
      href: "/belajar",
      label: "Belajar",
      badge: null,
      icon: "learn" as const,
    },
    {
      href: "/solusi",
      label: "Solusi",
      badge: null,
      icon: "solve" as const,
    },
    {
      href: "/belanja",
      label: "Belanja",
      badge: null,
      icon: "shop" as const,
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
        const isHybridLink =
          link.href === "/belajar" || link.href === "/solusi" || link.href === "/belanja";
        const isActive = isHybridLink
          ? isHybridNavActive(pathname, link.href)
          : isActivePath(pathname, link.href);
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
