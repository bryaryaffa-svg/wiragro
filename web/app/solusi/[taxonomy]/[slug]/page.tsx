import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { SolutionCard } from "@/components/solution-card";
import { SolutionTaxonomyDirectory } from "@/components/solution-taxonomy-directory";
import {
  getArticles,
  getFallbackProductList,
  getFallbackStoreProfile,
  getProducts,
  getStoreProfile,
  type ProductSummary,
} from "@/lib/api";
import {
  buildArticleTaxonomyBrowseHref,
  getArticleTaxonomyTerm,
} from "@/lib/article-content";
import { buildWhatsAppConsultationUrl } from "@/lib/homepage-content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildSolutionTaxonomyBrowseHref,
  filterSolutionsByState,
  getAllSolutions,
  getAvailableSolutionTaxonomySlugs,
  getSolutionTaxonomySectionBySegment,
  getSolutionTaxonomyTermBySegment,
  type SolutionFilterState,
} from "@/lib/solution-content";

export const dynamic = "force-dynamic";

type Params = Promise<{ taxonomy: string; slug: string }>;

function buildState(
  key: Exclude<keyof SolutionFilterState, "q">,
  value: string,
) {
  return { [key]: value } as SolutionFilterState;
}

function dedupeBySlug<T extends { slug: string }>(items: Array<T | null | undefined>) {
  return items
    .filter((item): item is T => Boolean(item))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.slug === item.slug) === index);
}

function dedupeProducts(items: Array<ProductSummary | null | undefined>) {
  return items
    .filter((item): item is ProductSummary => Boolean(item))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.id === item.id) === index);
}

function getLearningHref(
  queryKey: Exclude<keyof SolutionFilterState, "q">,
  slug: string,
) {
  if (queryKey === "komoditas" && getArticleTaxonomyTerm("komoditas", slug)) {
    return buildArticleTaxonomyBrowseHref("komoditas", slug);
  }

  if (queryKey === "gejala" && getArticleTaxonomyTerm("gejala", slug)) {
    return buildArticleTaxonomyBrowseHref("gejala", slug);
  }

  if (queryKey === "fase" && getArticleTaxonomyTerm("fase", slug)) {
    return buildArticleTaxonomyBrowseHref("fase", slug);
  }

  if (queryKey === "hama" || queryKey === "penyakit") {
    return buildArticleTaxonomyBrowseHref("topik", "hama-penyakit");
  }

  return "/artikel";
}

function getLearningLabel(queryKey: Exclude<keyof SolutionFilterState, "q">) {
  if (queryKey === "komoditas") {
    return "Buka belajar per komoditas";
  }

  if (queryKey === "gejala") {
    return "Lihat edukasi gejala";
  }

  if (queryKey === "fase") {
    return "Buka edukasi per fase";
  }

  return "Buka Edukasi";
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { taxonomy, slug } = await params;
  const section = getSolutionTaxonomySectionBySegment(taxonomy);
  const term = getSolutionTaxonomyTermBySegment(taxonomy, slug);

  if (!section || !term) {
    return buildPageMetadata({
      title: "Cluster solusi tidak tersedia",
      description: "Cluster solusi yang Anda cari belum tersedia di Wiragro.",
      path: `/solusi/${taxonomy}/${slug}`,
      canonicalPath: "/solusi",
      noIndex: true,
      section: "static",
    });
  }

  const filteredSolutions = filterSolutionsByState(getAllSolutions(), buildState(section.queryKey, slug));

  if (!filteredSolutions.length) {
    return buildPageMetadata({
      title: "Cluster solusi belum memiliki halaman aktif",
      description: "Cluster solusi ini belum memiliki halaman aktif yang bisa ditampilkan saat ini.",
      path: `/solusi/${taxonomy}/${slug}`,
      canonicalPath: buildSolutionTaxonomyBrowseHref(section.queryKey),
      noIndex: true,
      section: "static",
    });
  }

  return buildPageMetadata({
    title: `${term.label} | Cari Solusi Tanaman`,
    description: term.description,
    path: `/solusi/${taxonomy}/${slug}`,
    canonicalPath: `/solusi/${taxonomy}/${slug}`,
    section: "static",
    keywords: [
      term.label,
      `solusi ${term.label.toLowerCase()}`,
      "masalah tanaman",
      "gejala tanaman",
    ],
  });
}

