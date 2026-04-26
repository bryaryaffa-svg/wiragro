"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { GlobalSearch } from "@/components/global-search";
import { MobileSearchOverlay } from "@/components/mobile-search-overlay";
import { WiragroLockup } from "@/components/wiragro-lockup";
import { useWishlist } from "@/components/wishlist-provider";
import {
  HEADER_NAV_LINKS,
  UTILITY_NAV_LINKS,
  isHybridNavActive,
} from "@/lib/hybrid-navigation";

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({ open }: { open: boolean }) {
  return open ? (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  ) : (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M4.5 7.5h15M4.5 12h15M4.5 16.5h15" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function CartIcon() {
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
}

export function AppHeader() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { session } = useAuth();
  const { items } = useWishlist();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const cartCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const firstName = session?.customer.full_name.split(" ")[0] ?? "Masuk";
  const accountHref = session ? "/akun" : "/masuk";

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 16);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={`site-header app-header${isScrolled ? " site-header--scrolled" : ""}${isMenuOpen ? " site-header--menu-open" : ""}`}
      >
        <div className="app-header__surface">
          <div className="site-header__bar app-header__bar">
            <Link className="app-header__brand" href="/">
              <WiragroLockup contextLabel="Platform Solusi Pertanian Digital" variant="header" />
            </Link>

            <div className="app-header__search">
              <GlobalSearch />
            </div>

            <div className="header-actions app-header__actions">
              <Link
                className={`header-action-link ${isActivePath(pathname, accountHref) ? "is-active" : ""}`}
                href={accountHref}
              >
                <span>{session ? firstName : "Masuk"}</span>
              </Link>
              <Link
                className={`header-action-link ${isActivePath(pathname, "/keranjang") ? "is-active" : ""}`}
                href="/keranjang"
              >
                <span>Keranjang</span>
                {cartCount > 0 ? <em>{cartCount}</em> : null}
              </Link>
            </div>

            <button
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className="site-header__bar-toggle app-header__toggle"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              <MenuIcon open={isMenuOpen} />
            </button>

            <div className="app-header__mobile-actions">
              <button
                aria-label="Buka pencarian"
                className="app-header__icon-button"
                onClick={() => setIsSearchOpen(true)}
                type="button"
              >
                <SearchIcon />
              </button>
              <Link
                aria-label="Buka keranjang"
                className={`app-header__icon-button ${isActivePath(pathname, "/keranjang") ? "is-active" : ""}`}
                href="/keranjang"
              >
                <CartIcon />
                {cartCount > 0 ? <em>{cartCount}</em> : null}
              </Link>
            </div>
          </div>

          <div className="app-header__nav-row">
            <nav className="site-nav app-header__nav" aria-label="Navigasi utama">
              {HEADER_NAV_LINKS.map((link) => {
                const isActive = isHybridNavActive(pathname, link.href);

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "is-active" : undefined}
                    href={link.href}
                    key={link.href}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className={`site-header__mobile-panel app-header__mobile-panel${isMenuOpen ? " is-open" : ""}`}>
            <div className="site-header__mobile-panel-group">
              <span className="site-header__mobile-panel-label">Jelajah platform</span>
              {HEADER_NAV_LINKS.map((link) => {
                const isActive = isHybridNavActive(pathname, link.href);

                return (
                  <Link
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "is-active" : undefined}
                    href={link.href}
                    key={`mobile-${link.href}`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="site-header__mobile-panel-group">
              <span className="site-header__mobile-panel-label">Akun & bantuan</span>
              <Link
                className={isActivePath(pathname, "/wishlist") ? "is-active" : undefined}
                href="/wishlist"
              >
                Wishlist {items.length > 0 ? `(${items.length})` : ""}
              </Link>
              <Link
                className={isActivePath(pathname, "/keranjang") ? "is-active" : undefined}
                href="/keranjang"
              >
                Keranjang {cartCount > 0 ? `(${cartCount})` : ""}
              </Link>
              <Link
                className={
                  isActivePath(pathname, "/akun") || isActivePath(pathname, "/masuk")
                    ? "is-active"
                    : undefined
                }
                href={accountHref}
              >
                {session ? "Akun Saya" : "Masuk"}
              </Link>
              {UTILITY_NAV_LINKS.map((link) => (
                <Link
                  className={isActivePath(pathname, link.href) ? "is-active" : undefined}
                  href={link.href}
                  key={`utility-${link.href}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>
      <MobileSearchOverlay onClose={() => setIsSearchOpen(false)} open={isSearchOpen} />
    </>
  );
}
