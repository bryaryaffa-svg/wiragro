import Link from "next/link";

import { WiragroLockup } from "@/components/wiragro-lockup";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { FOOTER_LINK_GROUPS } from "@/lib/hybrid-navigation";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";

export async function SiteFooter() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const mapsUrl = store
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <WiragroLockup
          contextLabel="Platform pertanian hybrid"
          tone="light"
          variant="footer"
        />
        <h2>Belajar, cari solusi, lalu belanja kebutuhan tani dalam satu alur yang lebih jelas.</h2>
        <p>
          Wiragro membantu {store?.name ?? "Sidomakmur"} tampil bukan hanya sebagai toko,
          tetapi sebagai platform pertanian hybrid yang tetap kuat untuk conversion dan
          tetap nyaman dipakai mencari konteks.
        </p>
        <div className="site-footer__badges">
          <span>Belajar</span>
          <span>Cari Solusi</span>
          <span>Belanja</span>
        </div>
        {store ? (
          <div className="site-footer__contact">
            <strong>{store.name}</strong>
            <span>{store.address || "Alamat toko sedang diperbarui."}</span>
            {store.operational_hours ? <span>Jam operasional: {store.operational_hours}</span> : null}
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
