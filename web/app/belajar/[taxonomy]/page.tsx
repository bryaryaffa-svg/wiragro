import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

import { ArticleCard } from "@/components/article-card";
import { ArticleTaxonomyDirectory } from "@/components/article-taxonomy-directory";
import { JsonLd } from "@/components/json-ld";
import { TaxonomyClusterGrid } from "@/components/taxonomy-cluster-grid";
import { getArticles } from "@/lib/api";
import {
  buildArticleTaxonomyBrowseHref,
  filterArticlesByState,
  getArticleTaxonomySectionBySegment,
  getAvailableArticleTaxonomySlugs,
  type ArticleFilterState,
} from "@/lib/article-content";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ taxonomy: string }>;

const getArticleFeed = cache(async () => getArticles({ page_size: 60 }));

function getSectionTitle(title: string) {
  return title.replace(/^Berdasarkan /, "");
}

function buildState(
  key: Exclude<keyof ArticleFilterState, "q">,
  value: string,
) {
  return { [key]: value } as ArticleFilterState;
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { taxonomy } = await params;
  const section = getArticleTaxonomySectionBySegment(taxonomy);

  if (!section) {
    return buildArticleListingMetadata({
      title: "Jalur edukasi tidak tersedia",
      description: "Taxonomy edukasi yang Anda cari belum tersedia di Wiragro.",
      path: `/belajar/${taxonomy}`,
      canonicalPath: "/belajar",
      noIndex: true,
    });
  }

  const articleFeed = await getArticleFeed();
  const availableSlugs = getAvailableArticleTaxonomySlugs(articleFeed.items)[section.queryKey];

  if (!availableSlugs.length) {
    return buildArticleListingMetadata({
      title: "Jalur edukasi sedang disiapkan",
      description: "Taxonomy edukasi ini belum memiliki materi yang siap ditampilkan.",
      path: `/belajar/${taxonomy}`,
      canonicalPath: "/belajar",
      noIndex: true,
    });
  }

  return buildArticleListingMetadata({
    title: `Edukasi Pertanian Berdasarkan ${getSectionTitle(section.title)}`,
    description: `Masuk ke jalur edukasi Wiragro berdasarkan ${getSectionTitle(section.title).toLowerCase()} agar konten terasa lebih relevan sejak awal.`,
    path: `/belajar/${taxonomy}`,
    canonicalPath: `/belajar/${taxonomy}`,
    keywords: [
      `edukasi ${getSectionTitle(section.title).toLowerCase()}`,
      "taxonomy edukasi pertanian",
      ...section.items.slice(0, 4).map((item) => item.label),
    ],
  });
}

export default async function LearningTaxonomyIndexPage({
  params,
}: {
  params: Params;
}) {
  const { taxonomy } = await params;
  const section = getArticleTaxonomySectionBySegment(taxonomy);

  if (!section) {
    notFound();
  }

  const articleFeed = await getArticleFeed();
  const availableSlugs = getAvailableArticleTaxonomySlugs(articleFeed.items);
  const cards = section.items
    .map((item) => {
      const items = filterArticlesByState(articleFeed.items, buildState(section.queryKey, item.slug));

      if (!items.length) {
        return null;
      }

      return {
        href: buildArticleTaxonomyBrowseHref(section.queryKey, item.slug),
        label: item.label,
        description: item.description,
        count: items.length,
        meta: items[0]?.title,
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  if (!cards.length) {
    notFound();
  }

  const axisArticles = articleFeed.items
    .filter((article) => (article.taxonomy?.[section.key] ?? []).length > 0)
    .slice(0, 6);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `Edukasi Pertanian Berdasarkan ${getSectionTitle(section.title)}`,
            description: section.description,
            path: `/belajar/${taxonomy}`,
          }),
          buildCollectionJsonLd({
            title: `Cluster Edukasi ${getSectionTitle(section.title)}`,
            description: section.description,
            path: `/belajar/${taxonomy}`,
            itemUrls: cards.map((item) => item.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Edukasi", path: "/belajar" },
            { name: getSectionTitle(section.title), path: `/belajar/${taxonomy}` },
          ]),
        ]}
        id={`learning-taxonomy-${taxonomy}-jsonld`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/belajar">Edukasi</Link>
        <span>/</span>
        <span>{getSectionTitle(section.title)}</span>
      </div>

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Edukasi</span>
        <h1>Masuk dari {getSectionTitle(section.title).toLowerCase()} agar pembaca tidak perlu mulai dari daftar artikel yang datar.</h1>
        <p>
          Cluster ini dipakai untuk mengubah mesin edukasi menjadi jalur yang lebih
          operasional. Pembaca bisa memilih konteks yang paling dekat, lalu turun ke
          artikel yang benar-benar relevan.
        </p>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Jalur aktif</span>
            <h2>Pilih cluster {getSectionTitle(section.title).toLowerCase()} yang sudah punya materi hidup.</h2>
            <p>
              Halaman-halaman ini dibuat sebagai pintu masuk SEO dan UX yang lebih
              stabil dibanding hanya mengandalkan filter query sementara.
            </p>
          </div>
          <Link href="/artikel">Buka explorer artikel</Link>
        </div>
        <TaxonomyClusterGrid actionLabel="Buka cluster" eyebrow="Cluster" items={cards} />
      </section>

      {axisArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Materi aktif</span>
              <h2>Artikel yang sudah mengisi cluster ini sekarang.</h2>
            </div>
            <Link href="/belajar">Kembali ke pusat edukasi</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {axisArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pindah konteks</span>
            <h2>Geser ke axis edukasi lain tanpa kehilangan arah.</h2>
          </div>
          <Link href="/solusi">Lanjut ke solusi</Link>
        </div>
        <ArticleTaxonomyDirectory
          activeTaxonomy={taxonomy}
          availableSlugs={availableSlugs}
          filters={{}}
          mode="browse"
        />
      </section>
    </section>
  );
}
