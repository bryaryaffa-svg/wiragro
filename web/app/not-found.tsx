import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state">
      <span className="eyebrow-label">404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>Periksa kembali alamat halaman atau lanjutkan ke katalog produk.</p>
      <Link className="btn btn-primary" href="/produk">
        Buka katalog
      </Link>
    </section>
  );
}
