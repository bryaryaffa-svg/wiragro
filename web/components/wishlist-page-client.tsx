"use client";

import Link from "next/link";

import { useAuth } from "@/components/auth-provider";
import { ProductCard } from "@/components/product-card";
import { useWishlist } from "@/components/wishlist-provider";

export function WishlistPageClient() {
  const { isReady, session } = useAuth();
  const { items, isLoading, error } = useWishlist();

  if (!isReady) {
    return <div className="panel-card">Menyiapkan sesi akun...</div>;
  }

  if (!session) {
    return (
      <section className="empty-state">
        <span className="eyebrow-label">Wishlist</span>
        <h1>Login dulu untuk menyimpan produk favorit</h1>
        <p>
          Wishlist tersimpan di akun Anda, jadi silakan masuk dengan Google atau
          WhatsApp OTP sebelum mulai menyimpan produk.
        </p>
        <Link className="btn btn-primary" href="/masuk?next=%2Fwishlist">
          Masuk ke akun
        </Link>
      </section>
    );
  }

  if (isLoading && items.length === 0) {
    return <div className="panel-card">Memuat wishlist Anda...</div>;
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
        <h1>Produk favorit Anda</h1>
        <p>
          Daftar ini sinkron dengan akun yang sedang login dan siap dibuka lagi dari
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
