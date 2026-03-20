"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useWishlist } from "@/components/wishlist-provider";

const mainLinks = [
  { href: "/", label: "Beranda" },
  { href: "/produk", label: "Produk" },
  { href: "/artikel", label: "Artikel" },
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
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

  return (
    <header className="site-header">
      <div className="site-header__meta">
        <div className="site-header__meta-inner">
          <span>Storefront resmi Sidomakmur untuk alat tani, benih, herbisida, dan nutrisi.</span>
          <span>Terhubung ke SiGe Manajer dan siap dipakai desktop maupun mobile.</span>
        </div>
      </div>
      <div className="site-header__bar">
        <Link className="brand-mark" href="/">
          <span className="brand-mark__eyebrow">Sidomakmur.com</span>
          <strong>Kios Sidomakmur</strong>
          <small>Belanja sarana pertanian yang rapi, cepat, dan sinkron ke pusat.</small>
        </Link>

        <form action="/produk" className="header-search">
          <input
            aria-label="Cari produk"
            name="q"
            placeholder="Cari alat pertanian, herbisida, benih, nutrisi..."
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
            <strong>{items.length > 0 ? `${items.length} item` : "Simpan produk"}</strong>
          </Link>
          <Link
            className={`header-action-link ${isActivePath(pathname, "/keranjang") ? "is-active" : ""}`}
            href="/keranjang"
          >
            <span>Keranjang</span>
            <strong>{cartCount > 0 ? `${cartCount} item` : "Cek pesanan"}</strong>
          </Link>
          <Link
            className={`header-action-link ${isActivePath(pathname, "/akun") ? "is-active" : ""}`}
            href="/akun"
          >
            <span>{session ? "Akun aktif" : "Masuk / daftar"}</span>
            <strong>{session ? `Halo, ${firstName}` : "Login customer"}</strong>
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
        <div className="site-nav__group site-nav__group--secondary">
          <Link href="/tentang-kami">Tentang Kami</Link>
          <Link href="/kontak">Kontak</Link>
          <Link href="/faq">FAQ</Link>
        </div>
      </nav>
    </header>
  );
}
