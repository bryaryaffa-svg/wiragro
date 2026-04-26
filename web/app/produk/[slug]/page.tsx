import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard } from "@/components/article-card";
import { B2BInquiryForm } from "@/components/b2b-inquiry-form";
import { CommerceIntentLink } from "@/components/commerce-intent-link";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { ContentRelationAlert } from "@/components/content-relation-alert";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductDetailView } from "@/components/product-detail-view";
import { ProductReviewSection } from "@/components/product-review-section";
import { SolutionCard } from "@/components/solution-card";
import { VideoCard } from "@/components/ui/video-card";
import { ErrorState } from "@/components/ui/state";
import {
  ApiRequestError,
  getArticles,
  getFallbackStoreProfile,
  getProduct,
  getProductReviews,
  getStoreProfile,
} from "@/lib/api";
import {
  resolveArticleReferences,
  resolveProductReferences,
  resolveSolutionReferences,
} from "@/lib/content-relation-resolver";
import { buildProductPageEnrichment } from "@/lib/product-content";
import {
  buildCommerceIntentCards,
  buildCommerceWhatsAppLink,
  getGrowthBundlesForContext,
} from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  buildUnavailableDetailMetadata,
} from "@/lib/seo";
import { getProductCatalogContext, getSolutionVideos } from "@/lib/solution-experience";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;
const getProductCached = cache(getProduct);

