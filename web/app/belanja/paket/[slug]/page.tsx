import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { B2BInquiryForm } from "@/components/b2b-inquiry-form";
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
  const commoditySlug =
    bundle.relatedCommoditySlugs.length === 1 ? bundle.relatedCommoditySlugs[0] : undefined;
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: `/belanja/paket/${bundle.slug}`,
    surface: "bundle-detail",
    bundleSlug: bundle.slug,
    bundleTitle: bundle.title,
    commodityLabel,
  });
  const purchaseDisabledReason = resolvedBundle.isFullyPurchasable
    ? null
    : resolvedBundle.catalogCoverage === "snapshot"
      ? "Paket ini masih ditampilkan sebagai referensi kebutuhan, jadi checkout langsung belum tersedia."
      : "Sebagian item paket belum siap diproses langsung, jadi checkout paket lengkap masih ditahan dulu.";
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
                {pricingPreview.skuCount} SKU tetap | {pricingPreview.itemCount} item
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
            <Link className="btn btn-secondary" href="#b2b-quote-form">
              Ajukan penawaran awal
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
              <strong>{bundle.pricing.priceStatus === "mock" ? "Estimasi awal" : "Terkonfirmasi"}</strong>
            </div>
            <div>
              <span>Cakupan katalog</span>
              <strong>
                {resolvedBundle.catalogCoverage === "full"
                  ? "Semua item aktif"
                  : resolvedBundle.catalogCoverage === "partial"
                    ? "Sebagian item aktif"
                    : "Referensi paket"}
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
                  {item.source === "catalog" ? "Tersambung ke katalog" : "Referensi paket"}
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
        actionLabel="Buka Edukasi"
        href="/artikel"
        items={missingRelations}
        title="Sebagian referensi bundle sedang dilengkapi"
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kenapa paket ini membantu</span>
            <h2>Paket ini merangkum kebutuhan yang sering dibeli bersama.</h2>
            <p>
              Halaman ini merangkum isi paket, edukasi pendukung, solusi terkait, dan jalur
              bantuan beli dalam satu alur yang lebih mudah dipahami.
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

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Penawaran awal untuk paket</span>
            <h2>Kebutuhan volume bisa diajukan dari paket ini tanpa memulai dari form kosong.</h2>
            <p>
              Form ini otomatis membawa konteks paket, halaman sumber, dan komoditas utama
              agar tim Wiragro bisa menyiapkan penawaran awal yang lebih mudah dipahami.
            </p>
          </div>
          <Link href="/b2b">Halaman B2B penuh</Link>
        </div>
        <B2BInquiryForm
          bundleSlug={bundle.slug}
          bundleTitle={bundle.title}
          commoditySlug={commoditySlug}
          defaultCommodityFocus={commodityLabel}
          description="Jalur ini cocok untuk toko pertanian, kebutuhan kebun, atau pembelian rutin yang ingin membahas volume paket ini tanpa harus menyusun inquiry ulang dari nol."
          heading="Ajukan kebutuhan volume dari bundle ini."
          eyebrowLabel="Inquiry bundle"
          sourcePage={`/belanja/paket/${bundle.slug}`}
          submitLabel="Ajukan penawaran paket ini"
          summaryPlaceholder="Jelaskan kebutuhan volume paket ini, lokasi kirim, jadwal pengadaan, atau kombinasi item yang masih perlu disesuaikan."
        />
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan WhatsApp</span>
              <h2>Butuh arahan cepat sebelum memilih jalur berikutnya?</h2>
            </div>
            <Link href="/kontak">Kontak tim</Link>
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
                  ? `${resolvedBundle.missingItemCount} item lain masih ditampilkan sebagai referensi paket sambil menunggu sinkron katalog selesai.`
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
              <h2>Artikel yang membantu pembeli paham sebelum membeli paket ini.</h2>
            </div>
            <Link href="/artikel">Buka Edukasi</Link>
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
            <span className="eyebrow-label">Sinyal kepercayaan</span>
            <h2>Sinyal awal untuk menilai kecocokan paket ini.</h2>
            <p>
              Saat review publik bundle belum tersedia, halaman ini menampilkan konteks
              penggunaan, bantuan tim, serta relasi ke solusi dan artikel sebagai dasar pertimbangan.
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
