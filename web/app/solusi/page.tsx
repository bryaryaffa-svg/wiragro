import type { Metadata } from "next";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import { SolutionCard } from "@/components/solution-card";
import { SolutionTaxonomyDirectory } from "@/components/solution-taxonomy-directory";
import {
  getArticles,
  getFallbackProductList,
  getProducts,
} from "@/lib/api";
import { getFeaturedCampaignLandings } from "@/lib/campaign-content";
import { getSolutionHubCards } from "@/lib/hybrid-navigation";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildResetSolutionFiltersHref,
  filterSolutionsByState,
  getActiveSolutionFilters,
  getAvailableSolutionTaxonomySlugs,
  getAllSolutions,
  type SolutionFilterState,
} from "@/lib/solution-content";

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
  const filters: SolutionFilterState = {
    q: getParam(resolved, "q"),
    gejala: getParam(resolved, "gejala"),
    hama: getParam(resolved, "hama"),
    penyakit: getParam(resolved, "penyakit"),
    fase: getParam(resolved, "fase"),
    komoditas: getParam(resolved, "komoditas"),
  };
  const hasFilter = Boolean(
    filters.q ||
      filters.gejala ||
      filters.hama ||
      filters.penyakit ||
      filters.fase ||
      filters.komoditas,
  );

  return buildPageMetadata({
    title: hasFilter ? "Hasil pencarian solusi tanaman" : "Cari Solusi Tanaman & Problem Lapangan",
    description: hasFilter
      ? "Eksplorasi solusi tanaman Wiragro berdasarkan gejala, hama, penyakit, fase tanam, dan komoditas."
      : "Masuk ke pilar Cari Solusi Wiragro untuk bergerak dari masalah lapangan ke verifikasi, tindakan, edukasi, dan produk yang lebih relevan.",
    path: "/solusi",
    canonicalPath: "/solusi",
    noIndex: hasFilter,
    section: "static",
    keywords: [
      "cari solusi tanaman",
      "gejala tanaman",
      "hama tanaman",
      "penyakit tanaman",
      "fase tanam",
      "komoditas pertanian",
    ],
  });
}

