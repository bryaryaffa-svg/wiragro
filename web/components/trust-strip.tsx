import Link from "next/link";

import type { StoreProfile } from "@/lib/api";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";

function buildConsultationUrl(phone?: string | null, storeName?: string | null) {
  if (!phone) {
    return null;
  }

  const formatted = phone.replace(/\D+/g, "");
  if (!formatted) {
    return null;
  }

  const message = encodeURIComponent(
    `Halo ${storeName ?? "Wiragro"}, saya ingin memastikan pengiriman, pembayaran, atau langkah belanja yang paling aman.`,
  );

  return `https://wa.me/${formatted}?text=${message}`;
}

export function TrustStrip({
  store,
  heading = "Belanja lebih tenang dengan informasi layanan yang jelas.",
  description = "Ringkasan ini membantu pembeli memahami pengiriman, pembayaran, bantuan layanan, dan kebijakan dasar sebelum maupun sesudah checkout.",
}: {
  store?: StoreProfile | null;
  heading?: string;
  description?: string;
}) {
  const consultationUrl = buildConsultationUrl(store?.whatsapp_number, store?.name);
  const mapsUrl = store?.address
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;

  return (
    <section className="section-block commerce-trust-strip">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Trust dasar</span>
          <h2>{heading}</h2>
          <p>{description}</p>
        </div>
        <div className="commerce-trust-strip__actions">
          <Link href="/pengiriman-pembayaran">Pengiriman & pembayaran</Link>
          <Link href="/garansi-retur">Garansi & retur</Link>
        </div>
      </div>

      <div className="commerce-trust-strip__grid">
        <article className="storefront-trust-card">
          <strong>Pengiriman dan pickup</strong>
          <p>Delivery dan pickup tersedia agar pembeli bisa memilih cara pemenuhan yang paling nyaman.</p>
          <Link href="/pengiriman-pembayaran">Lihat opsi pengiriman</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>Pembayaran yang aktif</strong>
          <p>Metode pembayaran aktif ditampilkan langsung saat checkout agar keputusan akhir terasa lebih jelas.</p>
          <Link href="/pengiriman-pembayaran">Lihat metode pembayaran</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>Bantuan layanan</strong>
          <p>Jika ada kendala pesanan atau produk, pembeli punya jalur bantuan yang jelas tanpa harus menebak harus mulai dari mana.</p>
          <Link href="/garansi-retur">Buka kebijakan bantuan</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>{store?.name ?? "Wiragro"}</strong>
          <p>
            {store?.operational_hours
              ? `Jam layanan: ${store.operational_hours}.`
              : "Tim Wiragro tetap bisa dihubungi lewat kontak resmi untuk konfirmasi pesanan, konsultasi, atau bantuan sesudah beli."}
          </p>
          <div className="commerce-trust-strip__card-links">
            {consultationUrl ? (
              <a href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi WhatsApp
              </a>
            ) : (
              <Link href="/kontak">Hubungi tim</Link>
            )}
            {mapsUrl ? (
              <a href={mapsUrl} rel="noreferrer" target="_blank">
                Buka Google Maps
              </a>
            ) : null}
          </div>
        </article>
      </div>
    </section>
  );
}
