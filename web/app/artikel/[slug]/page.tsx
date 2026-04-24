import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import {
  type ProductSummary,
  getArticle,
  getArticles,
  getFallbackStoreProfile,
  getProducts,
  getStoreProfile,
} from "@/lib/api";
import { buildArticleTaxonomyLinks, getRelatedArticles } from "@/lib/article-content";
import { buildWhatsAppConsultationUrl } from "@/lib/homepage-content";
import {
  buildArticleJsonLd,
  buildArticleMetadata,
  buildBreadcrumbJsonLd,
  buildUnavailableDetailMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

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

  const [articleFeed, store, productQueryResults] = await Promise.all([
    getArticles({ page_size: 30 }).catch(() => ({ items: [], pagination: { page: 1, page_size: 30, count: 0 } })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    Promise.allSettled(
      (article.related_product_queries ?? [])
        .slice(0, 3)
        .map((query) => getProducts({ q: query, page_size: 4 })),
    ),
  ]);

  const relatedArticles = getRelatedArticles(article, articleFeed.items, 3);
  const relatedProducts = dedupeProducts(
    productQueryResults.flatMap((result) =>
      result.status === "fulfilled" ? result.value.items : [],
    ),
  ).slice(0, 4);
  const taxonomyLinks = buildArticleTaxonomyLinks(article);
  const consultationUrl = buildWhatsAppConsultationUrl(store.whatsapp_number, store.name);
  const commodityHref = article.related_commodity
    ? `/komoditas/${article.related_commodity.slug}`
    : "/komoditas";

  return (
    <article className="content-shell article-detail-shell">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: article.title,
            description: article.excerpt,
            path: `/artikel/${slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Artikel", path: "/artikel" },
            { name: article.title, path: `/artikel/${slug}` },
          ]),
          buildArticleJsonLd(article, slug),
        ]}
        id={`article-jsonld-${slug}`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/artikel">Artikel</Link>
        <span>/</span>
        <span>{article.title}</span>
      </div>

      <section className="article-detail-hero">
        <div className="article-detail-hero__copy">
          <span className="eyebrow-label">Belajar</span>
          <h1>{article.title}</h1>
          {article.excerpt ? <p>{article.excerpt}</p> : null}
          <div className="article-detail-hero__meta">
            <span>{article.reading_time_minutes ? `${article.reading_time_minutes} menit baca` : "Artikel edukasi"}</span>
            <span>{article.user_goal_summary}</span>
          </div>
          {taxonomyLinks.length ? (
            <div className="article-detail-hero__chips">
              {taxonomyLinks.map((item) => (
                <Link href={item.href} key={`${slug}-${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="article-detail-hero__aside">
          <span className="eyebrow-label">Inti artikel</span>
          <strong>Apa yang akan user dapatkan dari halaman ini</strong>
          {article.key_takeaways?.length ? (
            <ul className="plain-list">
              {article.key_takeaways.map((item) => (
                <li key={`${slug}-${item}`}>{item}</li>
              ))}
            </ul>
          ) : null}
        </aside>
      </section>

      <div className="article-detail-grid">
        <div
          className="rich-content"
          dangerouslySetInnerHTML={{ __html: article.body_html }}
        />

        <aside className="article-detail-sidebar">
          <article className="article-detail-sidebar__card">
            <span className="eyebrow-label">CTA solusi</span>
            <strong>{article.related_solution?.label ?? "Cari solusi terkait"}</strong>
            <p>{article.related_solution?.description ?? "Pindahkan pembaca ke jalur problem-solving yang lebih praktis."}</p>
            <Link className="btn btn-primary" href={article.related_solution?.href ?? "/solusi"}>
              Buka halaman solusi
            </Link>
          </article>

          <article className="article-detail-sidebar__card">
            <span className="eyebrow-label">CTA komoditas</span>
            <strong>{article.related_commodity?.label ?? "Komoditas terkait"}</strong>
            <p>{article.related_commodity?.description ?? "Jelajahi konten berdasarkan komoditas yang paling terkait."}</p>
            <Link className="btn btn-secondary" href={commodityHref}>
              Lihat komoditas terkait
            </Link>
          </article>

          <article className="article-detail-sidebar__card">
            <span className="eyebrow-label">CTA konsultasi</span>
            <strong>Konsultasi langsung bila user masih ragu.</strong>
            <p>
              Konten edukasi yang sehat tetap memberi jalan cepat ke toko saat user butuh
              bantuan memilih langkah berikutnya.
            </p>
            {consultationUrl ? (
              <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi WhatsApp
              </a>
            ) : (
              <Link className="btn btn-primary" href="/kontak">
                Hubungi toko
              </Link>
            )}
          </article>
        </aside>
      </div>

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Artikel terkait</span>
              <h2>Lanjutkan dari konteks yang paling dekat.</h2>
            </div>
            <Link href="/artikel">Lihat semua artikel</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((related) => (
              <ArticleCard article={related} href={`/artikel/${related.slug}`} key={related.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk terkait</span>
              <h2>Produk yang paling masuk akal setelah user memahami konteksnya.</h2>
            </div>
            <Link href="/belanja">Masuk ke hub Belanja</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
