"use client";

import { useEffect, useState } from "react";
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

type HeaderIconKind = "search" | "menu" | "close";

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
    case "menu":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
        </svg>
      );
    case "close":
      return (
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M6 6l12 12M18 6 6 18"
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
  const [isMobileNavCollapsed, setIsMobileNavCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobilePrimaryLinks = mainLinks.filter((link) => link.href !== "/lacak-pesanan");
  const mobileMenuLinks = [
    ...mainLinks,
    { href: accountHref, label: session ? "Akun" : "Masuk" },
    ...supportLinks,
  ].filter((link, index, list) => list.findIndex((item) => item.href === link.href) === index);

  useEffect(() => {
    const onScroll = () => {
      if (window.innerWidth > 640) {
        setIsMobileNavCollapsed(false);
        setIsMobileMenuOpen(false);
        return;
      }

      const shouldCollapse = window.scrollY > 72;
      setIsMobileNavCollapsed((current) => (current === shouldCollapse ? current : shouldCollapse));
      if (!shouldCollapse) {
        setIsMobileMenuOpen(false);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`site-header${isMobileNavCollapsed ? " site-header--mobile-collapsed" : ""}${isMobileMenuOpen ? " site-header--mobile-menu-open" : ""}`}
    >
      <div className="site-header__bar">
        <Link className="brand-mark" href="/">
          <WiragroLockup variant="header" />
        </Link>

        <form action="/produk" className="header-search">
          <input
            aria-label="Cari produk"
            name="q"
            placeholder="Cari pupuk, benih, minyak, gula..."
            type="search"
          />
          <button aria-label="Cari produk" type="submit">
            <HeaderIcon kind="search" />
          </button>
        </form>

        <button
          aria-expanded={isMobileMenuOpen}
          aria-label={isMobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
          className="site-header__bar-toggle"
          onClick={() => setIsMobileMenuOpen((current) => !current)}
          type="button"
        >
          <HeaderIcon kind={isMobileMenuOpen ? "close" : "menu"} />
        </button>

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
        <div className="site-nav__group site-nav__group--desktop">
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
        <div className="site-nav__group site-nav__group--mobile-primary">
          {mobilePrimaryLinks.map((link) => {
            const isActive = isActivePath(pathname, link.href);
            return (
              <Link
                className={isActive ? "is-active" : undefined}
                href={link.href}
                key={`mobile-${link.href}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <div className="site-nav__group site-nav__group--secondary">
          {supportLinks.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className={`site-header__mobile-panel${isMobileMenuOpen ? " is-open" : ""}`}>
        {mobileMenuLinks.map((link) => {
          const isActive = isActivePath(pathname, link.href);
          return (
            <Link
              className={isActive ? "is-active" : undefined}
              href={link.href}
              key={`panel-${link.href}`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
