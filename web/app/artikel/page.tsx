import type { Metadata } from "next";

import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { FilterChip } from "@/components/ui/filter-chip";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import { EmptyState } from "@/components/ui/state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { VideoCard } from "@/components/ui/video-card";
import { getArticles } from "@/lib/api";
import {
  EDUCATION_FORMAT_OPTIONS,
  EDUCATION_TOPIC_OPTIONS,
  buildEducationHref,
  filterEducationArticles,
  filterEducationVideos,
  getFeaturedEducationVideos,
  type EducationFilterState,
} from "@/lib/education-content";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildProductSolutionHref,
  getSolutionCropOptions,
  getSolutionProblemOptions,
  normalizeSolutionCropId,
  normalizeSolutionProblemId,
} from "@/lib/solution-experience";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  return typeof params[key] === "string" ? params[key] : undefined;
}

function hasActiveFilters(filters: EducationFilterState) {
  return Boolean(
    filters.q ||
      filters.tanaman ||
      filters.masalah ||
      filters.topik ||
      (filters.format && filters.format !== "all"),
  );
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const filters: EducationFilterState = {
    q: getParam(resolved, "q"),
    tanaman: getParam(resolved, "tanaman"),
    masalah: getParam(resolved, "masalah"),
    topik: getParam(resolved, "topik") as EducationFilterState["topik"],
    format: (getParam(resolved, "format") as EducationFilterState["format"]) ?? "all",
  };

  return buildArticleListingMetadata({
    title: "Edukasi Pertanian - Wiragro",
    description:
      "Pelajari studi kasus, review produk, dan panduan pertanian praktis dari Wiragro.",
    path: "/artikel",
    canonicalPath: "/artikel",
    noIndex: hasActiveFilters(filters),
    keywords: [
      "edukasi pertanian praktis",
      "artikel pertanian",
      "video pertanian",
      "studi kasus pertanian",
      "review produk pertanian",
    ],
  });
}

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const filters: EducationFilterState = {
    q: getParam(resolved, "q"),
    tanaman: getParam(resolved, "tanaman"),
    masalah: getParam(resolved, "masalah"),
    topik: getParam(resolved, "topik") as EducationFilterState["topik"],
    format: (getParam(resolved, "format") as EducationFilterState["format"]) ?? "all",
  };

  const articleFeed = await getArticles({ q: filters.q, page_size: 24 }).catch(() => ({
    items: [],
    pagination: { page: 1, page_size: 24, count: 0 },
  }));
  const filteredArticles = filterEducationArticles(articleFeed.items, filters);
  const filteredVideos = filterEducationVideos(filters);
  const featuredVideos = getFeaturedEducationVideos(filters, 3);
  const cropOptions = getSolutionCropOptions();
  const problemOptions = getSolutionProblemOptions();
  const productHref = buildProductSolutionHref(
    normalizeSolutionCropId(filters.tanaman),
    normalizeSolutionProblemId(filters.masalah),
  );
  const resetHref = "/artikel";
  const activeFilters = hasActiveFilters(filters);
  const shouldShowVideos = filters.format !== "article";
  const shouldShowArticles = filters.format !== "video";
  const videoItems = activeFilters
    ? filteredVideos
    : filters.format === "video"
      ? filteredVideos
      : featuredVideos;
  const hasResults =
    (shouldShowArticles && filteredArticles.length > 0) ||
    (shouldShowVideos && videoItems.length > 0);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Edukasi Pertanian Praktis | Wiragro",
            description:
              "Pelajari masalah tanaman, cara penanganan, dan produk yang tepat berdasarkan kebutuhan lapangan.",
            path: "/artikel",
          }),
          buildCollectionJsonLd({
            title: "Pusat Edukasi Pertanian Wiragro",
            description:
              "Artikel SEO, video YouTube, studi kasus, dan review produk yang terhubung ke solusi dan produk.",
            path: "/artikel",
            itemUrls: filteredArticles.slice(0, 12).map((article) => `/artikel/${article.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Edukasi", path: "/artikel" },
          ]),
        ]}
        id="education-page-jsonld"
      />

      <section className="education-hero">
        <div className="education-hero__copy">
          <span className="eyebrow-label">Pusat edukasi</span>
          <h1>Edukasi Pertanian Praktis</h1>
          <p>
            Pelajari masalah tanaman, cara penanganan, dan produk yang tepat berdasarkan
            kebutuhan lapangan.
          </p>
          <div className="education-hero__actions">
            <PrimaryButton href="#studi-kasus">Lihat Studi Kasus</PrimaryButton>
            <SecondaryButton href="#jelajah-edukasi">Cari Artikel</SecondaryButton>
            <SecondaryButton href="/ai-chat">Tanya AI</SecondaryButton>
          </div>
        </div>

        <div className="education-hero__panel">
          <article>
            <span>Prioritas konten</span>
            <strong>Studi kasus lapangan, review produk, lalu edukasi umum.</strong>
          </article>
          <article>
            <span>Tujuan</span>
            <strong>Edukasi menjadi jalan utama ke solusi dan produk, bukan pelengkap katalog.</strong>
          </article>
          <article>
            <span>Untuk siapa</span>
            <strong>Petani, toko pertanian, dan tim lapangan yang butuh konteks cepat.</strong>
          </article>
        </div>
      </section>

      <section className="education-filter-shell" id="jelajah-edukasi">
        <SectionHeader
          description="Cari hama, tanaman, pupuk, pestisida, atau masalah untuk mempersempit edukasi yang paling relevan."
          eyebrow="Cari edukasi"
          title="Masuk dari kebutuhan yang sedang Anda hadapi"
        />

        <SearchInput
          action="/artikel"
          buttonLabel="Cari Artikel"
          defaultValue={filters.q}
          hiddenInputs={{
            tanaman: filters.tanaman,
            masalah: filters.masalah,
            topik: filters.topik,
            format: filters.format && filters.format !== "all" ? filters.format : undefined,
          }}
          inputLabel="Cari edukasi pertanian"
          placeholder="Cari hama, tanaman, pupuk, pestisida, atau masalah..."
          size="large"
        />

        <div className="education-filter-groups">
          <div className="education-chip-group">
            <strong>Tanaman</strong>
            <div className="education-chip-group__items">
              <FilterChip
                active={!filters.tanaman}
                href={buildEducationHref(filters, { tanaman: undefined })}
              >
                Semua tanaman
              </FilterChip>
              {cropOptions.map((item) => (
                <FilterChip
                  active={filters.tanaman === item.id}
                  href={buildEducationHref(filters, { tanaman: item.id })}
                  key={item.id}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="education-chip-group">
            <strong>Masalah</strong>
            <div className="education-chip-group__items">
              <FilterChip
                active={!filters.masalah}
                href={buildEducationHref(filters, { masalah: undefined })}
              >
                Semua masalah
              </FilterChip>
              {problemOptions.map((item) => (
                <FilterChip
                  active={filters.masalah === item.id}
                  href={buildEducationHref(filters, { masalah: item.id })}
                  key={item.id}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="education-chip-group">
            <strong>Topik</strong>
            <div className="education-chip-group__items">
              <FilterChip
                active={!filters.topik}
                href={buildEducationHref(filters, { topik: undefined })}
              >
                Semua topik
              </FilterChip>
              {EDUCATION_TOPIC_OPTIONS.map((item) => (
                <FilterChip
                  active={filters.topik === item.id}
                  href={buildEducationHref(filters, { topik: item.id })}
                  key={item.id}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="education-chip-group">
            <strong>Format</strong>
            <div className="education-chip-group__items">
              {EDUCATION_FORMAT_OPTIONS.map((item) => (
                <FilterChip
                  active={(filters.format ?? "all") === item.id}
                  href={buildEducationHref(filters, {
                    format: item.id === "all" ? undefined : item.id,
                  })}
                  key={item.id}
                >
                  {item.label}
                </FilterChip>
              ))}
            </div>
          </div>
        </div>
      </section>

      {shouldShowVideos && videoItems.length ? (
        <section className="section-block" id="studi-kasus">
          <SectionHeader
            description="Prioritas video mengikuti studi kasus lapangan, review produk, lalu edukasi umum."
            eyebrow="Video unggulan"
            title="Studi kasus terbaru"
          />
          <div className="education-video-grid">
            {videoItems.map((video) => (
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
        </section>
      ) : null}

      {hasResults ? (
        shouldShowArticles ? (
          <section className="section-block">
            <SectionHeader
              action={activeFilters ? { href: resetHref, label: "Reset filter", variant: "secondary" } : undefined}
              description="Artikel SEO, studi kasus, dan review produk disusun agar pembaca bisa lanjut ke solusi dan produk yang paling relevan."
              eyebrow="Artikel praktis"
              title="Panduan pertanian yang bisa langsung ditindaklanjuti"
            />
            <div className="article-grid article-grid--editorial">
              {filteredArticles.map((article) => (
                <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
              ))}
            </div>
          </section>
        ) : null
      ) : (
        <EmptyState
          actions={[
            { href: resetHref, label: "Lihat edukasi lain" },
            { href: "/ai-chat", label: "Tanya AI", variant: "secondary" },
            { href: productHref, label: "Lihat produk terkait", variant: "secondary" },
          ]}
          description="Coba ubah tanaman, masalah, topik, atau format agar kami bisa menampilkan konten edukasi yang lebih sesuai."
          eyebrow="Konten edukasi untuk topik ini belum tersedia"
          headingLevel="h2"
          title="Konten edukasi untuk topik ini belum tersedia"
        />
      )}

      {shouldShowVideos && filters.format === "video" && filteredVideos.length > 3 ? (
        <section className="section-block">
          <SectionHeader
            description="Kumpulan video tambahan yang masih relevan dengan tanaman, masalah, atau topik yang Anda pilih."
            eyebrow="Video lain"
            title="Video edukasi lainnya"
          />
          <div className="education-video-grid">
            {filteredVideos.slice(3).map((video) => (
              <VideoCard
                category={video.category}
                ctaLabel={video.youtubeId ? "Tonton" : "Lihat panduan"}
                description={video.description}
                href={video.href}
                key={`more-${video.id}`}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
