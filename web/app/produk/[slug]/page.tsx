import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard } from "@/components/article-card";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { ContentRelationAlert } from "@/components/content-relation-alert";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { ProductDetailView } from "@/components/product-detail-view";
import { ProductReviewSection } from "@/components/product-review-section";
import { SolutionCard } from "@/components/solution-card";
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
import {
  buildProductConsultationUrl,
  buildProductPageEnrichment,
} from "@/lib/product-content";
import { buildCommerceIntentCards, getGrowthBundlesForContext } from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildProductJsonLd,
  buildProductMetadata,
  buildUnavailableDetailMetadata,
} from "@/lib/seo";

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
        <article className="empty-state empty-state--shopping">
          <span className="eyebrow-label">Produk belum bisa dibuka</span>
          <h1>Detail produk gagal dimuat dari server.</h1>
          <p>
            Halaman produk ini tidak hilang, tetapi data detailnya sedang tidak berhasil
            diambil. Silakan kembali ke katalog atau coba lagi beberapa saat lagi.
          </p>
          <div className="empty-state__actions">
            <Link className="btn btn-primary" href="/produk">
              Kembali ke katalog
            </Link>
          </div>
        </article>
      </div>
    );
  }

  const enrichment = buildProductPageEnrichment(product);

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
  const consultationUrl = buildProductConsultationUrl(
    store.whatsapp_number,
    store.name,
    product.name,
  );
  const commerceIntentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    productName: product.name,
    bundleTitle: enrichment.bundleSuggestion.title,
    commodityLabel: enrichment.commodityLinks[0]?.label,
  }).filter((item) => item.title !== "Minta campaign landing");

  return (
    <div className="page-stack">
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Produk", path: "/produk" },
            { name: product.name, path: `/produk/${product.slug}` },
          ]),
          buildProductJsonLd(product),
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
        consultationUrl={consultationUrl}
        enrichment={enrichment}
        product={product}
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Cara pakai & kecocokan</span>
            <h2>Bantu user memahami kapan produk ini masuk akal untuk dipakai.</h2>
            <p>
              PDP ini sengaja menjelaskan fungsi produk, fase pakai, komoditas yang relevan,
              dan problem yang bisa dibantu sebelum user diarahkan terlalu cepat ke checkout.
            </p>
          </div>
        </div>

        <div className="product-use-grid">
          <article className="product-insight-card">
            <span className="eyebrow-label">Cara pakai</span>
            <h3>Urutan penggunaan yang lebih aman</h3>
            <ol className="plain-list">
              {enrichment.usageSteps.map((item) => (
                <li key={`${product.slug}-${item}`}>{item}</li>
              ))}
            </ol>
            <p>{enrichment.guidanceNote}</p>
          </article>

          <article className="product-insight-card">
            <span className="eyebrow-label">Cocok untuk</span>
            <h3>Komoditas dan fase yang paling relevan</h3>
            <div className="product-insight-card__group">
              <strong>Komoditas</strong>
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
            <span className="eyebrow-label">Masalah yang dibantu</span>
            <h3>Jembatan produk ke jalur solusi</h3>
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
            <span className="eyebrow-label">Spesifikasi ringkas</span>
            <h3>Data dasar sebelum user membeli</h3>
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
            {product.videos.length ? (
              <ul className="plain-list">
                {product.videos.map((video) => (
                  <li key={video.id}>
                    <a href={video.url} rel="noreferrer" target="_blank">
                      Lihat video {video.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Belum ada video panduan. Untuk tahap sekarang, konsultasi toko menjadi jalur tercepat
                bila user ingin memastikan cara pakai sebelum membeli.
              </p>
            )}
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
        actionLabel="Masuk ke Belajar"
        href="/belajar"
        items={missingRelations}
        title="Sebagian relasi PDP belum lengkap"
      />

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Artikel terkait</span>
              <h2>Edukasi yang membantu user memahami kenapa produk ini relevan.</h2>
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
              <h2>Masuk ke jalur problem-solving bila user datang dari gejala, bukan daftar belanja.</h2>
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
              <span className="eyebrow-label">Alternatif sejenis</span>
              <h2>Bantu user membandingkan tanpa keluar dari flow conversion.</h2>
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
              <span className="eyebrow-label">Produk pelengkap</span>
              <h2>Cross-sell dan bundling yang terasa masuk akal, bukan dipaksakan.</h2>
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
              <h2>PDP ini sekarang punya jalur bundle yang lebih eksplisit untuk cross-sell.</h2>
              <p>
                Ini membuat produk tidak berhenti sebagai item tunggal. User bisa naik ke
                paket yang lebih lengkap bila kebutuhan belinya memang sudah berkembang.
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
            <span className="eyebrow-label">Trust, review beta, dan repeat order</span>
            <h2>Bangun rasa aman sambil social proof tumbuh secara bertahap.</h2>
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
            <span className="eyebrow-label">Repeat order & validasi awal</span>
            <h3>{enrichment.repeatOrderTitle}</h3>
            <p>{enrichment.repeatOrderBody}</p>
            <div className="product-review-placeholder">
              <strong>{enrichment.reviewPlaceholder.title}</strong>
              <p>{enrichment.reviewPlaceholder.body}</p>
              <ul className="plain-list">
                {enrichment.reviewPlaceholder.bullets.map((item) => (
                  <li key={`${product.slug}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
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
              {consultationUrl ? (
                <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                  Konsultasi WhatsApp
                </a>
              ) : (
                <Link className="btn btn-primary" href="/kontak">
                  Hubungi toko
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
              <span className="eyebrow-label">Assisted checkout</span>
              <h2>Fase 3 membuat PDP siap untuk konsultasi, repeat order, dan inquiry partai.</h2>
            </div>
            <Link href={enrichment.bundleSuggestion.href}>{enrichment.bundleSuggestion.title}</Link>
          </div>
          <CommerceIntentGrid items={commerceIntentCards} />
        </section>
      ) : null}
    </div>
  );
}
