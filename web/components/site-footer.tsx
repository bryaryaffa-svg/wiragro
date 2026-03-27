import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <span className="brand-mark__eyebrow">Storefront pertanian terhubung pusat</span>
        <h2>Kios Sidomakmur</h2>
        <p>
          Kanal belanja online Sidomakmur untuk kebutuhan pertanian, toko, dan rumah
          tangga dengan alur order yang terhubung ke SiGe Manager.
        </p>
        <div className="site-footer__badges">
          <span>Katalog pusat</span>
          <span>Mobile friendly</span>
          <span>Checkout praktis</span>
        </div>
      </div>

      <div className="site-footer__columns">
        <div className="site-footer__links">
          <h3>Jelajahi</h3>
          <Link href="/produk">Produk</Link>
          <Link href="/artikel">Artikel</Link>
          <Link href="/lacak-pesanan">Lacak Pesanan</Link>
          <Link href="/akun">Akun</Link>
        </div>
        <div className="site-footer__links">
          <h3>Informasi</h3>
          <Link href="/tentang-kami">Tentang Kami</Link>
          <Link href="/kontak">Kontak</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div className="site-footer__links">
          <h3>Kebijakan</h3>
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}