export default async function SolusiPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const filters: SolutionFilterState = {
    q: getParam(resolved, "q"),
    gejala: getParam(resolved, "gejala"),
    hama: getParam(resolved, "hama"),
    penyakit: getParam(resolved, "penyakit"),
    fase: getParam(resolved, "fase"),
    komoditas: getParam(resolved, "komoditas"),
  };

  const allSolutions = getAllSolutions();
  const filteredSolutions = filterSolutionsByState(allSolutions, filters);
  const featuredSolution = filteredSolutions[0] ?? null;
  const solutionGrid = filteredSolutions.slice(featuredSolution ? 1 : 0);
  const activeFilters = getActiveSolutionFilters(filters);
  const resetHref = buildResetSolutionFiltersHref();
  const availableSlugs = getAvailableSolutionTaxonomySlugs(allSolutions);
  const featuredCampaigns = getFeaturedCampaignLandings(2);

  const [supportingArticles, featuredProducts] = await Promise.all([
    getArticles({ page_size: 3 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 3, count: 0 },
    })),
    getProducts({ page_size: 4, sort: "best_seller" }).catch(() =>
      getFallbackProductList({ page_size: 4, sort: "best_seller" }),
    ),
  ]);

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Cari Solusi Tanaman & Problem Lapangan",
            description:
              "Explorer solusi Wiragro membantu pengguna masuk dari gejala, verifikasi penyebab, tindakan awal, artikel, dan produk terkait.",
            path: "/solusi",
          }),
          buildCollectionJsonLd({
            title: "Hub Solusi Wiragro",
            description:
              "Kumpulan jalur solusi berbasis gejala, hama, penyakit, fase tanam, dan komoditas.",
            path: "/solusi",
            itemUrls: filteredSolutions.slice(0, 12).map((item) => `/solusi/masalah/${item.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari Solusi", path: "/solusi" },
          ]),
        ]}
        id="solutions-page-jsonld"
      />

      <section className="hub-hero hub-hero--solve">
        <div className="hub-hero__copy">
          <span className="eyebrow-label">Cari Solusi</span>
          <h1>Pilar pemecahan masalah untuk pengguna yang datang dengan situasi nyata di lapangan.</h1>
          <p>
            Mulai dari gejala, hama, penyakit, fase tanam, atau komoditas. Setiap
            halaman solusi disusun untuk membantu Anda memverifikasi penyebab, mengambil
            tindakan awal, lalu bergerak ke edukasi atau produk yang lebih relevan.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="#explorer-solusi">
              Jelajahi masalah populer
            </Link>
            <Link className="btn btn-secondary" href="/belajar">
              Buka jalur belajar
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Masuk dari</span>
            <strong>Gejala, serangan, fase tanam, atau komoditas</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Diagnosis awal yang lebih tenang sebelum ke produk</strong>
          </div>
          <div>
            <span>Output halaman</span>
            <strong>Penyebab, verifikasi, tindakan, edukasi, produk, dan konsultasi</strong>
          </div>
        </div>
      </section>

      <form action="/solusi" className="filter-form filter-form--inline">
        <input
          defaultValue={filters.q}
          name="q"
          placeholder="Cari gejala, hama, penyakit, fase, atau komoditas..."
        />
        {filters.gejala ? <input name="gejala" type="hidden" value={filters.gejala} /> : null}
        {filters.hama ? <input name="hama" type="hidden" value={filters.hama} /> : null}
        {filters.penyakit ? <input name="penyakit" type="hidden" value={filters.penyakit} /> : null}
        {filters.fase ? <input name="fase" type="hidden" value={filters.fase} /> : null}
        {filters.komoditas ? <input name="komoditas" type="hidden" value={filters.komoditas} /> : null}
        <button className="btn btn-primary" type="submit">
          Cari solusi
        </button>
      </form>

      <section className="section-block" id="explorer-solusi">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Explorer solusi</span>
            <h2>Masuk dari klasifikasi yang paling dekat dengan bahasa petani.</h2>
            <p>
              Explorer ini dirancang agar tetap mudah dipakai. Anda tinggal memilih jalur
              masalah yang paling sesuai dengan kondisi tanaman.
            </p>
          </div>
          <Link href="/kontak">Butuh bantuan tim</Link>
        </div>
        <SolutionTaxonomyDirectory
          availableSlugs={availableSlugs}
          filters={filters}
          mode={activeFilters.length ? "filter" : "browse"}
        />
      </section>

      <section className="article-results-shell">
        <div className="section-heading article-results-shell__header">
          <div>
            <span className="eyebrow-label">Masalah & gejala</span>
            <h2>{filteredSolutions.length} solusi siap dijelajahi</h2>
            <p>
              Setiap solusi menghubungkan masalah di lapangan ke verifikasi,
              tindakan awal, artikel edukasi, dan produk yang lebih masuk akal dipertimbangkan.
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
                <Link className="btn btn-secondary" href="/belanja">
                  Lihat produk
                </Link>
              </div>
            </div>
            <div className="solution-list-highlight__aside">
              <span className="eyebrow-label">Apa yang perlu dicek</span>
              <strong>{featuredSolution.symptom_summary}</strong>
              <ul className="plain-list">
                {featuredSolution.verification_steps.slice(0, 3).map((item) => (
                  <li key={`${featuredSolution.slug}-${item}`}>{item}</li>
                ))}
              </ul>
            </div>
          </article>
        ) : (
          <article className="empty-state">
            <span className="eyebrow-label">Solusi belum cocok</span>
            <h2>Tidak ada solusi yang cocok dengan kombinasi filter saat ini.</h2>
            <p>
              Coba reset filter, ubah keyword, atau masuk ke jalur belajar agar Anda tetap
              punya konteks sebelum mengambil tindakan berikutnya.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href={resetHref}>
                Reset filter
              </Link>
              <Link className="btn btn-secondary" href="/belajar">
                Mulai dari Edukasi
              </Link>
            </div>
          </article>
        )}

        {solutionGrid.length ? (
          <div className="solution-grid">
            {solutionGrid.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        ) : null}
      </section>

      {supportingArticles.items.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Edukasi pendukung</span>
              <h2>Artikel yang membantu Anda memahami konteks masalahnya.</h2>
            </div>
            <Link href="/artikel">Buka artikel</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {supportingArticles.items.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {featuredProducts.items.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk pendukung</span>
              <h2>Jembatan ke pembelian tetap ada, tetapi muncul setelah konteks solusi lebih jelas.</h2>
            </div>
            <Link href="/produk">Buka katalog</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {featuredCampaigns.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Campaign prioritas</span>
              <h2>Halaman tematik yang cocok untuk musim tanam dan masalah yang paling sering dicari.</h2>
              <p>
                Saat masalahnya sudah jelas, kampanye bisa menjadi jembatan cepat ke
                bundle, konsultasi, dan produk yang paling siap ditransaksikan.
              </p>
            </div>
            <Link href="/kampanye">Buka campaign</Link>
          </div>
          <div className="campaign-grid">
            {featuredCampaigns.map((campaign) => (
              <CampaignSpotlightCard campaign={campaign} key={campaign.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <PathwaySection
        action={{ href: "/kontak", label: "Konsultasi tim" }}
        cards={getSolutionHubCards()}
        description="Pilar ini sengaja menjadi jembatan: mudah ditemukan, membantu membangun kepercayaan, dan tetap mengantar pengguna ke langkah berikutnya."
        eyebrow="Relasi jalur"
        title="Solusi harus selalu punya jalan lanjut ke edukasi, katalog, dan bantuan manusia."
      />
    </section>
  );
}
