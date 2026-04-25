import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { B2BInquiryForm } from "@/components/b2b-inquiry-form";
import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { ContentRelationAlert } from "@/components/content-relation-alert";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { SolutionCard } from "@/components/solution-card";
import {
  getArticles,
  getFallbackStoreProfile,
  getStoreProfile,
} from "@/lib/api";
import {
  resolveArticleReferences,
  resolveBundleReferences,
  resolveProductReferences,
  resolveSolutionReferences,
} from "@/lib/content-relation-resolver";
import {
  getCampaignLanding,
  getFeaturedCampaignLandings,
} from "@/lib/campaign-content";
import { buildCommerceIntentCards } from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaignLanding(slug);

  if (!campaign) {
    return buildCatalogMetadata({
      title: "Kampanye tidak tersedia",
      description: "Landing kampanye yang Anda cari belum tersedia.",
      path: `/kampanye/${slug}`,
      canonicalPath: "/kampanye",
      noIndex: true,
    });
  }

  return buildCatalogMetadata({
    title: `${campaign.title} | Kampanye Wiragro`,
    description: campaign.description,
    path: `/kampanye/${campaign.slug}`,
    canonicalPath: `/kampanye/${campaign.slug}`,
      keywords: [
        campaign.title,
        campaign.focusLabel,
        campaign.seasonLabel,
        "program pertanian musiman",
      ],
  });
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const campaign = getCampaignLanding(slug);

  if (!campaign) {
    notFound();
  }

  const [articleFeed, store, productRelations] = await Promise.all([
    getArticles({ page_size: 60 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 60, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    resolveProductReferences(campaign.productSlugs),
  ]);

  const bundleRelations = resolveBundleReferences(campaign.bundleSlugs);
  const articleRelations = resolveArticleReferences(
    campaign.relatedArticleSlugs,
    articleFeed.items,
  );
  const solutionRelations = resolveSolutionReferences(campaign.relatedSolutionSlugs);
  const relatedBundles = bundleRelations.items;
  const relatedArticles = articleRelations.items;
  const relatedSolutions = solutionRelations.items;
  const missingRelations = [
    ...bundleRelations.missing,
    ...articleRelations.missing,
    ...productRelations.missing,
    ...solutionRelations.missing,
  ];
  const relatedProducts = productRelations.items.slice(0, 8);
  const primaryCampaignProduct =
    campaign.productSlugs.length === 1 ? productRelations.items[0] ?? null : null;
  const moreCampaigns = getFeaturedCampaignLandings(3).filter((item) => item.slug !== campaign.slug);
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: `/kampanye/${campaign.slug}`,
    surface: "campaign-detail",
    campaignSlug: campaign.slug,
    campaignTitle: campaign.title,
    commodityLabel: campaign.focusLabel,
  });

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${campaign.title} | Kampanye Wiragro`,
            description: campaign.description,
            path: `/kampanye/${campaign.slug}`,
          }),
          buildCollectionJsonLd({
            title: campaign.title,
            description: campaign.description,
            path: `/kampanye/${campaign.slug}`,
            itemUrls: [
              ...relatedBundles.map((bundle) => bundle.href),
              ...relatedSolutions.map((solution) => `/solusi/masalah/${solution.slug}`),
              ...relatedProducts.map((product) => `/produk/${product.slug}`),
            ],
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Kampanye", path: "/kampanye" },
            { name: campaign.title, path: `/kampanye/${campaign.slug}` },
          ]),
        ]}
        id={`campaign-${campaign.slug}-jsonld`}
      />

      <section className={`campaign-hero campaign-hero--${campaign.theme}`}>
        <div className="campaign-hero__copy">
          <div className="breadcrumbs">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/kampanye">Kampanye</Link>
            <span>/</span>
            <span>{campaign.title}</span>
          </div>
          <span className="eyebrow-label">{campaign.seasonLabel}</span>
          <h1>{campaign.title}</h1>
          <p>{campaign.description}</p>
          <div className="campaign-hero__actions">
            <Link className="btn btn-primary" href={campaign.catalogHref}>
              Lihat produk yang relevan
            </Link>
            <Link className="btn btn-secondary" href="#b2b-quote-form">
              Ajukan penawaran program ini
            </Link>
          </div>
        </div>

        <aside className="campaign-hero__aside">
          <span className="eyebrow-label">Fokus kebutuhan</span>
          <strong>{campaign.audience}</strong>
          <p>{campaign.summary}</p>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kenapa program ini relevan</span>
            <h2>Program ini merangkum kebutuhan musiman dalam satu halaman yang lebih fokus.</h2>
          </div>
        </div>
        <div className="bundle-outcome-grid">
          {campaign.outcomes.map((item) => (
            <article className="product-detail-benefits__card" key={`${campaign.slug}-${item}`}>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      <ContentRelationAlert
        actionLabel="Buka semua program"
        href="/kampanye"
        items={missingRelations}
        title="Sebagian relasi program belum lengkap"
      />

      {relatedBundles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bundle utama</span>
              <h2>Paket utama yang paling relevan untuk program ini.</h2>
            </div>
            <Link href="/belanja/paket">Semua bundle</Link>
          </div>
          <div className="growth-bundle-grid">
            {relatedBundles.map((bundle) => (
              <GrowthBundleCard bundle={bundle} key={bundle.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Penawaran awal dari program ini</span>
            <h2>Ajukan inquiry tanpa kehilangan konteks program ini.</h2>
            <p>
              Anda tidak perlu pindah ke halaman B2B umum. Konteks program dan fokus komoditas
              ikut tersimpan agar tim Wiragro lebih cepat menyiapkan tindak lanjut.
            </p>
          </div>
          <Link href="/b2b">Halaman B2B penuh</Link>
        </div>
        <B2BInquiryForm
          campaignSlug={campaign.slug}
          campaignTitle={campaign.title}
          productSlug={primaryCampaignProduct?.slug}
          productName={primaryCampaignProduct?.name}
          defaultCommodityFocus={campaign.focusLabel}
          description="Gunakan jalur ini saat Anda datang dari momentum program, tetapi membutuhkan estimasi volume, opsi pengiriman, atau kombinasi item sebelum memutuskan pembelian."
          heading="Ajukan penawaran awal dari program ini."
          eyebrowLabel="Inquiry campaign"
          sourcePage={`/kampanye/${campaign.slug}`}
          submitLabel="Ajukan penawaran program"
          summaryPlaceholder="Jelaskan volume kebutuhan dari program ini, target pembelian, area kirim, atau item yang ingin dibandingkan sebelum mengambil keputusan."
        />
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan WhatsApp</span>
              <h2>Masih perlu arahan sebelum memilih produk atau bundle?</h2>
            </div>
            <Link href="/kontak">Kontak tim</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}

      {relatedSolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Solusi pendukung</span>
              <h2>Solusi pendukung yang membantu pembeli memahami konteks kebutuhannya.</h2>
            </div>
            <Link href="/solusi">Cari solusi</Link>
          </div>
          <div className="solution-grid">
            {relatedSolutions.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Artikel pendukung</span>
              <h2>Konten yang membantu pembeli memahami kenapa program ini relevan.</h2>
            </div>
            <Link href="/artikel">Semua artikel</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk relevan</span>
              <h2>Produk tampil setelah pembeli punya konteks program yang cukup.</h2>
            </div>
            <Link href={campaign.catalogHref}>Buka hasil katalog</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {moreCampaigns.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Campaign lain</span>
              <h2>Landing lain yang bisa dipakai untuk momentum, komoditas, atau gejala berbeda.</h2>
            </div>
            <Link href="/kampanye">Semua campaign</Link>
          </div>
          <div className="campaign-grid">
            {moreCampaigns.map((item) => (
              <CampaignSpotlightCard campaign={item} key={item.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
