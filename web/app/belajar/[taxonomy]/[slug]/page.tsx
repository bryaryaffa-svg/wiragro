import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard } from "@/components/article-card";
import { ArticleTaxonomyDirectory } from "@/components/article-taxonomy-directory";
import { JsonLd } from "@/components/json-ld";
import { getArticles } from "@/lib/api";
import {
  buildArticleTaxonomyBrowseHref,
  filterArticlesByState,
  getArticleTaxonomySectionBySegment,
  getArticleTaxonomyTermBySegment,
  getAvailableArticleTaxonomySlugs,
  type ArticleFilterState,
} from "@/lib/article-content";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildSolutionTaxonomyBrowseHref,
  getSolutionTaxonomyTerm,
} from "@/lib/solution-content";

export const dynamic = "force-dynamic";

type Params = Promise<{ taxonomy: string; slug: string }>;

const getArticleFeed = cache(async () => getArticles({ page_size: 60 }));

function buildState(
  key: Exclude<keyof ArticleFilterState, "q">,
  value: string,
) {
  return { [key]: value } as ArticleFilterState;
}

function getRelatedSolutionHref(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
  slug: string,
) {
  if (queryKey === "komoditas") {
    return buildSolutionTaxonomyBrowseHref("komoditas", slug);
  }

  if (queryKey === "gejala" && getSolutionTaxonomyTerm("gejala", slug)) {
    return buildSolutionTaxonomyBrowseHref("gejala", slug);
  }

  if (queryKey === "fase" && getSolutionTaxonomyTerm("fase", slug)) {
    return buildSolutionTaxonomyBrowseHref("fase", slug);
  }

  return "/solusi";
}

function getRelatedSolutionLabel(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
  label: string,
) {
  if (queryKey === "komoditas") {
    return `Lihat solusi ${label}`;
  }

  if (queryKey === "gejala") {
    return "Buka jalur solusi gejala";
  }

  if (queryKey === "fase") {
    return "Lihat solusi per fase";
  }

  return "Lanjut ke Cari Solusi";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { taxonomy, slug } = await params;
  const section = getArticleTaxonomySectionBySegment(taxonomy);
  const term = getArticleTaxonomyTermBySegment(taxonomy, slug);

  if (!section || !term) {
    return buildArticleListingMetadata({
      title: "Cluster edukasi tidak tersedia",
      description: "Cluster edukasi yang Anda cari belum tersedia di Wiragro.",
      path: `/belajar/${taxonomy}/${slug}`,
      canonicalPath: "/belajar",
      noIndex: true,
    });
  }

  const articleFeed = await getArticleFeed();
  const filteredArticles = filterArticlesByState(articleFeed.items, buildState(section.queryKey, slug));

  if (!filteredArticles.length) {
    return buildArticleListingMetadata({
      title: "Cluster edukasi sedang disiapkan",
      description: "Cluster edukasi ini belum memiliki materi yang siap ditampilkan.",
      path: `/belajar/${taxonomy}/${slug}`,
      canonicalPath: buildArticleTaxonomyBrowseHref(section.queryKey),
      noIndex: true,
    });
  }

  return buildArticleListingMetadata({
    title: `${term.label} | Edukasi Pertanian`,
    description: term.description,
    path: `/belajar/${taxonomy}/${slug}`,
    canonicalPath: `/belajar/${taxonomy}/${slug}`,
    keywords: [
      term.label,
      `edukasi ${term.label.toLowerCase()}`,
      "artikel pertanian",
      "edukasi pertanian",
    ],
  });
}

