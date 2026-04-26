import Image from "next/image";
import Link from "next/link";

import { getFallbackArticleSummaries } from "@/lib/article-content";
import { ArticleCard } from "@/components/article-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { TrackedLinkButton } from "@/components/tracked-link-button";
import { IconCard } from "@/components/ui/icon-card";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StepWizard } from "@/components/ui/step-wizard";
import { StickyMobileCTA } from "@/components/ui/sticky-mobile-cta";
import { TrustBadge } from "@/components/ui/trust-badge";
import { VideoCard } from "@/components/ui/video-card";
import {
  type ArticleListPayload,
  type ProductSummary,
  getArticles,
  getFallbackHomeData,
  getHomeData,
} from "@/lib/api";
import {
  HOME_AI_CHAT_PROMPTS,
  HOME_CROP_CARDS,
  HOME_HERO_BADGES,
  HOME_PROBLEM_CARDS,
  HOME_PRODUCT_TOPIC_CHIPS,
  HOME_VIDEO_CARDS,
} from "@/lib/homepage-content";
import {
  buildCollectionJsonLd,
  buildHomepageMetadata,
  buildStoreJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildHomepageMetadata();

function dedupeProducts(products: Array<ProductSummary | null | undefined>) {
  return products
    .filter((product): product is ProductSummary => Boolean(product))
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);
}

