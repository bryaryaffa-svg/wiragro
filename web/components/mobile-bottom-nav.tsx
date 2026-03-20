"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { session } = useAuth();
  const { items } = useWishlist();
  const cartCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const mobileLinks = [
    { href: "/", label: "Beranda", badge: null },
    { href: "/produk", label: "Produk", badge: null },
    { href: "/wishlist", label: "Wishlist", badge: items.length > 0 ? String(items.length) : null },
    { href: "/keranjang", label: "Keranjang", badge: cartCount > 0 ? String(cartCount) : null },
    { href: "/akun", label: session ? "Akun" : "Masuk", badge: null },
  ];

  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {mobileLinks.map((link) => {
        const isActive = isActivePath(pathname, link.href);
        return (
          <Link className={isActive ? "is-active" : undefined} href={link.href} key={link.href}>
            <span>{link.label}</span>
            {link.badge ? <strong>{link.badge}</strong> : null}
          </Link>
        );
      })}
    </nav>
  );
}
