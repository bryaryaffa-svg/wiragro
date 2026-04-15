import Link from "next/link";

import { WiragroLockup } from "@/components/wiragro-lockup";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";

export async function SiteFooter() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const mapsUrl = store
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <WiragroLockup contextLabel={store?.name ?? "Sidomakmur storefront"} tone="light" />
        <h2>Katalog pertanian yang lebih cepat, rapi, dan siap dipakai belanja.</h2>
        <p>
          Wiragro membantu {store?.name ?? "Sidomakmur"} menampilkan produk, harga,
          checkout, dan pelacakan pesanan dalam satu storefront yang lebih meyakinkan.
        </p>
        <div className="site-footer__badges">
          <span>Belanja retail & grosir</span>
          <span>Pickup toko</span>
          <span>Delivery lokal</span>
        </div>
        {store ? (
          <div className="site-footer__contact">
            <strong>{store.name}</strong>
            <span>{store.address || "Alamat toko sedang diperbarui."}</span>
            {store.whatsapp_number ? <span>WhatsApp: {store.whatsapp_number}</span> : null}
            {mapsUrl ? (
              <a href={mapsUrl} rel="noreferrer" target="_blank">
                Buka Google Maps
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="site-footer__columns">
        <div className="site-footer__links">
          <h3>Katalog</h3>
          <Link href="/produk">Produk</Link>
          <Link href="/artikel">Edukasi</Link>
          <Link href="/lacak-pesanan">Lacak Pesanan</Link>
          <Link href="/akun">Akun</Link>
        </div>
        <div className="site-footer__links">
          <h3>Perusahaan</h3>
          <Link href="/tentang-kami">Tentang Kami</Link>
          <Link href="/kontak">Kontak</Link>
          <Link href="/faq">FAQ</Link>
        </div>
        <div className="site-footer__links">
          <h3>Informasi</h3>
          <Link href="/kebijakan-privasi">Kebijakan Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat dan Ketentuan</Link>
        </div>
      </div>
    </footer>
  );
}