export default async function LearningTaxonomyDetailPage({
  params,
}: {
  params: Params;
}) {
  const { taxonomy, slug } = await params;
  const section = getArticleTaxonomySectionBySegment(taxonomy);
  const term = getArticleTaxonomyTermBySegment(taxonomy, slug);

  if (!section || !term) {
    notFound();
  }

  const articleFeed = await getArticleFeed();
  const availableSlugs = getAvailableArticleTaxonomySlugs(articleFeed.items);
  const filteredArticles = filterArticlesByState(articleFeed.items, buildState(section.queryKey, slug));

  if (!filteredArticles.length) {
    notFound();
  }

  const featuredArticle = filteredArticles[0] ?? null;
  const articleGrid = filteredArticles.slice(featuredArticle ? 1 : 0);
  const relatedSolutionHref = getRelatedSolutionHref(section.queryKey, slug);
  const commodityHref = section.queryKey === "komoditas" ? `/komoditas/${slug}` : "/komoditas";

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${term.label} | Edukasi Pertanian`,
            description: term.description,
            path: `/belajar/${taxonomy}/${slug}`,
          }),
          buildCollectionJsonLd({
            title: `Cluster Edukasi ${term.label}`,
            description: term.description,
            path: `/belajar/${taxonomy}/${slug}`,
            itemUrls: filteredArticles.map((article) => `/artikel/${article.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Edukasi", path: "/belajar" },
            { name: section.title.replace(/^Berdasarkan /, ""), path: `/belajar/${taxonomy}` },
            { name: term.label, path: `/belajar/${taxonomy}/${slug}` },
          ]),
        ]}
        id={`learning-taxonomy-${taxonomy}-${slug}-jsonld`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/belajar">Edukasi</Link>
        <span>/</span>
        <Link href={`/belajar/${taxonomy}`}>{section.title.replace(/^Berdasarkan /, "")}</Link>
        <span>/</span>
        <span>{term.label}</span>
      </div>

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Cluster edukasi</span>
        <h1>{term.label}</h1>
        <p>
          {term.description} Halaman ini mengikat artikel yang paling relevan agar pembaca
          tidak perlu meloncat-loncat antara daftar artikel, solusi, dan katalog.
        </p>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Navigasi cluster</span>
            <h2>Geser ke jalur edukasi lain tanpa kehilangan konteks.</h2>
          </div>
          <Link href="/artikel">Explorer artikel</Link>
        </div>
        <ArticleTaxonomyDirectory
          activeSlug={slug}
          activeTaxonomy={taxonomy}
          availableSlugs={availableSlugs}
          filters={{}}
          mode="browse"
        />
      </section>

      <section className="article-results-shell">
        <div className="section-heading article-results-shell__header">
          <div>
            <span className="eyebrow-label">Artikel aktif</span>
            <h2>{filteredArticles.length} artikel untuk cluster ini</h2>
            <p>
              Semua artikel di sini sudah dipilih dari intent yang sama agar pembaca bisa
              bergerak dari konteks ke tindakan dengan lebih percaya diri.
            </p>
          </div>
          <Link href={buildArticleTaxonomyBrowseHref(section.queryKey)}>Lihat semua cluster</Link>
        </div>

        {featuredArticle ? (
          <article className="article-list-highlight">
            <div className="article-list-highlight__copy">
              <span className="eyebrow-label">Mulai dari sini</span>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.excerpt}</p>
              <div className="article-list-highlight__meta">
                {featuredArticle.taxonomy_labels?.slice(0, 4).map((label) => (
                  <span key={`${featuredArticle.slug}-${label}`}>{label}</span>
                ))}
              </div>
              <div className="article-list-highlight__actions">
                <Link className="btn btn-primary" href={`/artikel/${featuredArticle.slug}`}>
                  Baca artikel
                </Link>
                <Link className="btn btn-secondary" href={relatedSolutionHref}>
                  {getRelatedSolutionLabel(section.queryKey, term.label)}
                </Link>
              </div>
            </div>
            <div className="article-list-highlight__aside">
              <span className="eyebrow-label">Kenapa cluster ini penting</span>
              <strong>Jalur ini membuat edukasi terasa operasional, bukan hanya bacaan tipis.</strong>
              <ul className="plain-list">
                <li>Masuk dari konteks yang paling dekat dengan bahasa pembaca.</li>
                <li>Turun ke artikel yang sudah disaring, bukan daftar yang generik.</li>
                <li>Selalu ada jalan lanjut ke solusi, komoditas, atau produk.</li>
              </ul>
            </div>
          </article>
        ) : null}

        {articleGrid.length ? (
          <div className="article-grid article-grid--editorial">
            {articleGrid.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        ) : null}
      </section>

      <section className="section-block">
        <article className="article-list-highlight">
          <div className="article-list-highlight__copy">
            <span className="eyebrow-label">Langkah berikutnya</span>
            <h2>Bawa konteks {term.label.toLowerCase()} ke jalur berikutnya yang paling relevan.</h2>
            <p>
              Edukasi yang sehat tidak berhenti di bacaan. Begitu pembaca punya cukup konteks,
              arahkan ke solusi atau komoditas agar keputusan berikutnya tetap terasa logis.
            </p>
            <div className="article-list-highlight__actions">
              <Link className="btn btn-primary" href={relatedSolutionHref}>
                {getRelatedSolutionLabel(section.queryKey, term.label)}
              </Link>
              <Link className="btn btn-secondary" href={commodityHref}>
                {section.queryKey === "komoditas" ? "Buka hub komoditas" : "Lihat jalur komoditas"}
              </Link>
            </div>
          </div>
          <div className="article-list-highlight__aside">
            <span className="eyebrow-label">Bridge</span>
            <strong>Gunakan cluster ini sebagai titik temu antara belajar, solusi, dan belanja.</strong>
            <ul className="plain-list">
              <li>Masuk ke solusi saat masalah lapangan mulai nyata.</li>
              <li>Pakai hub komoditas untuk menyatukan artikel, produk, dan bundle.</li>
              <li>Turun ke produk setelah konteks dan fase kebutuhannya lebih jelas.</li>
            </ul>
          </div>
        </article>
      </section>
    </section>
  );
}
