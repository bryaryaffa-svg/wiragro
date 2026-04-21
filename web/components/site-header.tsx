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

type HeaderIconKind = "search" | "heart" | "cart" | "user";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function HeaderIcon({ kind }: { kind: HeaderIconKind }) {
  switch (kind) {
    case "search":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="6.4" stroke="currentColor" strokeWidth="1.8" />
          <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
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
        <div className="site-header__brand-row">
          <Link className="brand-mark" href="/">
            <WiragroLockup variant="header" />
          </Link>

          <div className="site-header__mobile-tools">
            <Link
              aria-label={`Wishlist${items.length > 0 ? `, ${items.length} item` : ""}`}
              className={`header-tool ${isActivePath(pathname, "/wishlist") ? "is-active" : ""}`}
              href="/wishlist"
            >
              <HeaderIcon kind="heart" />
              {items.length > 0 ? <em>{items.length}</em> : null}
            </Link>
            <Link
              aria-label={`Keranjang${cartCount > 0 ? `, ${cartCount} item` : ""}`}
              className={`header-tool ${isActivePath(pathname, "/keranjang") ? "is-active" : ""}`}
              href="/keranjang"
            >
              <HeaderIcon kind="cart" />
              {cartCount > 0 ? <em>{cartCount}</em> : null}
            </Link>
            <Link
              aria-label={session ? `Akun ${firstName}` : "Masuk"}
              className={`header-tool ${isActivePath(pathname, "/akun") || isActivePath(pathname, "/login") || isActivePath(pathname, "/masuk") ? "is-active" : ""}`}
              href={accountHref}
            >
              <HeaderIcon kind="user" />
            </Link>
          </div>
        </div>

        <form action="/produk" className="header-search">
          <span className="header-search__icon">
            <HeaderIcon kind="search" />
          </span>
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
