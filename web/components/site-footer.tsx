import { Fragment } from "react";
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
  const footerLinkPairs = [];

  for (let index = 0; index < FOOTER_LINK_GROUPS.length; index += 2) {
    footerLinkPairs.push(FOOTER_LINK_GROUPS.slice(index, index + 2));
  }

  return (
    <footer className="site-footer" id="site-footer">
      <div className="site-footer__hero">
        <div className="site-footer__brand">
          <span className="site-footer__eyebrow">Wiragro</span>
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

      <div className="site-footer__links-shell">
        <div className="site-footer__columns">
          {footerLinkPairs.map(([leftGroup, rightGroup]) => {
            const rowCount = Math.max(
              leftGroup.links.length,
              rightGroup?.links.length ?? 0,
            );

            return (
              <div className="site-footer__link-pair" key={leftGroup.title}>
                <h3 className="site-footer__link-heading">{leftGroup.title}</h3>
                {rightGroup ? (
                  <h3 className="site-footer__link-heading">{rightGroup.title}</h3>
                ) : (
                  <span aria-hidden="true" className="site-footer__link-heading-placeholder" />
                )}

                {Array.from({ length: rowCount }).map((_, index) => {
                  const leftLink = leftGroup.links[index];
                  const rightLink = rightGroup?.links[index];

                  return (
                    <Fragment key={`${leftGroup.title}-${rightGroup?.title ?? "empty"}-${index}`}>
                      {leftLink ? (
                        <Link className="site-footer__link-cell" href={leftLink.href}>
                          {leftLink.label}
                        </Link>
                      ) : (
                        <span aria-hidden="true" className="site-footer__link-placeholder" />
                      )}

                      {rightLink ? (
                        <Link className="site-footer__link-cell" href={rightLink.href}>
                          {rightLink.label}
                        </Link>
                      ) : (
                        <span aria-hidden="true" className="site-footer__link-placeholder" />
                      )}
                    </Fragment>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

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
