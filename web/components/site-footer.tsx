import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <span className="brand-mark__eyebrow">Marketplace pertanian terhubung pusat</span>
        <h2>Kios Sidomakmur</h2>
        <p>
          Kanal belanja online Sidomakmur untuk alat pertanian, herbisida, benih, dan
          nutrisi dengan alur order yang terintegrasi ke SiGe Manajer.
        </p>
      </div>

      <div className="site-footer__links">
        <Link href="/tentang-kami">Tentang Kami</Link>
        <Link href="/kontak">Kontak</Link>
        <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
        <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        <Link href="/faq">FAQ</Link>
        <Link href="/artikel">Artikel</Link>
      </div>
    </footer>
  );
}
