import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { SolutionCard } from "@/components/solution-card";
import { SolutionTaxonomyDirectory } from "@/components/solution-taxonomy-directory";
import { TaxonomyClusterGrid } from "@/components/taxonomy-cluster-grid";
import {
  buildSolutionTaxonomyBrowseHref,
  filterSolutionsByState,
  getAllSolutions,
  getAvailableSolutionTaxonomySlugs,
  getSolutionTaxonomySectionBySegment,
  type SolutionFilterState,
} from "@/lib/solution-content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = Promise<{ taxonomy: string }>;

function buildState(
  key: Exclude<keyof SolutionFilterState, "q">,
  value: string,
) {
  return { [key]: value } as SolutionFilterState;
}

function getSectionTitle(title: string) {
  return title.replace(/^Berdasarkan /, "");
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { taxonomy } = await params;
  const section = getSolutionTaxonomySectionBySegment(taxonomy);

  if (!section) {
    return buildPageMetadata({
      title: "Cluster solusi tidak tersedia",
      description: "Taxonomy solusi yang Anda cari belum tersedia di Wiragro.",
      path: `/solusi/${taxonomy}`,
      canonicalPath: "/solusi",
      noIndex: true,
      section: "static",
    });
  }

  const availableSlugs = getAvailableSolutionTaxonomySlugs(getAllSolutions())[section.queryKey];

  if (!availableSlugs.length) {
    return buildPageMetadata({
      title: "Cluster solusi sedang disiapkan",
      description: "Taxonomy solusi ini belum memiliki halaman yang siap ditampilkan.",
      path: `/solusi/${taxonomy}`,
      canonicalPath: "/solusi",
      noIndex: true,
      section: "static",
    });
  }

  return buildPageMetadata({
    title: `Solusi Tanaman Berdasarkan ${getSectionTitle(section.title)}`,
    description: `Masuk ke cluster solusi Wiragro berdasarkan ${getSectionTitle(section.title).toLowerCase()} agar pengunjung bisa bergerak dari gejala ke tindakan dengan lebih terarah.`,
    path: `/solusi/${taxonomy}`,
    canonicalPath: `/solusi/${taxonomy}`,
    section: "static",
    keywords: [
      `solusi ${getSectionTitle(section.title).toLowerCase()}`,
      "cluster solusi tanaman",
      ...section.items.slice(0, 4).map((item) => item.label),
    ],
  });
}

export default async function SolutionTaxonomyIndexPage({
  params,
}: {
  params: Params;
}) {
  const { taxonomy } = await params;
  const section = getSolutionTaxonomySectionBySegment(taxonomy);

  if (!section) {
    notFound();
  }

  const allSolutions = getAllSolutions();
  const availableSlugs = getAvailableSolutionTaxonomySlugs(allSolutions);
  const cards = section.items
    .map((item) => {
      const items = filterSolutionsByState(allSolutions, buildState(section.queryKey, item.slug));

      if (!items.length) {
        return null;
      }

      return {
        href: buildSolutionTaxonomyBrowseHref(section.queryKey, item.slug),
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

  const axisSolutions = allSolutions
    .filter((solution) => solution.taxonomy[section.key].length > 0)
    .slice(0, 6);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `Solusi Tanaman Berdasarkan ${getSectionTitle(section.title)}`,
            description: section.description,
            path: `/solusi/${taxonomy}`,
          }),
          buildCollectionJsonLd({
            title: `Cluster Solusi ${getSectionTitle(section.title)}`,
            description: section.description,
            path: `/solusi/${taxonomy}`,
            itemUrls: cards.map((item) => item.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari Solusi", path: "/solusi" },
            { name: getSectionTitle(section.title), path: `/solusi/${taxonomy}` },
          ]),
        ]}
        id={`solution-taxonomy-${taxonomy}-jsonld`}
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/solusi">Cari Solusi</Link>
        <span>/</span>
        <span>{getSectionTitle(section.title)}</span>
      </div>

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Cari Solusi</span>
        <h1>Masuk dari {getSectionTitle(section.title).toLowerCase()} agar problem-solving terasa lebih terarah.</h1>
        <p>
          Cluster ini dibuat untuk menangkap intent paling nyata di lapangan. User bisa
          memilih jalur masalah yang benar, lalu turun ke verifikasi, tindakan, artikel,
          dan produk tanpa kehilangan konteks.
        </p>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Cluster aktif</span>
            <h2>Pilih jalur {getSectionTitle(section.title).toLowerCase()} yang sudah punya solusi hidup.</h2>
            <p>
              Halaman ini menjadi pintu masuk yang lebih stabil untuk SEO dan UX dibanding
              hanya mengandalkan filter query sementara.
            </p>
          </div>
          <Link href="/solusi">Kembali ke hub solusi</Link>
        </div>
        <TaxonomyClusterGrid actionLabel="Buka cluster" eyebrow="Cluster" items={cards} />
      </section>

      {axisSolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Solusi aktif</span>
              <h2>Halaman solusi yang sudah mengisi cluster ini sekarang.</h2>
            </div>
            <Link href="/belajar">Buka Edukasi</Link>
          </div>
          <div className="solution-grid">
            {axisSolutions.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pindah konteks</span>
            <h2>Geser ke axis solusi lain tanpa keluar dari pilar problem-solving.</h2>
          </div>
          <Link href="/komoditas">Lihat hub komoditas</Link>
        </div>
        <SolutionTaxonomyDirectory
          activeTaxonomy={taxonomy}
          availableSlugs={availableSlugs}
          filters={{}}
          mode="browse"
        />
      </section>
    </section>
  );
}
