"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { WiragroLockup } from "@/components/wiragro-lockup";
import { useWishlist } from "@/components/wishlist-provider";

const mainLinks = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/artikel", label: "Edukasi" },
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
];

const supportLinks = [
  { href: "/tentang-kami", label: "Tentang Kami" },
  { href: "/kontak", label: "Kontak" },
  { href: "/faq", label: "FAQ" },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { session } = useAuth();
  const { items } = useWishlist();
  const cartCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const firstName = session?.customer.full_name.split(" ")[0] ?? "Masuk";
  const accountHref = session ? "/akun" : "/masuk";

  return (
    <header className="site-header">
      <div className="site-header__bar">
        <Link className="brand-mark" href="/">
          <WiragroLockup />
        </Link>

        <form action="/produk" className="header-search">
          <input
            aria-label="Cari produk"
            name="q"
            placeholder="Cari pupuk, benih, minyak, gula..."
            type="search"
          />
          <button type="submit">Cari</button>
        </form>

        <div className="header-actions">
          <Link
            className={`header-action-link ${isActivePath(pathname, "/wishlist") ? "is-active" : ""}`}
            href="/wishlist"
          >
            <span>Wishlist</span>
            {items.length > 0 ? <em>{items.length}</em> : null}
          </Link>
          <Link
            className={`header-action-link ${isActivePath(pathname, "/keranjang") ? "is-active" : ""}`}
            href="/keranjang"
          >
            <span>Keranjang</span>
            {cartCount > 0 ? <em>{cartCount}</em> : null}
          </Link>
          <Link
            className={`header-action-link ${isActivePath(pathname, "/akun") || isActivePath(pathname, "/login") || isActivePath(pathname, "/masuk") ? "is-active" : ""}`}
            href={accountHref}
          >
            <span>{session ? `Halo, ${firstName}` : "Masuk"}</span>
          </Link>
        </div>
      </div>

      <nav className="site-nav" aria-label="Navigasi utama">
        <div className="site-nav__group">
          {mainLinks.map((link) => {
            const isActive = isActivePath(pathname, link.href);
            return (
              <Link
                className={isActive ? "is-active" : undefined}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="site-nav__tail">
          <div className="site-nav__group site-nav__group--secondary">
            {supportLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
          <span className="site-nav__meta">Belanja retail, grosir, pickup, dan delivery.</span>
        </div>
      </nav>
    </header>
  );
}
