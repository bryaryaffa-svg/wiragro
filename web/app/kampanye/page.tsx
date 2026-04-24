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
  title: "Kampanye Musiman & Intent Komersial",
  description:
    "Landing page komersial Wiragro untuk musim, komoditas, dan masalah prioritas yang siap dipakai untuk ads, WA assisted sales, dan SEO intent komersial.",
  path: "/kampanye",
  canonicalPath: "/kampanye",
  keywords: [
    "kampanye pertanian",
    "landing page musiman pertanian",
    "promo komoditas pertanian",
    "landing intent komersial",
  ],
});

export default async function CampaignHubPage() {
  const campaigns = getAllCampaignLandings();
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    bundleTitle: "campaign pertanian",
    includeCampaign: true,
  }).filter((item) => item.title !== "Minta campaign landing");

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Kampanye Musiman & Intent Komersial",
            description:
              "Hub campaign landing page Wiragro untuk musim, komoditas, dan masalah prioritas yang paling dekat dengan intent beli.",
            path: "/kampanye",
          }),
          buildCollectionJsonLd({
            title: "Campaign Landing Wiragro",
            description:
              "Kumpulan landing komersial yang dirancang untuk bundle, assisted sales, dan seasonality.",
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
          <h1>Landing komersial untuk musim, komoditas, dan masalah yang sudah dekat ke transaksi.</h1>
          <p>
            Hub ini dipakai untuk menangkap permintaan musiman dan intent komersial yang
            lebih tajam. Setiap landing menghubungkan bundle, solusi, artikel, produk, dan
            WhatsApp commerce dalam satu halaman yang siap dipakai untuk growth.
          </p>
          <div className="campaign-hero__actions">
            <Link className="btn btn-primary" href="#campaign-grid">
              Lihat landing aktif
            </Link>
            <Link className="btn btn-secondary" href="/belanja/paket">
              Buka paket & bundle
            </Link>
          </div>
        </div>

        <aside className="campaign-hero__aside">
          <span className="eyebrow-label">Peran bisnis</span>
          <strong>Menangkap seasonality, memperkuat SEO komersial, dan memberi permukaan yang lebih siap untuk ads maupun WA assisted sales.</strong>
          <p>
            Campaign bukan hanya banner promo. Ia menjadi landing yang bisa langsung dipakai
            untuk bundle, konsultasi, repeat order, dan inquiry B2B saat momentum permintaan sedang tinggi.
          </p>
        </aside>
      </section>

      <section className="section-block" id="campaign-grid">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Campaign aktif</span>
            <h2>Pilih landing yang paling dekat dengan konteks musim atau problem user.</h2>
            <p>
              Kampanye ini sengaja dibuat lintas intent: ada yang season-first, commodity-first,
              dan problem-first supaya user masuk ke konteks yang tepat lebih cepat.
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
              <span className="eyebrow-label">WhatsApp commerce</span>
              <h2>Campaign juga siap dibantu lewat jalur konsultasi dan assisted selling.</h2>
            </div>
            <Link href="/b2b">B2B inquiry</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
