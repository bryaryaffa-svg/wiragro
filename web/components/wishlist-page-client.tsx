"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/components/wishlist-provider";

export function WishlistPageClient() {
  const { isReady, session } = useAuth();
  const { items, isLoading, error } = useWishlist();

  if (!isReady) {
    return <div className="panel-card">Menyiapkan session customer...</div>;
  }

  if (!session) {
    return (
      <section className="empty-state">
        <span className="eyebrow-label">Wishlist</span>
        <h1>Login dulu untuk menyimpan produk favorit</h1>
        <p>
          Wishlist customer tersimpan di backend storefront, jadi perlu auth Google atau
          WhatsApp OTP sebelum dipakai.
        </p>
        <Link className="btn btn-primary" href="/login?next=%2Fwishlist">
          Buka auth customer
        </Link>
      </section>
    );
  }

  if (isLoading && items.length === 0) {
    return <div className="panel-card">Memuat wishlist customer...</div>;
  }

  if (items.length === 0) {
    return (
      <section className="empty-state">
        <span className="eyebrow-label">Wishlist</span>
        <h1>Belum ada produk yang disimpan</h1>
        <p>Simpan produk dari katalog untuk memudahkan pembelian berikutnya.</p>
        <Link className="btn btn-primary" href="/produk">
          Jelajahi katalog
        </Link>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-intro">
        <span className="eyebrow-label">Wishlist</span>
        <h1>Produk favorit customer</h1>
        <p>
          Daftar ini sinkron dengan akun customer yang sedang login dan siap dipakai dari
          browser mobile maupun desktop.
        </p>
      </div>
      {error ? <div className="panel-card">{error}</div> : null}
      <div className="product-grid">
        {items.map((item) => (
          <ProductCard key={item.product_id} product={item.product} />
        ))}
      </div>
    </section>
  );
}
