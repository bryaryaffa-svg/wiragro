import Image from "next/image";
import Link from "next/link";

import { getFallbackArticleSummaries } from "@/lib/article-content";
import {
  HomepageAiMascot,
  HomepageArticleList,
  HomepageMiniProductCard,
  HomepageMiniVideoCard,
  HomepagePartnerBenefitCard,
  HomepageProblemCard,
  HomepageSeadanceVideoSlot,
  HomepageTrustStripItemCard,
} from "@/components/homepage-showcase";
import { JsonLd } from "@/components/json-ld";
import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
import { EmptyState, ErrorState } from "@/components/ui/state";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
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
  HOME_PARTNER_BENEFITS,
  HOME_PROBLEM_CARDS,
  HOME_SEADANCE_VIDEO_SLOT,
  HOME_TRUST_STRIP,
  HOME_VIDEO_CARDS,
} from "@/lib/homepage-content";
import { WIRAGRO_CATEGORY_ASSETS, WIRAGRO_HERO_ASSETS } from "@/lib/wiragro-assets";
import {
  buildCollectionJsonLd,
  buildHomepageMetadata,
  buildStoreJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildHomepageMetadata();

const HOME_ENTRY_PATHS: Array<{
  actionLabel: string;
  description: string;
  href: string;
  icon: AgriIconName;
  tone: "solution" | "product" | "education";
  title: string;
}> = [
  {
    actionLabel: "Mulai diagnosis",
    description: "Masuk dari tanaman, gejala, fase tanam, atau masalah lapangan.",
    href: "/solusi",
    icon: "solution",
    tone: "solution",
    title: "Cari Solusi",
  },
  {
    actionLabel: "Buka belanja",
    description: "Masuk ke produk, paket, dan kategori saat kebutuhan sudah lebih jelas.",
    href: "/belanja",
    icon: "product",
    tone: "product",
    title: "Belanja Produk",
  },
  {
    actionLabel: "Buka panduan",
    description: "Baca artikel praktis sebelum memilih tindakan atau produk.",
    href: "/artikel",
    icon: "education",
    tone: "education",
    title: "Baca Edukasi",
  },
];

const HOME_QUICK_CHIPS = [
  "Padi",
  "Cabai",
  "Jagung",
  "Tomat",
  "Daun kuning",
  "Hama",
  "Jamur",
  "Pupuk",
];

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

      <section className="homepage-hero homepage-hero--entry">
        <div className="homepage-hero__copy">
          <span className="homepage-hero__welcome">
            <span className="homepage-hero__welcome-icon">
              <AgriIcon name="leaf" />
            </span>
            Solusi, edukasi, toko
          </span>
          <h1>Temukan solusi tanaman, pelajari caranya, lalu beli produk yang tepat.</h1>
          <p>
            Cari berdasarkan tanaman, gejala, hama, pupuk, pestisida, benih, atau
            kebutuhan budidaya.
          </p>

          <div className="homepage-hero__search">
            <SearchInput
              action="/cari"
              buttonLabel="Cari"
              inputLabel="Cari solusi tanaman, edukasi, atau produk"
              placeholder="Cari produk, tanaman, hama, gejala, atau artikel..."
              size="large"
            />
          </div>

          <div className="homepage-topic-chips homepage-topic-chips--quick" aria-label="Pencarian cepat">
            {HOME_QUICK_CHIPS.map((chip) => (
              <Link className="filter-chip" href={`/cari?q=${encodeURIComponent(chip)}`} key={chip}>
                {chip}
              </Link>
            ))}
          </div>

          <div className="homepage-entry-paths" aria-label="Pilih jalur utama Wiragro">
            {HOME_ENTRY_PATHS.map((path) => (
              <Link
                className={`homepage-entry-path-card homepage-entry-path-card--${path.tone}`}
                href={path.href}
                key={path.title}
              >
                <span className="homepage-entry-path-card__icon">
                  <AgriIcon name={path.icon} />
                </span>
                <strong>{path.title}</strong>
                <p>{path.description}</p>
                <span className="homepage-entry-path-card__action">{path.actionLabel}</span>
              </Link>
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
              src={WIRAGRO_HERO_ASSETS.farmerDigital}
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

      <section className="homepage-spotlight-grid">
        <div className="homepage-panel homepage-panel--compact">
          <div className="homepage-panel__header">
            <div>
              <h2>Solusi populer</h2>
              <p>Mulai dari gejala yang paling sering dicari.</p>
            </div>
            <Link href="/solusi">Lihat semua</Link>
          </div>
          <div className="home-problem-grid home-problem-grid--compact">
            {spotlightProblems.map((card) => (
              <HomepageProblemCard card={card} key={card.title} />
            ))}
          </div>
        </div>

        <div className="homepage-panel homepage-panel--compact">
          <div className="homepage-panel__header">
            <div>
              <h2>Produk sering dicari</h2>
              <p>Rekomendasi awal sebelum masuk katalog lengkap.</p>
            </div>
            <Link href="/belanja">Lihat semua</Link>
          </div>
          {featuredProducts.length ? (
            <div className="home-mini-product-grid home-mini-product-grid--compact">
              {featuredProducts.slice(0, 3).map((product) => (
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
      </section>

      <section className="homepage-showcase-row homepage-showcase-row--learning">
        <div className="homepage-panel homepage-showcase-card">
          <div className="homepage-panel__header">
            <div>
              <h2>Belajar dari Video</h2>
              <p>Video praktis dari ahli pertanian.</p>
            </div>
            <Link href="/artikel">Lihat semua</Link>
          </div>
          <HomepageSeadanceVideoSlot video={HOME_SEADANCE_VIDEO_SLOT} />
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
            <Link href="/artikel">Lihat semua</Link>
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
              src={WIRAGRO_CATEGORY_ASSETS.logisticsPartner}
            />
          </div>
        </div>
      </section>

      <section className="homepage-trust-strip">
        {HOME_TRUST_STRIP.map((item) => (
          <HomepageTrustStripItemCard item={item} key={item.title} />
        ))}
      </section>
    </div>
  );
}
