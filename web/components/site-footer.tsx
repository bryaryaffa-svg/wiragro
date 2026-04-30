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
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__hero">
        <div className="site-footer__brand">
          <WiragroLockup
            contextLabel="Platform Solusi Pertanian Digital"
            tone="light"
            variant="footer"
          />
        </div>

        {store ? (
          <div className="site-footer__contact-card">
            <div className="site-footer__contact-heading">
              <span>Pusat Layanan</span>
              <strong>Hubungi tim Wiragro</strong>
            </div>

            <div className="site-footer__contact-grid">
              <div className="site-footer__contact site-footer__contact--address">
                <strong>Alamat</strong>
                <span>{store.address || "Alamat layanan sedang diperbarui."}</span>
              </div>

              <div className="site-footer__contact site-footer__contact--hours">
                <strong>Jam layanan</strong>
                <span>{store.operational_hours || "Senin - Sabtu, 08:00 - 17:00"}</span>
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
          </div>
        ) : null}
      </div>

      <nav aria-label="Navigasi footer" className="site-footer__links-shell">
        <div className="site-footer__columns">
          {FOOTER_LINK_GROUPS.map((group) => (
            <section className="site-footer__link-group" key={group.title}>
              <h3 className="site-footer__link-heading">{group.title}</h3>
              <div className="site-footer__link-list">
                {group.links.map((link) => (
                  <Link className="site-footer__link-cell" href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div className="site-footer__bottom">
        <p>&copy; {year} Wiragro. Platform solusi pertanian digital untuk belajar, menyelesaikan masalah, dan berbelanja lebih terarah.</p>
        <div className="site-footer__bottom-links">
          <Link href="/faq">FAQ</Link>
          <Link href="/kebijakan-privasi">Privasi</Link>
          <Link href="/syarat-dan-ketentuan">Syarat</Link>
        </div>
      </div>
    </footer>
  );
}
