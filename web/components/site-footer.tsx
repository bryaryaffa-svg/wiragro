import Link from "next/link";

import { WiragroLockup } from "@/components/wiragro-lockup";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { FOOTER_LINK_GROUPS } from "@/lib/hybrid-navigation";
import { buildWhatsAppConsultationUrl } from "@/lib/homepage-content";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";

export async function SiteFooter() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const mapsUrl = store
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;
  const consultationUrl = buildWhatsAppConsultationUrl(store?.whatsapp_number, store?.name);

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <WiragroLockup
          contextLabel="Platform Solusi Pertanian Digital"
          tone="light"
          variant="footer"
        />
        <h2>Solusi tanaman, edukasi, produk, dan layanan pertanian digital dalam satu platform.</h2>
        <p>
          Wiragro membantu petani, toko pertanian, dan distributor bergerak dari masalah
          tanaman ke pembelajaran, rekomendasi, dan pembelian yang lebih tepat.
        </p>
        <div className="site-footer__badges">
          <span>Solusi</span>
          <span>Produk</span>
          <span>Edukasi</span>
          <span>AI Chat</span>
          <span>B2C & B2B</span>
        </div>
        {store ? (
          <div className="site-footer__contact">
            <strong>Pusat Layanan Wiragro</strong>
            <span>{store.address || "Alamat layanan sedang diperbarui."}</span>
            {store.operational_hours ? <span>Jam layanan: {store.operational_hours}</span> : null}
            {store.whatsapp_number ? <span>WhatsApp: {store.whatsapp_number}</span> : null}
            {consultationUrl ? (
              <a href={consultationUrl} rel="noreferrer" target="_blank">
                Hubungi WhatsApp resmi
              </a>
            ) : null}
            {mapsUrl ? (
              <a href={mapsUrl} rel="noreferrer" target="_blank">
                Buka Google Maps
              </a>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="site-footer__columns">
        {FOOTER_LINK_GROUPS.map((group) => (
          <div className="site-footer__links" key={group.title}>
            <h3>{group.title}</h3>
            {group.links.map((link) => (
              <Link href={link.href} key={`${group.title}-${link.href}`}>
                {link.label}
              </Link>
            ))}
          </div>
        ))}
      </div>
    </footer>
  );
}
