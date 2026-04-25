"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { WiragroLockup } from "@/components/wiragro-lockup";
import { useWishlist } from "@/components/wishlist-provider";
import {
  COMMERCIAL_ENTRY_LINKS,
  GLOBAL_SEARCH_HREF,
  HEADER_NAV_LINKS,
  PLATFORM_ENTRY_LINKS,
  UTILITY_NAV_LINKS,
  isHybridNavActive,
} from "@/lib/hybrid-navigation";

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
  const mobilePrimaryLinks = PLATFORM_ENTRY_LINKS.slice(0, 3);
  const mobileMenuGroups = [
    {
      title: "Jelajah platform",
      links: HEADER_NAV_LINKS,
    },
    {
      title: "Belanja lanjutan",
      links: COMMERCIAL_ENTRY_LINKS,
    },
    {
      title: "Akun & favorit",
      links: [
        { href: "/wishlist", label: "Wishlist" },
        { href: "/keranjang", label: "Keranjang" },
        { href: accountHref, label: session ? "Akun" : "Masuk" },
      ],
    },
    {
      title: "Bantuan",
      links: UTILITY_NAV_LINKS,
    },
  ];

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
          <WiragroLockup contextLabel="Platform Solusi Pertanian Digital" variant="header" />
        </Link>

        <form action={GLOBAL_SEARCH_HREF} className="header-search">
          <input
            aria-label="Cari penawaran Wiragro"
            name="q"
            placeholder="Cari solusi, produk, artikel, bundle, atau campaign..."
            type="search"
          />
          <button aria-label="Cari penawaran" type="submit">
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
          {HEADER_NAV_LINKS.map((link) => {
            const isActive = isHybridNavActive(pathname, link.href);
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
            const isActive = isHybridNavActive(pathname, link.href);
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
          {UTILITY_NAV_LINKS.map((link) => (
            <Link
              className={isActivePath(pathname, link.href) ? "is-active" : undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className={`site-header__mobile-panel${isMobileMenuOpen ? " is-open" : ""}`}>
        {mobileMenuGroups.map((group) => (
          <div className="site-header__mobile-panel-group" key={group.title}>
            <span className="site-header__mobile-panel-label">{group.title}</span>
            {group.links.map((link) => {
              const isActive =
                group.title === "Jelajah platform"
                  ? isHybridNavActive(pathname, link.href)
                  : isActivePath(pathname, link.href);
              return (
                <Link
                  className={isActive ? "is-active" : undefined}
                  href={link.href}
                  key={`panel-${group.title}-${link.href}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </header>
  );
}
