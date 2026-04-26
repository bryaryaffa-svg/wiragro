import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard, pickArticleVisual } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { TrustBadge } from "@/components/ui/trust-badge";
import { SectionHeader } from "@/components/ui/section-header";
import { SecondaryButton } from "@/components/ui/button";
import { VideoCard } from "@/components/ui/video-card";
import { EmptyState } from "@/components/ui/state";
import { formatDate } from "@/lib/format";
import { getRelatedArticles } from "@/lib/article-content";
import {
  buildArticleGuideSections,
  getRecommendedProductsForArticle,
  getRelatedEducationVideosForArticle,
} from "@/lib/education-content";
import {
  type ProductSummary,
  getArticle,
  getArticles,
  getProducts,
} from "@/lib/api";
import {
  buildArticleJsonLd,
  buildArticleMetadata,
  buildBreadcrumbJsonLd,
  buildUnavailableDetailMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildProductSolutionHref,
  resolveSolutionSelection,
} from "@/lib/solution-experience";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

const getArticleCached = cache(getArticle);

function dedupeProducts(products: Array<ProductSummary | null | undefined>) {
  return products
    .filter((product): product is ProductSummary => Boolean(product))
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const article = await getArticleCached(slug);
    return buildArticleMetadata(article, slug);
  } catch {
    return buildUnavailableDetailMetadata({
      title: "Artikel belum tersedia",
      description:
        "Detail artikel ini belum dipublikasikan. Buka pusat edukasi Wiragro untuk melihat materi yang sudah tersedia.",
      path: `/artikel/${slug}`,
      canonicalPath: "/artikel",
      section: "article",
    });
  }
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticleCached(slug).catch(() => null);

  if (!article) {
    notFound();
  }

  const [articleFeed, productFeed, productQueries] = await Promise.all([
    getArticles({ page_size: 30 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 30, count: 0 },
    })),
    getProducts({ page_size: 24, sort: "best_seller" }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 24, count: 0 },
      available_filters: {},
      seo: {},
    })),
    Promise.allSettled(
      (article.related_product_queries ?? [])
        .slice(0, 3)
        .map((query) => getProducts({ q: query, page_size: 4 })),
    ),
  ]);

  const relatedArticles = getRelatedArticles(article, articleFeed.items, 3);
  const recommendedPool = dedupeProducts([
    ...productFeed.items,
    ...productQueries.flatMap((result) =>
      result.status === "fulfilled" ? result.value.items : [],
    ),
  ]);
  const recommendedProducts = dedupeProducts([
    ...getRecommendedProductsForArticle(article, recommendedPool, 4).map((item) => item.product),
    ...recommendedPool,
  ]).slice(0, 4);
  const relatedVideos = getRelatedEducationVideosForArticle(article, 2);
  const featuredVideo = relatedVideos[0] ?? null;
  const guideSections = buildArticleGuideSections(article);
  const selection = resolveSolutionSelection({
    komoditas: article.taxonomy?.commodities[0],
    gejala: article.taxonomy?.symptoms[0],
  });
  const aiParams = new URLSearchParams();
  if (selection.cropId) {
    aiParams.set("crop", selection.cropId);
  }
  if (selection.problemId) {
    aiParams.set("problem", selection.problemId);
  }
  const aiHref = aiParams.toString() ? `/ai-chat?${aiParams.toString()}` : "/ai-chat";
  const solutionHref = article.related_solution?.href ?? "/solusi";
  const productHref = buildProductSolutionHref(selection.cropId, selection.problemId);
  const articleVisual = pickArticleVisual(article);

  return (
    <article className="page-stack article-guide-page">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: article.title,
            description: article.excerpt ?? "Panduan edukasi pertanian dari Wiragro.",
            path: `/artikel/${slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Edukasi", path: "/artikel" },
            { name: article.title, path: `/artikel/${slug}` },
          ]),
          buildArticleJsonLd(article, slug),
        ]}
        id={`article-jsonld-${slug}`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/artikel">Edukasi</Link>
        <span>/</span>
        <span>{article.title}</span>
      </div>

      <section className="article-guide-hero">
        <div className="article-guide-hero__copy">
          <span className="eyebrow-label">Panduan praktis</span>
          <h1>{article.title}</h1>
          <p>{article.excerpt || "Panduan ini disusun untuk membantu Anda memahami masalah tanaman dengan lebih sederhana."}</p>
          <div className="article-guide-hero__meta">
            <span>{article.reading_time_minutes ? `${article.reading_time_minutes} menit baca` : "Artikel edukasi"}</span>
            <span>{formatDate(article.published_at)}</span>
          </div>
          {article.taxonomy_labels?.length ? (
            <div className="article-guide-hero__chips">
              {article.taxonomy_labels.map((label) => (
                <span key={`${article.slug}-${label}`}>{label}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="article-guide-hero__media">
          <Image
            alt={article.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 36vw"
            src={articleVisual}
          />
        </div>
      </section>

      <section className="article-guide-body">
        <div className="article-guide-sections">
          {guideSections.map((section) => (
            <article className="article-guide-section" key={`${article.slug}-${section.title}`}>
              <h2>{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={`${section.title}-${paragraph}`}>{paragraph}</p>
              ))}
            </article>
          ))}

          <article className="article-guide-section article-guide-section--rich">
            <h2>Penjelasan lapangan</h2>
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: article.body_html }} />
          </article>
        </div>

        <aside className="article-guide-sidebar">
          <article className="article-guide-sidebar__card">
            <span className="eyebrow-label">Ringkasan artikel</span>
            <strong>{article.user_goal_summary || "Panduan ini membantu Anda memahami konteks sebelum memilih tindakan."}</strong>
            {article.key_takeaways?.length ? (
              <ul className="plain-list">
                {article.key_takeaways.map((item) => (
                  <li key={`${article.slug}-${item}`}>{item}</li>
                ))}
              </ul>
            ) : null}
          </article>

          <article className="article-guide-sidebar__card">
            <span className="eyebrow-label">Arah berikutnya</span>
            <strong>Ingin rekomendasi lebih cepat?</strong>
            <p>Masuk ke halaman solusi agar tanaman dan masalah Anda dibaca dengan alur yang lebih terarah.</p>
            <SecondaryButton href={solutionHref}>Cari Solusi Tanaman</SecondaryButton>
          </article>

          <article className="article-guide-sidebar__card">
            <div className="article-guide-sidebar__badge">
              <TrustBadge icon="ai" label="Premium Feature" tone="accent" />
            </div>
            <strong>Butuh analisis lebih personal?</strong>
            <p>AI Pertanian Wiragro membantu menyusun dugaan awal, langkah penanganan, dan rekomendasi produk yang lebih relevan.</p>
            <SecondaryButton href={aiHref}>Tanya AI Pertanian</SecondaryButton>
          </article>
        </aside>
      </section>

      <section className="section-block">
        <SectionHeader
          description="Jika video yang sangat spesifik belum tersedia, kami tetap memberi arah ke studi kasus dan review yang paling dekat."
          eyebrow="Video terkait"
          title="Belajar dari studi kasus dan review lapangan"
        />

        {featuredVideo?.youtubeId ? (
          <div className="article-video-shell">
            <div className="article-video-embed">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                src={`https://www.youtube.com/embed/${featuredVideo.youtubeId}`}
                title={featuredVideo.title}
              />
            </div>
            <div className="article-video-shell__meta">
              <strong>{featuredVideo.title}</strong>
              <p>{featuredVideo.description}</p>
            </div>
          </div>
        ) : (
          <div className="article-video-placeholder">
            <strong>Video terkait akan segera tersedia</strong>
            <p>
              Tim Wiragro sedang menyiapkan studi kasus atau review produk yang paling dekat dengan panduan ini.
              Sementara itu, Anda masih bisa lanjut ke solusi, AI, atau produk yang relevan.
            </p>
            <div className="article-video-placeholder__actions">
              <SecondaryButton href={solutionHref}>Cari solusi</SecondaryButton>
              <SecondaryButton href={aiHref}>Tanya AI</SecondaryButton>
            </div>
          </div>
        )}

        {relatedVideos.length ? (
          <div className="education-video-grid">
            {relatedVideos.map((video) => (
              <VideoCard
                category={video.category}
                ctaLabel={video.youtubeId ? "Tonton" : "Lihat panduan"}
                description={video.description}
                href={video.href}
                key={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: productHref, label: "Lihat produk terkait", variant: "secondary" }}
          description="Produk dipilih dari tag masalah, tanaman, dan konteks artikel agar tetap terasa sebagai bagian dari solusi."
          eyebrow="Produk rekomendasi"
          title="Produk yang relevan dengan panduan ini"
        />

        {recommendedProducts.length ? (
          <div className="product-grid product-grid--catalog">
            {recommendedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            actions={[
              { href: "/produk", label: "Lihat semua produk" },
              { href: aiHref, label: "Tanya AI", variant: "secondary" },
            ]}
            description="Katalog rekomendasi untuk panduan ini masih dilengkapi. Anda tetap bisa lanjut ke katalog umum atau minta arahan awal lewat AI."
            eyebrow="Produk terkait belum tersedia"
            headingLevel="h2"
            title="Produk terkait belum tersedia"
          />
        )}
      </section>

      <section className="article-cta-grid">
        <article className="article-cta-card">
          <span className="eyebrow-label">CTA solusi</span>
          <h2>Ingin rekomendasi lebih cepat?</h2>
          <p>
            Gunakan halaman Solusi Wiragro untuk memilih tanaman dan masalah, lalu dapatkan arah penanganan dan produk yang paling dekat dengan kondisi lapangan.
          </p>
          <SecondaryButton href={solutionHref}>Cari Solusi Tanaman</SecondaryButton>
        </article>

        <article className="article-cta-card article-cta-card--accent">
          <div className="article-cta-card__badge">
            <TrustBadge icon="ai" label="Premium Feature" tone="accent" />
          </div>
          <h2>Butuh analisis lebih personal?</h2>
          <p>
            AI Pertanian Wiragro membantu menyusun dugaan awal, gejala yang perlu dicek, langkah penanganan, dan referensi produk atau edukasi yang masih relevan.
          </p>
          <SecondaryButton href={aiHref}>Tanya AI Pertanian</SecondaryButton>
        </article>
      </section>

      {relatedArticles.length ? (
        <section className="section-block">
          <SectionHeader
            action={{ href: "/artikel", label: "Lihat semua edukasi", variant: "secondary" }}
            description="Artikel lain yang masih satu konteks agar pembaca bisa melanjutkan riset tanpa kehilangan arah."
            eyebrow="Artikel terkait"
            title="Lanjutkan dari panduan yang paling dekat"
          />
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((related) => (
              <ArticleCard article={related} href={`/artikel/${related.slug}`} key={related.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
