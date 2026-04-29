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
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__hero">
        <div className="site-footer__brand">
          <span className="site-footer__eyebrow">Wiragro</span>
          <WiragroLockup
            contextLabel="Platform Solusi Pertanian Digital"
            tone="light"
            variant="footer"
          />
          <h2>Dari gejala lapangan ke keputusan beli yang lebih yakin.</h2>
          <p>
            Wiragro menyatukan solusi tanaman, edukasi praktis, produk terarah, dan bantuan tim agar
            keputusan di lapangan terasa lebih cepat dipahami.
          </p>
          <div className="site-footer__badges">
            <span>Solusi Tanaman</span>
            <span>Video & Artikel</span>
            <span>Produk Terarah</span>
            <span>AI Pertanian</span>
          </div>
        </div>

        {store ? (
          <div className="site-footer__contact-card">
            <div className="site-footer__contact-heading">
              <span>Pusat Layanan</span>
              <strong>Hubungi tim Wiragro</strong>
            </div>

            <div className="site-footer__contact-grid">
              <div className="site-footer__contact">
                <strong>Alamat</strong>
                <span>{store.address || "Alamat layanan sedang diperbarui."}</span>
              </div>

              <div className="site-footer__contact">
                <strong>Jam layanan</strong>
                <span>{store.operational_hours || "Senin - Sabtu, 08:00 - 17:00"}</span>
              </div>

              {store.whatsapp_number ? (
                <div className="site-footer__contact">
                  <strong>WhatsApp resmi</strong>
                  <span>{store.whatsapp_number}</span>
                </div>
              ) : null}
            </div>

            <div className="site-footer__contact-actions">
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
          </div>
        ) : null}
      </div>

      <div className="site-footer__links-shell">
        <div className="site-footer__columns">
          {FOOTER_LINK_GROUPS.map((group) => (
            <div className="site-footer__links" key={group.title}>
              <h3>{group.title}</h3>
              {group.links.map((link, index) => (
                <Link href={link.href} key={`${group.title}-${link.label}-${link.href}-${index}`}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>&copy; {year} Wiragro. Platform solusi pertanian digital untuk belajar, menyelesaikan masalah, dan berbelanja lebih terarah.</p>
        <div className="site-footer__bottom-links">
          <Link href="/kontak">Kontak</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/kebijakan-privasi">Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat</Link>
        </div>
      </div>
    </footer>
  );
}
