"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="empty-state state-panel state-panel--error">
      <span className="eyebrow-label">Gagal memuat data</span>
      <h1>Halaman ini belum berhasil dimuat.</h1>
      <p>
        Coba lagi beberapa saat lagi. Jika masalah masih muncul, Anda tetap bisa
        kembali ke beranda, membuka solusi, atau melihat produk lain.
      </p>
      <div className="empty-state__actions">
        <button className="btn btn-primary" onClick={reset} type="button">
          Coba lagi
        </button>
        <Link className="btn btn-secondary" href="/">
          Kembali ke beranda
        </Link>
        <Link className="btn btn-secondary" href="/produk">
          Lihat produk lain
        </Link>
      </div>
    </section>
  );
}
