import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { BundlePurchaseActions } from "@/components/bundle-purchase-actions";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { ContentRelationAlert } from "@/components/content-relation-alert";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProofSignalGrid } from "@/components/proof-signal-grid";
import { SolutionCard } from "@/components/solution-card";
import {
  getArticles,
  getFallbackStoreProfile,
  getStoreProfile,
} from "@/lib/api";
import { resolveGrowthBundleCatalog } from "@/lib/bundle-catalog";
import {
  resolveArticleReferences,
  resolveSolutionReferences,
} from "@/lib/content-relation-resolver";
import {
  buildCommerceIntentCards,
  getGrowthBundle,
  getGrowthBundleKindLabel,
  getRelatedGrowthBundles,
} from "@/lib/growth-commerce";
import { formatCurrency } from "@/lib/format";
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
  const bundle = getGrowthBundle(slug);

  if (!bundle) {
    return buildCatalogMetadata({
      title: "Bundle tidak tersedia",
      description: "Bundle yang Anda cari belum tersedia di Wiragro.",
      path: `/belanja/paket/${slug}`,
      canonicalPath: "/belanja/paket",
      noIndex: true,
    });
  }

  return buildCatalogMetadata({
    title: `${bundle.title} | Bundle Pertanian`,
    description: bundle.description,
    path: `/belanja/paket/${slug}`,
    canonicalPath: `/belanja/paket/${slug}`,
    keywords: [
      bundle.title,
      bundle.sku,
      "bundle pertanian",
      "paket pertanian",
      ...bundle.relatedCommoditySlugs,
    ],
  });
}

