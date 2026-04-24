import Link from "next/link";

import { B2BInquiryForm } from "@/components/b2b-inquiry-form";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { JsonLd } from "@/components/json-ld";
import { ProofSignalGrid } from "@/components/proof-signal-grid";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import {
  B2B_OFFERS,
  buildCommerceIntentCards,
  getFeaturedGrowthBundles,
} from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildPageMetadata({
  title: "B2B Inquiry & Pembelian Partai",
  description:
    "Jalur B2B Wiragro untuk kebutuhan kios, reseller, kebun, proyek, dan pembelian rutin yang butuh assisted selling lebih terarah.",
  path: "/b2b",
  canonicalPath: "/b2b",
  section: "static",
  keywords: [
    "b2b pertanian",
    "pembelian partai pertanian",
    "reseller pertanian",
    "kios pertanian",
    "penawaran grosir",
  ],
});

export default async function B2BPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const featuredBundles = getFeaturedGrowthBundles(3);
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    bundleTitle: "paket B2B pertanian",
    includeCampaign: true,
  }).filter((item) => item.title !== "Repeat order via WA");

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "B2B Inquiry & Pembelian Partai",
            description:
              "Jalur B2B ringan untuk kebutuhan partai, belanja kios, dan assisted selling pertanian.",
            path: "/b2b",
          }),
          buildCollectionJsonLd({
            title: "B2B Inquiry Wiragro",
            description:
              "Entry point untuk kebutuhan pembelian partai, kios, reseller, dan proyek pertanian.",
            path: "/b2b",
            itemUrls: featuredBundles.map((bundle) => bundle.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "B2B", path: "/b2b" },
          ]),
        ]}
        id="b2b-page-jsonld"
      />

      <section className="bundle-hero bundle-hero--b2b">
        <div className="bundle-hero__copy">
          <span className="eyebrow-label">B2B</span>
          <h1>Jalur ringan untuk pembelian partai, inquiry kios, dan assisted selling yang lebih siap ditutup.</h1>
          <p>
            B2B page ini sengaja dibuat pragmatis. Ia belum memerlukan sistem grosir penuh,
            tetapi sudah cukup kuat untuk menerima inquiry, mengarahkan ke bundle, menyimpan
            lead ke backend, dan
            menghubungkan user ke WhatsApp dengan intent yang lebih jelas.
          </p>
          <div className="bundle-hero__actions">
            <Link className="btn btn-primary" href="/belanja/paket">
              Lihat paket yang bisa diajukan
            </Link>
            <Link className="btn btn-secondary" href="/belanja">
              Buka hub Belanja
            </Link>
          </div>
        </div>

        <aside className="bundle-hero__aside">
          <span className="eyebrow-label">Kapan dipakai</span>
          <strong>Kios, reseller, proyek kebun, atau kebutuhan rutin yang terlalu berat jika disusun manual dari katalog.</strong>
          <p>
            Gunakan halaman ini untuk menyaring lead yang lebih serius, lalu bawa mereka ke
            bundle, penawaran WhatsApp, atau follow-up manual oleh tim toko.
          </p>
        </aside>
      </section>

      <section className="section-block">
        <B2BInquiryForm sourcePage="/b2b" />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Use case</span>
            <h2>Skenario B2B yang paling realistis untuk diaktifkan sekarang.</h2>
          </div>
        </div>
        <ProofSignalGrid items={B2B_OFFERS.map((offer) => ({
          title: offer.title,
          body: `${offer.description} ${offer.bullets.join(" | ")}`,
        }))} />
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Lead capture</span>
              <h2>Pilih cara masuk yang paling mudah bagi calon pembeli partai.</h2>
            </div>
            <Link href="/kontak">Kontak toko</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Bundle untuk inquiry</span>
            <h2>Mulai percakapan B2B dari paket yang paling mudah dipahami dulu.</h2>
          </div>
          <Link href="/belanja/paket">Semua paket</Link>
        </div>
        <div className="growth-bundle-grid">
          {featuredBundles.map((bundle) => (
            <article className="growth-bundle-card" key={bundle.slug}>
              <span className="eyebrow-label">Bundle siap ajukan</span>
              <strong>{bundle.title}</strong>
              <p>{bundle.description}</p>
              <div className="growth-bundle-card__links">
                {bundle.relatedCommoditySlugs.map((slug) => (
                  <Link href={`/komoditas/${slug}`} key={`${bundle.slug}-${slug}`}>
                    {slug.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
              <Link className="growth-bundle-card__action" href={bundle.href}>
                Buka landing bundle
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
