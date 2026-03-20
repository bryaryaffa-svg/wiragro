import Link from "next/link";

export default function NotFound() {
  return (
    <section className="empty-state empty-state--404">
      <span className="eyebrow-label">404 / Halaman tidak ditemukan</span>
      <h1>Alamat yang Anda buka sudah tidak tersedia di storefront baru.</h1>
      <p>
        Beberapa halaman lama dari website sebelumnya sudah dipensiunkan. Gunakan navigasi
        utama atau lanjutkan ke katalog untuk menemukan produk dan konten terbaru.
      </p>
      <div className="empty-state__actions">
        <Link className="btn btn-primary" href="/">
          Kembali ke beranda
        </Link>
        <Link className="btn btn-secondary" href="/produk">
          Buka katalog
        </Link>
      </div>
    </section>
  );
}