export default async function HomePage() {
  let home = getFallbackHomeData();
  let storefrontUnavailable = false;
  let articleFeed: ArticleListPayload = {
    items: [],
    pagination: { page: 1, page_size: 3, count: 0 },
  };

  try {
    home = await getHomeData();
  } catch {
    storefrontUnavailable = true;
  }

  try {
    articleFeed = await getArticles({ page_size: 3 });
  } catch {
    articleFeed = { items: [], pagination: { page: 1, page_size: 3, count: 0 } };
  }

  const featuredProducts = dedupeProducts([
    ...home.featured_products,
    ...home.new_arrivals,
    ...home.best_sellers,
  ]).slice(0, 4);
  const latestArticles = (articleFeed.items.length
    ? articleFeed.items
    : getFallbackArticleSummaries()
  ).slice(0, 3);

  return (
    <div className="page-stack homepage">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Wiragro - Platform Solusi Pertanian Digital",
            description:
              "Cari solusi masalah tanaman, baca edukasi pertanian, dan beli produk pertanian yang tepat di Wiragro.",
            path: "/",
          }),
          buildStoreJsonLd(home.store),
          buildCollectionJsonLd({
            title: "Produk rekomendasi Wiragro",
            description:
              "Pilihan produk unggulan yang menjadi jembatan dari solusi dan edukasi menuju pembelian yang lebih tepat.",
            path: "/",
            itemUrls: featuredProducts.map((product) => `/produk/${product.slug}`),
          }),
        ]}
        id="homepage-jsonld"
      />

      {storefrontUnavailable ? (
        <ErrorState
          actions={[
            { href: "/solusi", label: "Mulai dari solusi" },
            { href: "/produk", label: "Lihat produk", variant: "secondary" },
          ]}
          description="Data katalog live sedang dimuat ulang. Anda tetap bisa menjelajahi solusi tanaman, edukasi, dan rekomendasi produk fallback dari Wiragro."
          eyebrow="Sinkronisasi data"
          title="Sebagian data live sedang disegarkan."
        />
      ) : null}

      <section className="homepage-hero">
        <div className="homepage-hero__copy">
          <span className="eyebrow-label">Platform Solusi Pertanian Digital</span>
          <h1>Platform Solusi Pertanian Digital</h1>
          <p>
            Cari solusi masalah tanaman, pelajari cara terbaik, dan beli produk
            pertanian yang tepat dalam satu tempat.
          </p>
          <div className="homepage-hero__actions">
            <TrackedLinkButton
              event="click_cari_solusi"
              href="/solusi"
              payload={{ placement: "homepage_hero" }}
            >
              Cari Solusi Tanaman
            </TrackedLinkButton>
            <TrackedLinkButton
              event="ask_ai"
              href="/ai-chat"
              payload={{ placement: "homepage_hero" }}
              variant="secondary"
            >
              Tanya AI Pertanian
            </TrackedLinkButton>
            <Link className="homepage-hero__tertiary" href="/produk">
              Lihat Produk
            </Link>
          </div>
          <div className="homepage-hero__badges">
            {HOME_HERO_BADGES.map((badge) => (
              <TrustBadge
                icon={badge.icon}
                key={badge.label}
                label={badge.label}
                tone={badge.tone}
              />
            ))}
          </div>
          <StepWizard
            steps={[
              {
                description: "Kenali masalah atau kebutuhan tanaman lebih dulu.",
                label: "Cari solusi",
                status: "current",
              },
              {
                description: "Pelajari langkah yang lebih aman dan masuk akal.",
                label: "Pahami arahan",
                status: "upcoming",
              },
              {
                description: "Beli produk yang tepat saat konteksnya sudah jelas.",
                label: "Belanja tepat",
                status: "upcoming",
              },
            ]}
          />
        </div>

        <div className="homepage-hero__visual">
          <div className="homepage-hero__image">
            <Image
              alt="Petani Wiragro menggunakan teknologi digital untuk menganalisis kebutuhan tanaman di lahan pertanian."
              fill
              priority
              sizes="(max-width: 960px) 100vw, 46vw"
              src="/home/hero-farmer-ai.png"
            />
          </div>
          <div className="homepage-hero__insight homepage-hero__insight--analysis">
            <span>Analisis AI</span>
            <strong>Mulai dari gejala, bukan tebakan</strong>
          </div>
          <div className="homepage-hero__insight homepage-hero__insight--product">
            <span>Rekomendasi</span>
            <strong>Solusi, edukasi, lalu produk</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/solusi", label: "Lihat semua masalah" }}
          description="Pilih gejala yang paling dekat dengan kondisi lapangan Anda. Setiap kartu mengantar ke explorer solusi dengan konteks yang lebih terarah."
          eyebrow="Masalah tanaman"
          title="Masalah tanaman Anda apa?"
        />
        <div className="homepage-icon-grid">
          {HOME_PROBLEM_CARDS.map((card) => (
            <IconCard
              actionLabel={card.actionLabel}
              description={card.description}
              href={card.href}
              icon={card.icon}
              key={card.title}
              title={card.title}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/solusi", label: "Buka explorer solusi", variant: "secondary" }}
          description="Kalau Anda datang dari komoditas, bukan dari nama produk, pilih tanaman yang paling ingin ditangani terlebih dahulu."
          eyebrow="Pilih tanaman"
          title="Pilih tanaman yang ingin Anda tangani"
        />
        <div className="homepage-icon-grid homepage-icon-grid--crops">
          {HOME_CROP_CARDS.map((card) => (
            <IconCard
              actionLabel={card.actionLabel}
              description={card.description}
              href={card.href}
              icon={card.icon}
              key={card.title}
              title={card.title}
              tone="accent"
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/produk", label: "Lihat semua produk" }}
          description="Produk tetap penting, tetapi hadir setelah user memahami konteks kebutuhan tanamnya agar keputusan belanja terasa lebih tepat."
          eyebrow="Produk rekomendasi"
          title="Produk rekomendasi untuk kebutuhan pertanian"
        />
        <div className="homepage-topic-chips" aria-label="Kelompok produk">
          {HOME_PRODUCT_TOPIC_CHIPS.map((chip) => (
            <span className="filter-chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
        {featuredProducts.length ? (
          <div className="product-grid product-grid--catalog">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <EmptyState
            actions={[{ href: "/produk", label: "Jelajahi katalog" }]}
            description="Pilihan produk akan muncul di sini setelah sinkronisasi katalog selesai."
            eyebrow="Produk belum tampil"
            title="Rekomendasi produk sedang disiapkan."
          />
        )}
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/artikel", label: "Masuk ke edukasi", variant: "secondary" }}
          description="Saat feed video belum lengkap dari backend, Wiragro tetap menampilkan studi kasus dan ringkasan yang paling membantu user memahami konteks."
          eyebrow="Edukasi video"
          title="Belajar dari studi kasus lapangan"
        />
        <div className="homepage-video-grid">
          {HOME_VIDEO_CARDS.map((video) => (
            <VideoCard
              category={video.category}
              description={video.description}
              href={video.href}
              key={video.title}
              thumbnail={video.thumbnail}
              title={video.title}
            />
          ))}
        </div>
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/artikel", label: "Lihat semua artikel" }}
          description="Panduan praktis ini membantu user memahami masalah dan fase tanam sebelum mengambil keputusan beli."
          eyebrow="Artikel"
          title="Panduan praktis sebelum membeli produk"
        />
        <div className="article-grid article-grid--editorial">
          {latestArticles.map((article) => (
            <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
          ))}
        </div>
      </section>

      <section className="homepage-ai-band">
        <div className="homepage-ai-band__copy">
          <div className="homepage-ai-band__badge-row">
            <TrustBadge icon="ai" label="Premium Feature" tone="accent" />
          </div>
          <h2>Masih bingung dengan masalah tanaman?</h2>
          <p>
            Tanya AI Pertanian Wiragro untuk mendapatkan arahan awal dan rekomendasi
            produk yang sesuai.
          </p>
          <div className="homepage-ai-band__actions">
            <PrimaryButton href="/ai-chat">Tanya AI</PrimaryButton>
            <SecondaryButton href="/solusi">Mulai dari solusi</SecondaryButton>
          </div>
        </div>
        <div className="homepage-ai-band__prompts" aria-label="Contoh pertanyaan">
          {HOME_AI_CHAT_PROMPTS.map((prompt) => (
            <span key={prompt}>{prompt}</span>
          ))}
        </div>
      </section>

      <section className="homepage-b2b-band">
        <div className="homepage-b2b-band__copy">
          <span className="eyebrow-label">Untuk toko & pembelian volume besar</span>
          <h2>Wiragro mendukung kebutuhan toko dan pembelian rutin.</h2>
          <p>
            Untuk toko pertanian dan kebutuhan volume besar, tim Wiragro membantu
            menyiapkan alur pembelian yang lebih rapi sesuai kerja sama tanpa
            mengganggu pengalaman belanja utama.
          </p>
        </div>
        <div className="homepage-b2b-band__actions">
          <PrimaryButton href="/b2b">Hubungi Tim Wiragro</PrimaryButton>
          <SecondaryButton href="/kontak">Butuh bantuan cepat</SecondaryButton>
        </div>
      </section>

      <StickyMobileCTA
        primary={{ href: "/solusi", label: "Cari Solusi" }}
        secondary={{ href: "/ai-chat", label: "Tanya AI" }}
      />
    </div>
  );
}
