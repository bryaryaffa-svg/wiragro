import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ArticleTaxonomyDirectory } from "@/components/article-taxonomy-directory";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { VideoCard } from "@/components/ui/video-card";
import { getArticles } from "@/lib/api";
import {
  buildArticleTaxonomyBrowseHref,
  filterArticlesByState,
  getAvailableArticleTaxonomySlugs,
} from "@/lib/article-content";
import { getFeaturedEducationVideos } from "@/lib/education-content";
import { getLearningHubCards } from "@/lib/hybrid-navigation";
import {
  buildArticleListingMetadata,
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildArticleListingMetadata({
  title: "Edukasi Pertanian Praktis - Wiragro",
  description:
    "Pelajari masalah tanaman, cara penanganan, dan produk yang tepat lewat artikel, studi kasus, dan video edukasi Wiragro.",
  path: "/belajar",
  canonicalPath: "/belajar",
  keywords: ["edukasi pertanian praktis", "studi kasus pertanian", "artikel pertanian wiragro"],
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
      "Panduan ringkas untuk memahami varietas, mutu benih, dan kesiapan sebelum masuk ke solusi atau produk.",
    published_at: null,
  },
  {
    slug: "manajemen-belanja-toko",
    title: "Menyusun ritme kebutuhan lapangan agar tidak reaktif",
    excerpt:
      "Edukasi yang menghubungkan kebutuhan budidaya dengan pola keputusan yang lebih rapi dan efisien.",
    published_at: null,
  },
];

export default async function BelajarPage() {
  const articles = await getArticles({ page_size: 8 }).catch(() => ({
    items: [],
    pagination: { page: 1, page_size: 8, count: 0 },
  }));

  const hasLiveArticles = articles.items.length > 0;
  const learningFeed = hasLiveArticles ? articles.items.slice(0, 6) : fallbackArticles;
  const starterFeed = filterArticlesByState(articles.items, { tujuan: "belajar-dasar" }).slice(
    0,
    3,
  );
  const quickProblemFeed = filterArticlesByState(articles.items, { gejala: "daun-menguning" }).slice(
    0,
    3,
  );
  const featuredVideos = getFeaturedEducationVideos({ format: "all" }, 3);
  const taxonomyFilters = {};
  const availableSlugs = hasLiveArticles
    ? getAvailableArticleTaxonomySlugs(articles.items)
    : undefined;

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Edukasi Pertanian Praktis - Wiragro",
            description:
              "Pusat edukasi Wiragro yang menggabungkan artikel SEO, studi kasus, review produk, dan jalur lanjut ke solusi atau produk.",
            path: "/belajar",
          }),
          buildCollectionJsonLd({
            title: "Pusat Edukasi Wiragro",
            description:
              "Kumpulan artikel dan video pertanian praktis untuk membantu pengguna bergerak dari pemahaman ke tindakan.",
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
          <span className="eyebrow-label">Edukasi Pertanian Praktis</span>
          <h1>Edukasi pertanian yang membantu Anda bergerak dari pemahaman ke tindakan.</h1>
          <p>
            Pelajari masalah tanaman, cara penanganan, dan produk yang tepat berdasarkan
            kebutuhan lapangan. Di sini artikel, studi kasus, dan video tidak berdiri sendiri,
            tetapi selalu mengarah ke solusi dan keputusan belanja yang lebih sehat.
          </p>
          <div className="hub-hero__actions">
            <PrimaryButton href="/artikel">Cari artikel</PrimaryButton>
            <SecondaryButton href="/solusi">Lihat studi kasus</SecondaryButton>
            <SecondaryButton href="/ai-chat">Tanya AI</SecondaryButton>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Prioritas konten</span>
            <strong>Studi kasus, review produk, lalu edukasi umum</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Memberi arahan yang cukup sebelum user pindah ke solusi atau produk</strong>
          </div>
          <div>
            <span>Jalur lanjut</span>
            <strong>Semua materi selalu punya pintu ke solusi, AI, dan produk terkait</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Studi kasus terbaru</span>
            <h2>Mulai dari video yang paling dekat dengan masalah lapangan.</h2>
            <p>
              Saat user lebih nyaman belajar secara visual, Wiragro mengutamakan studi kasus
              lapangan, review produk, lalu edukasi umum sebagai pintu masuk pertama.
            </p>
          </div>
          <Link href="/artikel">Buka semua edukasi</Link>
        </div>
        <div className="education-video-grid">
          {featuredVideos.map((video) => (
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

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Jalur edukasi</span>
            <h2>Masuk ke pusat konten dari topik, tanaman, atau masalah yang paling relevan.</h2>
            <p>
              Struktur ini dibuat agar edukasi tetap mudah dipahami di mobile, tetapi tetap
              scalable saat konten artikel dan video bertambah banyak.
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
        description="Pusat edukasi ini menjaga artikel dan video tetap dekat dengan solusi dan produk, bukan berdiri sebagai konten pendamping yang terpisah."
        eyebrow="Ekosistem edukasi"
        title="Edukasi adalah pilar utama setelah solusi, bukan lapisan tambahan."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Panduan praktis</span>
            <h2>Artikel yang bisa langsung membantu Anda memahami konteks sebelum membeli.</h2>
            <p>
              Feed ini mengambil artikel live saat tersedia, lalu tetap aman dengan fallback
              editorial agar pengalaman belajar tidak pernah kosong.
            </p>
          </div>
          <Link href="/artikel">Buka semua artikel</Link>
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
              <h2>Untuk pengunjung yang baru ingin belajar tanpa langsung dibebani produk.</h2>
            </div>
            <Link href={buildArticleTaxonomyBrowseHref("tujuan", "belajar-dasar")}>
              Lihat jalur dasar
            </Link>
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
            <Link href={buildArticleTaxonomyBrowseHref("gejala", "daun-menguning")}>
              Lihat topik gejala
            </Link>
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