export default async function BundleDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const bundle = getGrowthBundle(slug);

  if (!bundle) {
    notFound();
  }

  const [articleFeed, store, resolvedBundle] = await Promise.all([
    getArticles({ page_size: 60 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 60, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    resolveGrowthBundleCatalog(bundle),
  ]);

  const articleRelations = resolveArticleReferences(
    bundle.relatedArticleSlugs,
    articleFeed.items,
  );
  const solutionRelations = resolveSolutionReferences(bundle.relatedSolutionSlugs);
  const relatedArticles = articleRelations.items;
  const relatedSolutions = solutionRelations.items;
  const missingRelations = [
    ...articleRelations.missing,
    ...solutionRelations.missing,
  ];
  const relatedBundles = getRelatedGrowthBundles(bundle, 3);
  const commodityLabel =
    bundle.relatedCommoditySlugs.length === 1
      ? bundle.relatedCommoditySlugs[0].replace(/-/g, " ")
      : undefined;
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    bundleTitle: bundle.title,
    commodityLabel,
    includeCampaign: bundle.kind === "commodity",
  });
  const purchaseDisabledReason = resolvedBundle.isFullyPurchasable
    ? null
    : resolvedBundle.catalogCoverage === "snapshot"
      ? "Bundle ini belum tersambung ke katalog aktif penuh. Lengkapi slug produk di backend agar CTA bundle bisa dipakai end-to-end."
      : "Sebagian SKU bundle belum aktif atau belum tersambung ke katalog, jadi pembelian massal masih ditahan dulu.";
  const pricingPreview = resolvedBundle.pricingPreview;

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${bundle.title} | Bundle Pertanian`,
            description: bundle.description,
            path: `/belanja/paket/${bundle.slug}`,
          }),
          buildCollectionJsonLd({
            title: bundle.title,
            description: bundle.description,
            path: `/belanja/paket/${bundle.slug}`,
            itemUrls: [
              ...resolvedBundle.connectedProducts.map((product) => `/produk/${product.slug}`),
              ...relatedArticles.map((article) => `/artikel/${article.slug}`),
              ...relatedSolutions.map((solution) => `/solusi/masalah/${solution.slug}`),
            ],
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Belanja", path: "/belanja" },
            { name: "Paket", path: "/belanja/paket" },
            { name: bundle.title, path: `/belanja/paket/${bundle.slug}` },
          ]),
        ]}
        id={`bundle-${bundle.slug}-jsonld`}
      />

      <section className="bundle-hero">
        <div className="bundle-hero__copy">
          <div className="breadcrumbs">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/belanja">Belanja</Link>
            <span>/</span>
            <Link href="/belanja/paket">Paket</Link>
            <span>/</span>
            <span>{bundle.title}</span>
          </div>
          <span className="eyebrow-label">{getGrowthBundleKindLabel(bundle.kind)}</span>
          <h1>{bundle.title}</h1>
          <p>{bundle.description}</p>

          <div className="bundle-hero__pricing">
            <article className="bundle-hero__pricing-card">
              <span>Total normal</span>
              <strong>{formatCurrency(pricingPreview.normalTotalAmount)}</strong>
              <small>
                {pricingPreview.skuCount} SKU tetap • {pricingPreview.itemCount} item
              </small>
            </article>
            <article className="bundle-hero__pricing-card bundle-hero__pricing-card--featured">
              <span>Harga bundle</span>
              <strong>{formatCurrency(pricingPreview.bundlePriceAmount)}</strong>
              <small>
                Hemat {formatCurrency(pricingPreview.savingsAmount)}
                {pricingPreview.savingsPercent > 0
                  ? ` (${pricingPreview.savingsPercent}%)`
                  : ""}
              </small>
            </article>
          </div>

          <BundlePurchaseActions
            bundleTitle={bundle.title}
            disabledReason={purchaseDisabledReason}
            items={resolvedBundle.purchasableItems}
          />

          <div className="bundle-hero__actions">
            <Link className="btn btn-secondary" href={bundle.catalogHref}>
              Buka katalog terkait
            </Link>
            <Link className="btn btn-secondary" href="/b2b">
              Minta penawaran B2B
            </Link>
          </div>
        </div>

        <aside className="bundle-hero__aside">
          <span className="eyebrow-label">Offer resmi</span>
          <strong>{bundle.audience}</strong>
          <p>{bundle.summary}</p>
          <div className="bundle-offer-meta">
            <div>
              <span>SKU bundle</span>
              <strong>{bundle.sku}</strong>
            </div>
            <div>
              <span>Status harga</span>
              <strong>{bundle.pricing.priceStatus === "mock" ? "Pilot / mock" : "Terkonfirmasi"}</strong>
            </div>
            <div>
              <span>Cakupan katalog</span>
              <strong>
                {resolvedBundle.catalogCoverage === "full"
                  ? "Penuh"
                  : resolvedBundle.catalogCoverage === "partial"
                    ? "Parsial"
                    : "Snapshot"}
              </strong>
            </div>
          </div>
          <p className="bundle-offer-note">{bundle.pricing.note}</p>
          {bundle.supportingLinks?.length ? (
            <div className="growth-bundle-card__links">
              {bundle.supportingLinks.map((item) => (
                <Link href={item.href} key={`${bundle.slug}-${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Komposisi bundle resmi</span>
            <h2>SKU dan qty paket ini sudah dikunci agar pembelian terasa lebih singkat.</h2>
            <p>
              Semua line item di bawah memakai snapshot harga bundle sebagai baseline.
              Bundle tidak lagi diturunkan dari query produk yang bisa berubah-ubah.
            </p>
          </div>
        </div>

        <div className="bundle-lineup-grid">
          {resolvedBundle.items.map((item) => (
            <article className="bundle-lineup-card" key={`${bundle.slug}-${item.lineId}`}>
              <div className="bundle-lineup-card__top">
                <span className="eyebrow-label">{item.roleLabel}</span>
                <span className="bundle-lineup-card__qty">Qty {item.qty}x</span>
              </div>
              {item.productHref ? (
                <Link className="bundle-lineup-card__title" href={item.productHref}>
                  {item.product.name}
                </Link>
              ) : (
                <strong className="bundle-lineup-card__title">{item.product.name}</strong>
              )}
              <p>{item.notes ?? item.product.summary ?? "Line item resmi di dalam bundle ini."}</p>
              <div className="bundle-lineup-card__meta">
                <span>{item.product.sku}</span>
                <span>{item.product.unit}</span>
                <span>
                  {item.source === "catalog" ? "Tersambung ke katalog" : "Masih snapshot bundle"}
                </span>
              </div>
              <div className="bundle-lineup-card__price">
                {item.lineCompareAtTotalAmount ? (
                  <small>{formatCurrency(item.lineCompareAtTotalAmount)}</small>
                ) : null}
                <strong>{formatCurrency(item.lineNormalTotalAmount)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <ContentRelationAlert
        actionLabel="Buka hub Belajar"
        href="/belajar"
        items={missingRelations}
        title="Sebagian referensi bundle belum lengkap"
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kenapa bundle ini penting</span>
            <h2>Bundle dipakai sebagai growth surface, bukan bundling kosmetik.</h2>
            <p>
              Halaman ini menghubungkan intent user ke komposisi produk, edukasi, solusi,
              dan assisted conversion dalam satu flow yang lebih siap ditutup menjadi transaksi.
            </p>
          </div>
        </div>

        <div className="bundle-outcome-grid">
          {bundle.outcomes.map((item) => (
            <article className="product-detail-benefits__card" key={`${bundle.slug}-${item}`}>
              <strong>{item}</strong>
            </article>
          ))}
        </div>
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">WhatsApp commerce flow</span>
              <h2>Bantu user memilih assisted conversion yang paling tepat.</h2>
            </div>
            <Link href="/kontak">Kontak toko</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}

      {resolvedBundle.connectedProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk katalog aktif</span>
              <h2>Produk yang sudah tersambung ke katalog dan siap diproses di keranjang.</h2>
              <p>
                {resolvedBundle.missingItemCount > 0
                  ? `${resolvedBundle.missingItemCount} SKU lain masih memakai snapshot bundle sampai sinkron katalog selesai.`
                  : "Semua item bundle ini sudah tersambung ke katalog aktif."}
              </p>
            </div>
            <Link href={bundle.catalogHref}>Buka hasil katalog</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {resolvedBundle.connectedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedSolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Solusi terkait</span>
              <h2>Problem-solving yang membuat bundle ini terasa lebih meyakinkan.</h2>
            </div>
            <Link href="/solusi">Buka Cari Solusi</Link>
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
              <span className="eyebrow-label">Edukasi terkait</span>
              <h2>Artikel yang membantu user paham sebelum membeli paket ini.</h2>
            </div>
            <Link href="/belajar">Masuk ke Belajar</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Trust layer</span>
            <h2>Sinyal validasi awal sampai review publik bundle matang.</h2>
            <p>
              Untuk fase sekarang, bundle ini memakai proof signal yang jujur: konteks
              penggunaan, assisted selling, serta relasi ke solusi dan artikel.
            </p>
          </div>
        </div>
        <ProofSignalGrid items={bundle.proofSignals} />
      </section>

      {relatedBundles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bundle lain</span>
              <h2>Bundle lain yang bisa dipakai untuk upsell atau campaign berikutnya.</h2>
            </div>
            <Link href="/belanja/paket">Lihat semua paket</Link>
          </div>
          <div className="growth-bundle-grid">
            {relatedBundles.map((item) => (
              <GrowthBundleCard bundle={item} key={item.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
