import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ArticleTaxonomyDirectory } from "@/components/article-taxonomy-directory";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { getArticles } from "@/lib/api";
import {
  buildResetArticleFiltersHref,
  filterArticlesByState,
  getActiveArticleFilters,
  getAvailableArticleTaxonomySlugs,
  type ArticleFilterState,
} from "@/lib/article-content";
import { getArticleRelationCards } from "@/lib/hybrid-navigation";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  return typeof params[key] === "string" ? params[key] : undefined;
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const filters: ArticleFilterState = {
    q: getParam(resolved, "q"),
    komoditas: getParam(resolved, "komoditas"),
    topik: getParam(resolved, "topik"),
    gejala: getParam(resolved, "gejala"),
    fase: getParam(resolved, "fase"),
    tujuan: getParam(resolved, "tujuan"),
  };
  const hasFilter = Boolean(
    filters.q ||
      filters.komoditas ||
      filters.topik ||
      filters.gejala ||
      filters.fase ||
      filters.tujuan,
  );

  return buildArticleListingMetadata({
    title: hasFilter ? "Hasil eksplorasi artikel pertanian" : "Ruang Belajar & Artikel Pertanian",
    description: hasFilter
      ? "Eksplorasi artikel pertanian Wiragro berdasarkan komoditas, topik, gejala, fase tanam, atau tujuan user."
      : "Pusat edukasi Wiragro untuk membantu user belajar, memahami gejala, memilih produk, dan bergerak ke solusi dengan lebih yakin.",
    path: "/artikel",
    canonicalPath: "/artikel",
    noIndex: hasFilter,
    keywords: [
      "artikel pertanian",
      "edukasi pertanian",
      "taxonomy artikel pertanian",
      "gejala tanaman",
      "fase tanam",
    ],
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const filters: ArticleFilterState = {
    q: getParam(resolved, "q"),
    komoditas: getParam(resolved, "komoditas"),
    topik: getParam(resolved, "topik"),
    gejala: getParam(resolved, "gejala"),
    fase: getParam(resolved, "fase"),
    tujuan: getParam(resolved, "tujuan"),
  };

  const articles = await getArticles({ q: filters.q, page_size: 30 });
  const filteredArticles = filterArticlesByState(articles.items, filters);
  const featuredArticle = filteredArticles[0] ?? null;
  const articleGrid = filteredArticles.slice(featuredArticle ? 1 : 0);
  const activeFilters = getActiveArticleFilters(filters);
  const resetHref = buildResetArticleFiltersHref(filters);
  const availableSlugs = getAvailableArticleTaxonomySlugs(articles.items);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            title: "Ruang Belajar Wiragro",
            description:
              "Kumpulan artikel dan insight pertanian yang bisa dijelajahi berdasarkan komoditas, topik, gejala, fase tanam, dan tujuan user.",
            path: "/artikel",
            itemUrls: filteredArticles.slice(0, 12).map((article) => `/artikel/${article.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Artikel", path: "/artikel" },
          ]),
        ]}
        id="articles-page-jsonld"
      />

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Mesin edukasi</span>
        <h1>Ruang belajar yang benar-benar bisa dijelajahi, bukan sekadar daftar artikel tipis.</h1>
        <p>
          Gunakan pencarian bila Anda sudah tahu topiknya, atau masuk lewat komoditas, gejala,
          fase tanam, dan tujuan user agar konten terasa lebih relevan sejak awal.
        </p>
      </div>

      <form action="/artikel" className="filter-form filter-form--inline">
        <input
          defaultValue={filters.q}
          name="q"
          placeholder="Cari pupuk, benih, gejala, fase tanam, atau kebutuhan user..."
        />
        {filters.komoditas ? <input name="komoditas" type="hidden" value={filters.komoditas} /> : null}
        {filters.topik ? <input name="topik" type="hidden" value={filters.topik} /> : null}
        {filters.gejala ? <input name="gejala" type="hidden" value={filters.gejala} /> : null}
        {filters.fase ? <input name="fase" type="hidden" value={filters.fase} /> : null}
        {filters.tujuan ? <input name="tujuan" type="hidden" value={filters.tujuan} /> : null}
        <button className="btn btn-primary" type="submit">
          Cari artikel
        </button>
      </form>

      <ArticleTaxonomyDirectory availableSlugs={availableSlugs} filters={filters} />

      <section className="article-results-shell">
        <div className="section-heading article-results-shell__header">
          <div>
            <span className="eyebrow-label">Hasil eksplorasi</span>
            <h2>{filteredArticles.length} artikel siap dibaca</h2>
            <p>
              Kombinasikan pencarian dan taxonomy untuk mempersempit konten dari niat user,
              bukan hanya dari judul artikel.
            </p>
          </div>
          {activeFilters.length ? <Link href={resetHref}>Reset filter</Link> : null}
        </div>

        {activeFilters.length ? (
          <div className="article-active-filters">
            {activeFilters.map((filter) => (
              <span key={filter.key}>{filter.label}</span>
            ))}
          </div>
        ) : null}

        {featuredArticle ? (
          <article className="article-list-highlight">
            <div className="article-list-highlight__copy">
              <span className="eyebrow-label">Mulai dari sini</span>
              <h2>{featuredArticle.title}</h2>
              <p>{featuredArticle.excerpt}</p>
              <div className="article-list-highlight__meta">
                {featuredArticle.taxonomy_labels?.map((label) => (
                  <span key={`${featuredArticle.slug}-${label}`}>{label}</span>
                ))}
              </div>
              <div className="article-list-highlight__actions">
                <Link className="btn btn-primary" href={`/artikel/${featuredArticle.slug}`}>
                  Baca artikel
                </Link>
                <Link className="btn btn-secondary" href="/solusi">
                  Buka jalur solusi
                </Link>
              </div>
            </div>
            <div className="article-list-highlight__aside">
              <span className="eyebrow-label">Kenapa relevan</span>
              <strong>{featuredArticle.user_goal_summary}</strong>
              {featuredArticle.key_takeaways?.length ? (
                <ul className="plain-list">
                  {featuredArticle.key_takeaways.slice(0, 3).map((item) => (
                    <li key={`${featuredArticle.slug}-${item}`}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ) : (
          <article className="empty-state">
            <span className="eyebrow-label">Artikel belum cocok</span>
            <h2>Tidak ada artikel yang cocok dengan kombinasi filter saat ini.</h2>
            <p>
              Coba reset filter, ubah keyword, atau masuk ke jalur solusi jika kebutuhan Anda
              datang dari problem lapangan yang lebih spesifik.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href={resetHref}>
                Reset filter
              </Link>
              <Link className="btn btn-secondary" href="/solusi">
                Cari solusi
              </Link>
            </div>
          </article>
        )}

        {articleGrid.length ? (
          <div className="article-grid article-grid--editorial">
            {articleGrid.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        ) : null}
      </section>

      <PathwaySection
        cards={getArticleRelationCards(featuredArticle?.title)}
        description="Begitu user mendapatkan konteks dari edukasi, selalu beri jalan jelas ke solusi atau ke produk."
        eyebrow="Relasi silang"
        title="Konten edukasi harus mendorong langkah berikutnya, bukan berhenti di bacaan."
      />
    </section>
  );
}
