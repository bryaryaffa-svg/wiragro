import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ArticleTaxonomyDirectory } from "@/components/article-taxonomy-directory";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { getArticles } from "@/lib/api";
import {
  buildArticleTaxonomyBrowseHref,
  filterArticlesByState,
  getAvailableArticleTaxonomySlugs,
} from "@/lib/article-content";
import { getLearningHubCards } from "@/lib/hybrid-navigation";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildArticleListingMetadata({
  title: "Edukasi Pertanian di Wiragro",
  description:
    "Masuk ke pusat edukasi Wiragro untuk memahami input pertanian, ritme budidaya, dan konteks belanja sebelum turun ke katalog.",
  path: "/belajar",
  canonicalPath: "/belajar",
  keywords: ["belajar pertanian", "hub edukasi pertanian", "panduan input pertanian"],
});

const fallbackArticles = [
  {
    slug: "panduan-memilih-pupuk",
    title: "Mulai dari dasar pemupukan dan nutrisi tanaman",
    excerpt:
      "Pahami kebutuhan dasar tanaman, ritme aplikasi, dan konteks memilih pupuk sebelum membeli.",
    published_at: null,
  },
  {
    slug: "dasar-memilih-benih",
    title: "Cara membaca kualitas benih sebelum menyiapkan lahan",
    excerpt:
      "Panduan ringkas untuk memahami varietas, mutu benih, dan kesiapan sebelum masuk ke katalog.",
    published_at: null,
  },
  {
    slug: "manajemen-belanja-toko",
    title: "Menyusun ritme belanja lahan agar tidak reaktif",
    excerpt:
      "Edukasi yang menghubungkan kebutuhan budidaya dengan pola belanja yang lebih rapi dan efisien.",
    published_at: null,
  },
];

export default async function BelajarPage() {
  const articles = await getArticles({ page_size: 6 }).catch(() => ({
    items: [],
    pagination: { page: 1, page_size: 6, count: 0 },
  }));
  const hasLiveArticles = articles.items.length > 0;
  const learningFeed = hasLiveArticles ? articles.items : fallbackArticles;
  const starterFeed = filterArticlesByState(articles.items, { tujuan: "belajar-dasar" }).slice(
    0,
    3,
  );
  const quickProblemFeed = filterArticlesByState(articles.items, { gejala: "daun-menguning" }).slice(
    0,
    2,
  );
  const taxonomyFilters = {};
  const availableSlugs = hasLiveArticles
    ? getAvailableArticleTaxonomySlugs(articles.items)
    : undefined;

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Edukasi Pertanian di Wiragro",
            description:
              "Pusat edukasi untuk memahami dasar budidaya, input pertanian, dan konteks belanja sebelum turun ke katalog.",
            path: "/belajar",
          }),
          buildCollectionJsonLd({
            title: "Pusat Edukasi Wiragro",
            description:
              "Kumpulan jalur edukasi dan artikel pertanian untuk membantu pengguna bergerak dari pemahaman ke keputusan.",
            path: "/belajar",
            itemUrls: hasLiveArticles
              ? articles.items.slice(0, 12).map((article) => `/artikel/${article.slug}`)
              : [],
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Edukasi", path: "/belajar" },
          ]),
        ]}
        id="belajar-page-jsonld"
      />

      <section className="hub-hero hub-hero--learn">
        <div className="hub-hero__copy">
          <span className="eyebrow-label">Edukasi</span>
          <h1>Pusat edukasi untuk memahami tanaman, masalah, dan keputusan belanja dengan lebih tenang.</h1>
          <p>
            Mulai dari komoditas, topik, gejala, fase tanam, atau tujuan belajar Anda. Hub ini
            menjadi pintu masuk edukasi yang terhubung langsung ke solusi dan produk
            tanpa mendorong Anda ke katalog terlalu cepat.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="/artikel">
              Jelajahi semua artikel
            </Link>
            <Link className="btn btn-secondary" href="/solusi">
              Lanjut ke solusi
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Masuk dari</span>
            <strong>Rasa ingin tahu, gejala awal, atau komoditas yang sedang ditanam</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Pemahaman yang cukup sebelum memilih tindakan atau produk</strong>
          </div>
          <div>
            <span>Langkah berikutnya</span>
            <strong>Lanjut ke solusi atau belanja saat konteksnya sudah jelas</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Taxonomy edukasi</span>
            <h2>Masuk ke pusat konten dari jalur yang paling masuk akal untuk Anda.</h2>
            <p>
              Struktur ini disusun agar edukasi mudah diperluas per komoditas, topik,
              gejala, fase tanam, dan tujuan tanpa membuat pengalaman baca terasa rumit.
            </p>
          </div>
          <Link href="/artikel">Buka explorer artikel</Link>
        </div>
        <ArticleTaxonomyDirectory
          availableSlugs={availableSlugs}
          filters={taxonomyFilters}
          mode="browse"
        />
      </section>

      <PathwaySection
        action={{ href: "/artikel", label: "Lihat semua materi" }}
        cards={getLearningHubCards()}
        description="Struktur ini dipakai agar pengguna yang ingin paham dulu tetap punya jalur yang jelas sebelum diarahkan ke solusi atau produk."
        eyebrow="Jalur edukasi"
        title="Edukasi tidak berdiri sendiri. Ia selalu punya jalan lanjut ke solusi dan produk."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Materi terbaru</span>
            <h2>Artikel yang bisa langsung membantu Anda mulai dari konteks yang benar.</h2>
            <p>
              Feed ini mengambil artikel live saat tersedia, lalu tetap aman dengan
              fallback editorial bila materi live belum lengkap.
            </p>
          </div>
          <Link href="/artikel">Buka artikel</Link>
        </div>

        <div className="article-grid article-grid--editorial">
          {learningFeed.map((article) => (
            <ArticleCard
              article={article}
              href={hasLiveArticles ? `/artikel/${article.slug}` : "/artikel"}
              key={article.slug}
            />
          ))}
        </div>
      </section>

      {starterFeed.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Mulai dari dasar</span>
              <h2>Untuk pengunjung yang baru ingin belajar tanpa langsung dibebani katalog.</h2>
            </div>
            <Link href={buildArticleTaxonomyBrowseHref("tujuan", "belajar-dasar")}>Lihat jalur dasar</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {starterFeed.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {quickProblemFeed.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Masalah populer</span>
              <h2>Contoh jalur dari gejala ke pemahaman sebelum memilih tindakan.</h2>
            </div>
            <Link href={buildArticleTaxonomyBrowseHref("gejala", "daun-menguning")}>Lihat topik gejala</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {quickProblemFeed.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