function dedupeProducts<T extends { id: string; slug: string }>(items: T[], currentSlug: string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.id}:${item.slug}`;

    if (item.slug === currentSlug || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function formatWeight(weightGrams: string) {
  const weight = Number(weightGrams || "0");

  if (!Number.isFinite(weight) || weight <= 0) {
    return "-";
  }

  return `${(weight / 1000).toFixed(2)} kg`;
}

function buildProductFaqJsonLd(
  slug: string,
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `/produk/${slug}#faq`,
    mainEntity: questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProductCached(slug);
    return buildProductMetadata(product);
  } catch {
    return buildUnavailableDetailMetadata({
      title: "Produk tidak tersedia",
      description:
        "Detail produk ini belum bisa ditampilkan. Buka katalog Wiragro untuk melihat produk pertanian yang aktif.",
      path: `/produk/${slug}`,
      canonicalPath: "/produk",
      section: "product",
    });
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  let product = null;
  let productUnavailable = false;

  try {
    product = await getProductCached(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status !== 404) {
      productUnavailable = true;
    }
  }

  if (!product && !productUnavailable) {
    notFound();
  }

  if (!product) {
    return (
      <div className="page-stack">
        <ErrorState
          actions={[
            { href: `/produk/${slug}`, label: "Coba lagi" },
            { href: "/produk", label: "Kembali ke katalog", variant: "secondary" },
          ]}
          description="Halaman produk ini masih ada, tetapi detailnya belum dapat ditampilkan dengan aman saat ini."
          eyebrow="Produk belum dapat dimuat"
          title="Produk belum dapat dimuat"
        />
      </div>
    );
  }

  const enrichment = buildProductPageEnrichment(product);
  const productContext = getProductCatalogContext(product);
  const relatedVideos = getSolutionVideos(
    productContext.cropIds[0] ?? "lainnya",
    productContext.problemIds[0] ?? "pertumbuhan-lambat",
  );
  const aiParams = new URLSearchParams();
  if (productContext.cropIds[0]) {
    aiParams.set("crop", productContext.cropIds[0]);
  }
  if (productContext.problemIds[0]) {
    aiParams.set("problem", productContext.problemIds[0]);
  }
  aiParams.set("product", product.slug);
  const aiChatHref = `/ai-chat?${aiParams.toString()}`;

  const [articleFeed, store, complementaryRelations, reviewFeed] = await Promise.all([
    getArticles({ page_size: 40 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 40, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    resolveProductReferences(enrichment.complementaryProductSlugs.slice(0, 3)),
    getProductReviews(product.slug).catch(() => null),
  ]);

  const articleRelations = resolveArticleReferences(
    enrichment.relatedArticleSlugs,
    articleFeed.items,
  );
  const solutionRelations = resolveSolutionReferences(enrichment.relatedSolutionSlugs);
  const relatedArticles = articleRelations.items;
  const relatedSolutions = solutionRelations.items;
  const missingRelations = [
    ...articleRelations.missing,
    ...complementaryRelations.missing,
    ...solutionRelations.missing,
  ];
  const complementaryProducts = dedupeProducts(
    complementaryRelations.items,
    product.slug,
  ).filter(
    (item) => !product.related_products.some((related) => related.id === item.id),
  );
  const comparableProducts = dedupeProducts(product.related_products, product.slug);
  const relatedBundles = getGrowthBundlesForContext(
    {
      commoditySlug: enrichment.commodityLinks[0]?.slug ?? null,
      solutionSlug: enrichment.relatedSolutionSlugs[0] ?? null,
    },
    2,
  );
  const consultationLink = buildCommerceWhatsAppLink({
    phone: store.whatsapp_number,
    storeName: store.name,
    intent: "consultation",
    sourcePath: `/produk/${product.slug}`,
    surface: "product-detail",
    funnelStage: "consider",
    productSlug: product.slug,
    productName: product.name,
    commodityLabel: enrichment.commodityLinks[0]?.label,
  });
  const commerceIntentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: `/produk/${product.slug}`,
    surface: "product-detail",
    productSlug: product.slug,
    productName: product.name,
    bundleTitle: enrichment.bundleSuggestion.title,
    bundleSlug: enrichment.bundleSuggestion.href.split("/").filter(Boolean).pop(),
    commodityLabel: enrichment.commodityLinks[0]?.label,
  });

  return (
    <div className="page-stack">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Produk", path: "/produk" },
            { name: product.name, path: `/produk/${product.slug}` },
          ]),
          buildProductJsonLd(product, reviewFeed),
          buildProductFaqJsonLd(product.slug, enrichment.faq),
        ]}
        id={`product-jsonld-${product.slug}`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/produk">Produk</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <ProductDetailView
        aiChatHref={aiChatHref}
        b2bInquiryHref="#b2b-quote-form"
        b2bInquiryLabel="Butuh penawaran partai"
        consultationLink={consultationLink}
        enrichment={enrichment}
        product={product}
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Deskripsi & cara pakai</span>
            <h2>Produk ini harus terasa sebagai bagian dari solusi, bukan sekadar nama barang.</h2>
            <p>
              Halaman ini menjelaskan fungsi produk, manfaat utama, cara pakai ringkas,
              dan kapan produk ini paling masuk akal dipertimbangkan.
            </p>
          </div>
        </div>

        <div className="product-use-grid">
          <article className="product-insight-card">
            <span className="eyebrow-label">Fungsi produk</span>
            <h3>Ringkasan manfaat utama</h3>
            <p>{product.description || product.summary}</p>
            <ol className="plain-list">
              {enrichment.usageSteps.map((item) => (
                <li key={`${product.slug}-${item}`}>{item}</li>
              ))}
            </ol>
            <p>{enrichment.guidanceNote}</p>
          </article>

          <article className="product-insight-card">
            <span className="eyebrow-label">Cocok untuk tanaman</span>
            <h3>Tanaman dan fase pakai yang paling relevan</h3>
            <div className="product-insight-card__group">
              <strong>Tanaman</strong>
              <div className="product-chip-links">
                {enrichment.commodityLinks.map((item) => (
                  <Link href={item.href} key={`${product.slug}-${item.slug}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="product-insight-card__group">
              <strong>Fase tanam</strong>
              <div className="product-chip-links">
                {enrichment.stageLinks.map((item) => (
                  <Link href={item.href} key={`${product.slug}-${item.slug}`}>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </article>

          <article className="product-insight-card">
            <span className="eyebrow-label">Masalah yang bisa dibantu</span>
            <h3>Masuk ke konteks masalah tanaman yang tepat</h3>
            <div className="product-problem-stack">
              {enrichment.problemLinks.map((item) => (
                <Link className="product-problem-card" href={item.href} key={`${product.slug}-${item.slug}`}>
                  <strong>{item.label}</strong>
                  <p>{item.description}</p>
                </Link>
              ))}
            </div>
          </article>

          <article className="product-insight-card">
            <span className="eyebrow-label">Catatan penggunaan aman</span>
            <h3>Simpan dan gunakan sesuai label produk</h3>
            <div className="product-spec-list">
              <div>
                <span>Kategori</span>
                <strong>{product.category?.name || product.product_type}</strong>
              </div>
              <div>
                <span>Satuan</span>
                <strong>{product.unit}</strong>
              </div>
              <div>
                <span>Berat</span>
                <strong>{formatWeight(product.weight_grams)}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{product.stock_badge.message}</strong>
              </div>
            </div>
            <p>
              Gunakan produk sesuai label resmi, sesuaikan dengan kondisi lapangan, dan
              hindari mengubah pola pakai terlalu agresif tanpa konteks yang cukup.
            </p>
          </article>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">FAQ penggunaan</span>
            <h2>Pertanyaan yang paling mungkin muncul sebelum checkout.</h2>
          </div>
        </div>
        <div className="faq-stack">
          {enrichment.faq.map((item) => (
            <details className="faq-item" key={`${product.slug}-${item.question}`}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <ProductReviewSection
        productId={product.id}
        productName={product.name}
        reviewFeed={reviewFeed}
      />

      <ContentRelationAlert
        actionLabel="Buka Edukasi"
        href="/artikel"
        items={missingRelations}
        title="Sebagian referensi pendukung sedang dilengkapi"
      />

      {relatedVideos.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Video terkait</span>
              <h2>Belajar cepat dari studi kasus, review, dan edukasi yang paling dekat dengan produk ini.</h2>
            </div>
            <Link href="/artikel">Buka edukasi</Link>
          </div>
          <div className="homepage-video-grid">
            {relatedVideos.map((video) => (
              <VideoCard
                category={video.category}
                description={video.description}
                href={video.href}
                key={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ))}
          </div>
        </section>
      ) : null}

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Artikel terkait</span>
              <h2>Edukasi yang membantu user memahami fungsi, cara pakai, dan konteks produk ini.</h2>
            </div>
            <Link href="/artikel">Buka artikel</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedSolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Solusi terkait</span>
              <h2>Masuk ke jalur solusi bila pengunjung datang dari gejala, bukan daftar belanja.</h2>
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

      {comparableProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk untuk masalah serupa</span>
              <h2>Bantu user membandingkan opsi tanpa keluar dari konteks solusi.</h2>
            </div>
          </div>
          <div className="product-grid product-grid--catalog">
            {comparableProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {complementaryProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Sering dibeli bersama</span>
              <h2>Produk pelengkap yang tetap terasa relevan dengan kebutuhan yang sama.</h2>
              <p>{enrichment.bundleSuggestion.description}</p>
            </div>
            <Link href={enrichment.bundleSuggestion.href}>{enrichment.bundleSuggestion.title}</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {complementaryProducts.slice(0, 4).map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedBundles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bundle resmi</span>
              <h2>Butuh paket yang lebih lengkap dari produk ini?</h2>
              <p>
                Produk ini juga punya jalur paket untuk pembeli yang ingin kebutuhan terkait
                langsung terkumpul dalam satu penawaran.
              </p>
            </div>
            <Link href="/belanja/paket">Lihat semua bundle</Link>
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
            <span className="eyebrow-label">Inquiry B2B dari produk ini</span>
            <h2>Butuh volume lebih besar atau pengiriman rutin?</h2>
            <p>
              Jika produk ini sudah sesuai kebutuhan, Anda bisa langsung meminta penawaran awal
              untuk volume, ritme pengiriman, atau diskusi paket yang lebih lengkap.
            </p>
          </div>
          <Link href="/b2b">Halaman B2B penuh</Link>
        </div>
        <B2BInquiryForm
          productSlug={product.slug}
          productName={product.name}
          commoditySlug={enrichment.commodityLinks[0]?.slug}
          defaultCommodityFocus={enrichment.commodityLinks[0]?.label}
          description="Form ini cocok saat Anda datang dari halaman produk dan sudah tahu SKU yang ingin dibahas, tetapi masih butuh estimasi volume, ritme pengiriman, atau kombinasi item."
          eyebrowLabel="Inquiry produk"
          heading="Ajukan penawaran awal dari produk ini."
          sourcePage={`/produk/${product.slug}`}
          submitLabel="Ajukan penawaran produk ini"
          summaryPlaceholder="Jelaskan volume produk ini, kebutuhan rutin atau proyek, area kirim, dan keputusan apa yang ingin Anda capai dari penawaran ini."
        />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Trust, repeat order, dan bantuan</span>
            <h2>Lengkapi rasa aman setelah pembeli yakin dengan produk dan alur belinya.</h2>
          </div>
        </div>

        <div className="product-trust-layout">
          <div className="product-trust-grid">
            {enrichment.trustPoints.map((item) => (
              <article className="storefront-trust-card" key={`${product.slug}-${item.title}`}>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </article>
            ))}
          </div>

          <aside className="product-repeat-panel">
            <span className="eyebrow-label">Repeat order & layanan sesudah beli</span>
            <h3>{enrichment.repeatOrderTitle}</h3>
            <p>{enrichment.repeatOrderBody}</p>
            <div className="homepage-trust-panel__actions">
              <Link className="btn btn-secondary" href="/wishlist">
                Simpan untuk repeat order
              </Link>
              <Link className="btn btn-secondary" href="/lacak-pesanan">
                Lacak pesanan
              </Link>
              <Link className="btn btn-secondary" href="/pengiriman-pembayaran">
                Pengiriman & pembayaran
              </Link>
              <Link className="btn btn-secondary" href="/garansi-retur">
                Garansi & retur
              </Link>
              {consultationLink ? (
                <CommerceIntentLink
                  className="btn btn-primary"
                  href={consultationLink.href}
                  leadRef={consultationLink.leadRef}
                  leadSummary={consultationLink.leadSummary}
                  tracking={consultationLink.tracking}
                >
                  Konsultasi WhatsApp
                </CommerceIntentLink>
              ) : (
                <Link className="btn btn-primary" href="/kontak">
                  Hubungi tim
                </Link>
              )}
            </div>
          </aside>
        </div>
      </section>

      {commerceIntentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan WhatsApp</span>
              <h2>Pilih jalur bantuan yang paling cocok dari halaman produk ini.</h2>
              <p>
                Konsultasi produk tetap muncul di panel beli utama. Section ini dikhususkan
                untuk dua kebutuhan yang lebih spesifik: rekomendasi kombinasi dan repeat order via WhatsApp.
              </p>
            </div>
            <Link href={enrichment.bundleSuggestion.href}>{enrichment.bundleSuggestion.title}</Link>
          </div>
          <CommerceIntentGrid items={commerceIntentCards} />
        </section>
      ) : null}
    </div>
  );
}