export default async function SolutionTaxonomyDetailPage({
  params,
}: {
  params: Params;
}) {
  const { taxonomy, slug } = await params;
  const section = getSolutionTaxonomySectionBySegment(taxonomy);
  const term = getSolutionTaxonomyTermBySegment(taxonomy, slug);

  if (!section || !term) {
    notFound();
  }

  const allSolutions = getAllSolutions();
  const availableSlugs = getAvailableSolutionTaxonomySlugs(allSolutions);
  const filteredSolutions = filterSolutionsByState(allSolutions, buildState(section.queryKey, slug));

  if (!filteredSolutions.length) {
    notFound();
  }

  const featuredSolution = filteredSolutions[0] ?? null;
  const solutionGrid = filteredSolutions.slice(featuredSolution ? 1 : 0);
  const relatedArticleSlugs = [...new Set(filteredSolutions.flatMap((item) => item.related_article_slugs))].slice(0, 6);
  const relatedQueries = [...new Set(filteredSolutions.flatMap((item) => item.related_product_queries))].slice(0, 3);
  const learningHref = getLearningHref(section.queryKey, slug);
  const commodityHref = section.queryKey === "komoditas" ? `/komoditas/${slug}` : "/komoditas";

  const [articleFeed, store, productGroups] = await Promise.all([
    getArticles({ page_size: 60 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 60, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    Promise.all(
      relatedQueries.map((query) =>
        getProducts({ q: query, page_size: 4 }).catch(() =>
          getFallbackProductList({ q: query, page_size: 4 }),
        ),
      ),
    ),
  ]);

  const relatedArticles = dedupeBySlug(
    relatedArticleSlugs.map((articleSlug) =>
      articleFeed.items.find((article) => article.slug === articleSlug),
    ),
  ).slice(0, 4);
  const relatedProducts = dedupeProducts(productGroups.flatMap((group) => group.items)).slice(0, 4);
  const consultationUrl = buildWhatsAppConsultationUrl(store.whatsapp_number, store.name);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${term.label} | Cari Solusi Tanaman`,
            description: term.description,
            path: `/solusi/${taxonomy}/${slug}`,
          }),
          buildCollectionJsonLd({
            title: `Cluster Solusi ${term.label}`,
            description: term.description,
            path: `/solusi/${taxonomy}/${slug}`,
            itemUrls: filteredSolutions.map((solution) => `/solusi/masalah/${solution.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari Solusi", path: "/solusi" },
            { name: section.title.replace(/^Berdasarkan /, ""), path: `/solusi/${taxonomy}` },
            { name: term.label, path: `/solusi/${taxonomy}/${slug}` },
          ]),
        ]}
        id={`solution-taxonomy-${taxonomy}-${slug}-jsonld`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/solusi">Cari Solusi</Link>
        <span>/</span>
        <Link href={`/solusi/${taxonomy}`}>{section.title.replace(/^Berdasarkan /, "")}</Link>
        <span>/</span>
        <span>{term.label}</span>
      </div>

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Cluster solusi</span>
        <h1>{term.label}</h1>
        <p>
          {term.description} Halaman ini menyatukan gejala, tindakan, artikel, produk,
          dan konsultasi ke dalam satu jalur yang lebih jelas untuk kebutuhan pertanian.
        </p>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Navigasi cluster</span>
            <h2>Geser ke jalur solusi lain tanpa kembali ke silo yang terpisah.</h2>
          </div>
          <Link href="/solusi">Hub solusi</Link>
        </div>
        <SolutionTaxonomyDirectory
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
            <span className="eyebrow-label">Halaman solusi</span>
            <h2>{filteredSolutions.length} solusi di cluster ini</h2>
            <p>
              Semua halaman di sini membawa pengunjung dari masalah nyata ke verifikasi,
              tindakan, edukasi, dan produk yang lebih relevan.
            </p>
          </div>
          <Link href={buildSolutionTaxonomyBrowseHref(section.queryKey)}>Lihat semua cluster</Link>
        </div>

        {featuredSolution ? (
          <article className="solution-list-highlight">
            <div className="solution-list-highlight__copy">
              <span className="eyebrow-label">Mulai dari sini</span>
              <h2>{featuredSolution.title}</h2>
              <p>{featuredSolution.excerpt}</p>
              <div className="solution-card__chips">
                {featuredSolution.taxonomy_labels.slice(0, 5).map((label) => (
                  <span key={`${featuredSolution.slug}-${label}`}>{label}</span>
                ))}
              </div>
              <div className="article-list-highlight__actions">
                <Link className="btn btn-primary" href={`/solusi/masalah/${featuredSolution.slug}`}>
                  Buka detail solusi
                </Link>
                <Link className="btn btn-secondary" href={learningHref}>
                  {getLearningLabel(section.queryKey)}
                </Link>
              </div>
            </div>
            <div className="solution-list-highlight__aside">
              <span className="eyebrow-label">Cara pakai cluster ini</span>
              <strong>Gunakan cluster ini saat kebutuhan yang dicari sudah cukup spesifik.</strong>
              <ul className="plain-list">
                <li>Mulai dari halaman solusi yang gejalanya paling dekat.</li>
                <li>Baca verifikasi dan tindakan sebelum membandingkan produk.</li>
                <li>Pindah ke artikel atau komoditas saat butuh konteks tambahan.</li>
              </ul>
            </div>
          </article>
        ) : null}

        {solutionGrid.length ? (
          <div className="solution-grid">
            {solutionGrid.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        ) : null}
      </section>

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Edukasi terkait</span>
              <h2>Artikel yang membantu pengunjung memahami cluster ini lebih dalam.</h2>
            </div>
            <Link href={learningHref}>{getLearningLabel(section.queryKey)}</Link>
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
              <h2>Produk tampil setelah pengunjung punya cukup konteks dari cluster masalah ini.</h2>
            </div>
            <Link href="/produk">Jelajahi produk</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <article className="solution-list-highlight">
          <div className="solution-list-highlight__copy">
            <span className="eyebrow-label">Langkah berikutnya</span>
            <h2>Jaga alur dari masalah ke keputusan tetap utuh.</h2>
            <p>
              Cluster solusi ini sengaja dihubungkan ke belajar, komoditas, produk,
              dan konsultasi agar proses mencari solusi terasa nyata, meyakinkan, dan mudah
              diteruskan ke keputusan belanja.
            </p>
            <div className="article-list-highlight__actions">
              <Link className="btn btn-primary" href={learningHref}>
                {getLearningLabel(section.queryKey)}
              </Link>
              <Link className="btn btn-secondary" href={commodityHref}>
                {section.queryKey === "komoditas" ? "Buka hub komoditas" : "Lihat jalur komoditas"}
              </Link>
              {consultationUrl ? (
                <a className="btn btn-secondary" href={consultationUrl} rel="noreferrer" target="_blank">
                  Konsultasi WhatsApp
                </a>
              ) : (
                <Link className="btn btn-secondary" href="/kontak">
                  Hubungi tim
                </Link>
              )}
            </div>
          </div>
          <div className="solution-list-highlight__aside">
            <span className="eyebrow-label">Bridge</span>
            <strong>Semua jalan dari cluster ini seharusnya terasa logis untuk pengunjung.</strong>
            <ul className="plain-list">
              <li>Edukasi memberi konteks sebelum keputusan belanja.</li>
              <li>Komoditas menyatukan solusi, artikel, bundle, dan produk per tanaman.</li>
              <li>WhatsApp menjadi jalur bantuan saat pengunjung ingin validasi cepat.</li>
            </ul>
          </div>
        </article>
      </section>
    </section>
  );
}
