import Image from "next/image";
import Link from "next/link";

import { getFallbackArticleSummaries } from "@/lib/article-content";
import {
  HomepageAiMascot,
  HomepageArticleList,
  HomepageCropTile,
  HomepageHeroMetricCard,
  HomepageMiniProductCard,
  HomepageMiniVideoCard,
  HomepagePartnerBenefitCard,
  HomepageProblemCard,
  HomepageTrustStripItemCard,
} from "@/components/homepage-showcase";
import { JsonLd } from "@/components/json-ld";
import { TrackedLinkButton } from "@/components/tracked-link-button";
import { AgriIcon } from "@/components/ui/agri-icon";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { StickyMobileCTA } from "@/components/ui/sticky-mobile-cta";
import { TrustBadge } from "@/components/ui/trust-badge";
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
  HOME_HERO_METRICS,
  HOME_PARTNER_BENEFITS,
  HOME_PROBLEM_CARDS,
  HOME_TRUST_STRIP,
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
  const spotlightProblems = [
    HOME_PROBLEM_CARDS[0],
    HOME_PROBLEM_CARDS[4],
    HOME_PROBLEM_CARDS[1],
    HOME_PROBLEM_CARDS[3],
  ].filter(Boolean);
  const spotlightCrops = [
    HOME_CROP_CARDS[0],
    HOME_CROP_CARDS[2],
    HOME_CROP_CARDS[1],
    HOME_CROP_CARDS[3],
    HOME_CROP_CARDS[4],
    HOME_CROP_CARDS[7],
  ].filter(Boolean);

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
          <span className="homepage-hero__welcome">
            <span className="homepage-hero__welcome-icon">
              <AgriIcon name="leaf" />
            </span>
            Selamat datang di Wiragro
          </span>
          <h1>Platform Solusi Pertanian Digital</h1>
          <p>
            Semua yang petani butuhkan untuk hasil panen lebih baik. Solusi penyakit,
            rekomendasi produk, edukasi, hingga dukungan AI dalam satu platform.
          </p>
          <div className="homepage-hero__actions">
            <TrackedLinkButton
              event="click_cari_solusi"
              href="/solusi"
              payload={{ placement: "homepage_hero" }}
            >
              Temukan Solusi Sekarang
            </TrackedLinkButton>
            <TrackedLinkButton
              event="ask_ai"
              href="/ai-chat"
              payload={{ placement: "homepage_hero" }}
              variant="secondary"
            >
              Tanya AI Chat
            </TrackedLinkButton>
          </div>

          <div className="homepage-hero__metrics">
            {HOME_HERO_METRICS.map((item) => (
              <HomepageHeroMetricCard item={item} key={item.title} />
            ))}
          </div>
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
          <div className="homepage-hero__signal homepage-hero__signal--leaf">
            <AgriIcon name="leaf" />
          </div>
          <div className="homepage-hero__signal homepage-hero__signal--water">
            <AgriIcon name="nutrition" />
          </div>
          <div className="homepage-hero__insight homepage-hero__insight--analysis">
            <div className="homepage-hero__insight-pill">
              <span className="homepage-hero__insight-icon">
                <AgriIcon name="ai" />
              </span>
              <div>
                <span>Analisis AI</span>
                <strong>Daun sehat</strong>
                <small>Risiko rendah</small>
              </div>
            </div>
          </div>
          <div className="homepage-hero__insight homepage-hero__insight--product">
            <span>Rekomendasi NPK</span>
            <strong>16 - 16 - 16</strong>
            <small>Untuk fase generatif</small>
            <div className="homepage-hero__bars" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>

      <section className="homepage-discovery">
        <div className="homepage-panel homepage-discovery__panel">
          <div className="homepage-panel__header">
            <div>
              <h2>Masalah Tanaman Anda?</h2>
              <p>Kenali masalah dan dapatkan solusi yang lebih tepat.</p>
            </div>
            <Link href="/solusi">Lihat Semua</Link>
          </div>
          <div className="home-problem-grid">
            {spotlightProblems.map((card) => (
              <HomepageProblemCard card={card} key={card.title} />
            ))}
            <Link className="home-problem-card home-problem-card--more" href="/solusi">
              <div className="home-problem-card__media home-problem-card__media--more">
                <span className="home-problem-card__more-icon">
                  <AgriIcon name="solution" />
                </span>
              </div>
              <div className="home-problem-card__body">
                <strong>Lihat Semua Masalah</strong>
                <p>Buka explorer solusi lengkap untuk gejala lain.</p>
                <span>Masuk ke Solusi</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="homepage-panel homepage-discovery__panel homepage-discovery__panel--crops">
          <div className="homepage-panel__header">
            <div>
              <h2>Pilih Tanaman Anda</h2>
              <p>Dapatkan rekomendasi yang lebih tepat berdasarkan komoditas.</p>
            </div>
          </div>
          <div className="home-crop-grid">
            {spotlightCrops.map((card) => (
              <HomepageCropTile card={card} key={card.title} />
            ))}
          </div>
        </div>
      </section>

      <section className="homepage-showcase-row">
        <div className="homepage-panel homepage-showcase-card">
          <div className="homepage-panel__header">
            <div>
              <h2>Rekomendasi Produk</h2>
              <p>Produk terbaik sesuai kebutuhan tanaman Anda.</p>
            </div>
            <Link href="/produk">Lihat Semua</Link>
          </div>
          {featuredProducts.length ? (
            <div className="home-mini-product-grid">
              {featuredProducts.map((product) => (
                <HomepageMiniProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              actions={[{ href: "/produk", label: "Jelajahi katalog" }]}
              description="Pilihan produk akan muncul di sini setelah sinkronisasi katalog selesai."
              eyebrow="Produk belum tampil"
              title="Rekomendasi produk akan segera muncul kembali."
            />
          )}
        </div>

        <div className="homepage-panel homepage-showcase-card">
          <div className="homepage-panel__header">
            <div>
              <h2>Belajar dari Video</h2>
              <p>Video praktis dari ahli pertanian.</p>
            </div>
            <Link href="/artikel">Lihat Semua</Link>
          </div>
          <div className="home-mini-video-grid">
            {HOME_VIDEO_CARDS.map((video) => (
              <HomepageMiniVideoCard key={video.title} video={video} />
            ))}
          </div>
        </div>

        <div className="homepage-panel homepage-showcase-card">
          <div className="homepage-panel__header">
            <div>
              <h2>Artikel Praktis</h2>
              <p>Tips dan info terbaru untuk petani.</p>
            </div>
            <Link href="/artikel">Lihat Semua</Link>
          </div>
          <HomepageArticleList articles={latestArticles} />
        </div>
      </section>

      <section className="homepage-insight-row">
        <div className="homepage-ai-showcase">
          <div className="homepage-ai-showcase__copy">
            <div className="homepage-ai-band__badge-row">
              <TrustBadge icon="ai" label="Premium" tone="accent" />
            </div>
            <h2>AI Chat Wiragro</h2>
            <p>
              Tanya apa saja seputar pertanian. AI kami siap bantu 24/7 dengan
              arahan awal yang lebih mudah dipahami.
            </p>
            <div className="homepage-ai-band__actions">
              <PrimaryButton href="/ai-chat">Mulai Chat Sekarang</PrimaryButton>
              <SecondaryButton href="/solusi">Lihat Contoh Pertanyaan</SecondaryButton>
            </div>
          </div>
          <HomepageAiMascot />
          <div className="homepage-ai-showcase__prompts" aria-label="Contoh pertanyaan">
            {HOME_AI_CHAT_PROMPTS.map((prompt) => (
              <span key={prompt}>{prompt}</span>
            ))}
          </div>
        </div>

        <div className="homepage-partner-showcase">
          <div className="homepage-partner-showcase__copy">
            <span className="eyebrow-label">Dukungan untuk distributor & mitra</span>
            <h2>Dukungan untuk Distributor & Mitra</h2>
            <p>
              Wiragro mendukung bisnis Anda bersama jaringan petani di seluruh Indonesia
              dengan alur kebutuhan yang lebih rapi dan visual yang tetap meyakinkan.
            </p>
            <div className="homepage-partner-showcase__benefits">
              {HOME_PARTNER_BENEFITS.map((item) => (
                <HomepagePartnerBenefitCard item={item} key={item.title} />
              ))}
            </div>
            <div className="homepage-b2b-band__actions">
              <PrimaryButton href="/b2b">Gabung Menjadi Mitra</PrimaryButton>
            </div>
          </div>
          <div className="homepage-partner-showcase__visual">
            <Image
              alt="Ilustrasi dukungan logistik dan operasional untuk mitra Wiragro."
              fill
              sizes="(max-width: 960px) 100vw, 34vw"
              src="/illustrations/agri-logistics-hub.svg"
            />
          </div>
        </div>
      </section>

      <section className="homepage-trust-strip">
        {HOME_TRUST_STRIP.map((item) => (
          <HomepageTrustStripItemCard item={item} key={item.title} />
        ))}
      </section>

      <StickyMobileCTA
        primary={{ href: "/solusi", label: "Cari Solusi" }}
        secondary={{ href: "/ai-chat", label: "Tanya AI" }}
      />
    </div>
  );
}
