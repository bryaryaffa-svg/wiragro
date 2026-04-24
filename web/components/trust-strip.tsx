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
  heading = "Beli lebih tenang karena jalur trust dasar selalu terlihat.",
  description = "Layer ini menjaga user tetap tahu bagaimana pengiriman, pembayaran, bantuan toko, dan kebijakan dasar bekerja sebelum atau sesudah checkout.",
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
          <p>Website mendukung delivery dan pickup toko agar user bisa memilih alur pemenuhan yang paling nyaman.</p>
          <Link href="/pengiriman-pembayaran">Lihat opsi pengiriman</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>Pembayaran yang aktif</strong>
          <p>Duitku VA dan COD / nota merah ditampilkan langsung saat checkout agar metode bayar tidak terasa misterius.</p>
          <Link href="/pengiriman-pembayaran">Lihat metode pembayaran</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>Garansi bantuan toko</strong>
          <p>Jika ada kendala order atau produk, user punya jalur bantuan yang jelas sebelum panik atau meninggalkan transaksi.</p>
          <Link href="/garansi-retur">Buka kebijakan bantuan</Link>
        </article>

        <article className="storefront-trust-card">
          <strong>{store?.name ?? "Wiragro"}</strong>
          <p>
            {store?.operational_hours
              ? `Jam operasional: ${store.operational_hours}.`
              : "Toko tetap bisa dihubungi melalui kontak resmi untuk validasi order dan konsultasi."}
          </p>
          <div className="commerce-trust-strip__card-links">
            {consultationUrl ? (
              <a href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi WhatsApp
              </a>
            ) : (
              <Link href="/kontak">Hubungi toko</Link>
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
