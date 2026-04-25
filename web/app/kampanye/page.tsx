import Link from "next/link";

import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { JsonLd } from "@/components/json-ld";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { getAllCampaignLandings } from "@/lib/campaign-content";
import { buildCommerceIntentCards } from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildCatalogMetadata({
  title: "Kampanye Musiman & Kebutuhan Prioritas",
  description:
    "Halaman kampanye Wiragro untuk musim, komoditas, dan masalah prioritas agar kebutuhan lebih cepat menemukan solusi dan produk yang relevan.",
  path: "/kampanye",
  canonicalPath: "/kampanye",
  keywords: [
    "kampanye pertanian",
    "landing page musiman pertanian",
    "promo komoditas pertanian",
    "program pertanian musiman",
  ],
});

export default async function CampaignHubPage() {
  const campaigns = getAllCampaignLandings();
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: "/kampanye",
    surface: "campaign-hub",
  });

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Kampanye Musiman & Kebutuhan Prioritas",
            description:
              "Hub campaign Wiragro untuk musim, komoditas, dan masalah prioritas yang paling dekat dengan kebutuhan beli.",
            path: "/kampanye",
          }),
          buildCollectionJsonLd({
            title: "Campaign Landing Wiragro",
            description:
              "Kumpulan halaman kampanye yang dirancang untuk bundle, bantuan tim, dan momentum musiman.",
            path: "/kampanye",
            itemUrls: campaigns.map((campaign) => campaign.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Kampanye", path: "/kampanye" },
          ]),
        ]}
        id="campaign-hub-jsonld"
      />

      <section className="campaign-hero campaign-hero--hub">
        <div className="campaign-hero__copy">
          <span className="eyebrow-label">Kampanye</span>
          <h1>Halaman tematik untuk musim, komoditas, dan masalah yang sudah dekat ke transaksi.</h1>
          <p>
            Hub ini merangkum landing musiman dan problem-first yang membantu pembeli masuk ke
            konteks yang lebih tepat sebelum memilih produk, bundle, atau jalur bantuan beli.
          </p>
          <div className="campaign-hero__actions">
            <Link className="btn btn-primary" href="#campaign-grid">
              Lihat landing aktif
            </Link>
            <Link className="btn btn-secondary" href="/b2b">
              Ajukan inquiry B2B
            </Link>
          </div>
        </div>

        <aside className="campaign-hero__aside">
          <span className="eyebrow-label">Kapan dipakai</span>
          <strong>Dipakai saat kebutuhan sudah dipengaruhi musim, komoditas, atau masalah lapangan yang sedang diprioritaskan.</strong>
          <p>
            Setiap kampanye membantu pembeli melanjutkan ke bundle, konsultasi kontekstual,
            atau inquiry B2B tanpa kehilangan konteks halaman asalnya.
          </p>
        </aside>
      </section>

      <section className="section-block" id="campaign-grid">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Campaign aktif</span>
              <h2>Pilih kampanye yang paling dekat dengan konteks musim atau masalah Anda.</h2>
              <p>
                Ada kampanye musiman, komoditas, dan problem lapangan agar pembeli lebih cepat masuk
              ke konteks yang paling relevan.
            </p>
          </div>
        </div>
        <div className="campaign-grid">
          {campaigns.map((campaign) => (
            <CampaignSpotlightCard campaign={campaign} key={campaign.slug} />
          ))}
        </div>
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan WhatsApp</span>
              <h2>Butuh arahan cepat dari jalur campaign?</h2>
              <p>
                CTA WhatsApp di hub campaign difokuskan untuk membantu memilih landing atau paket
                yang paling tepat sebelum pembeli turun ke halaman detail.
              </p>
            </div>
            <Link href="/b2b">B2B inquiry</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
