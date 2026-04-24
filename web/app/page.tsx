import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import {
  type ArticleListPayload,
  type ProductSummary,
  getArticles,
  getFallbackHomeData,
  getHomeData,
} from "@/lib/api";
import { getFeaturedCampaignLandings } from "@/lib/campaign-content";
import {
  HOMEPAGE_BUNDLE_CARDS,
  HOMEPAGE_COMMODITY_CARDS,
  HOMEPAGE_PROBLEM_CARDS,
  HOMEPAGE_TRUST_POINTS,
  buildWhatsAppConsultationUrl,
} from "@/lib/homepage-content";
import { buildCommerceIntentCards } from "@/lib/growth-commerce";
import { HOMEPAGE_ENTRY_CARDS, PRIMARY_PILLAR_LINKS } from "@/lib/hybrid-navigation";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";
import {
  buildCollectionJsonLd,
  buildHomepageMetadata,
  buildStoreJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildHomepageMetadata();

type ArticleFallback = {
  slug: string;
  title: string;
  excerpt: string;
  published_at: string | null;
};

const fallbackArticles: ArticleFallback[] = [
  {
    slug: "panduan-memilih-pupuk",
    title: "Mulai dari dasar pemupukan sebelum memilih produk",
    excerpt:
      "Panduan singkat untuk memahami peran pupuk, waktu aplikasi, dan konteks pembelian yang lebih tepat.",
    published_at: null,
  },
  {
    slug: "dasar-memilih-benih",
    title: "Cara membaca kualitas benih sebelum menyiapkan lahan",
    excerpt:
      "Pahami mutu benih, varietas, dan kebutuhan awal agar user tidak langsung belanja tanpa konteks.",
    published_at: null,
  },
  {
    slug: "manajemen-belanja-toko",
    title: "Menyusun kebutuhan tani dan operasional kios dalam satu ritme belanja",
    excerpt:
      "Gabungkan kebutuhan budidaya dan operasional agar pembelian terasa lebih rapi dan tidak reaktif.",
    published_at: null,
  },
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
  const latestArticles = (articleFeed.items.length ? articleFeed.items : fallbackArticles).slice(
    0,
    3,
  );
  const hasLiveArticles = articleFeed.items.length > 0;
  const operationalHours = home.store.operational_hours || "Senin - Sabtu, 08:00 - 17:00";
  const consultationUrl = buildWhatsAppConsultationUrl(
    home.store.whatsapp_number,
    home.store.name || "Wiragro",
  );
  const commerceIntentCards = buildCommerceIntentCards({
    phone: home.store.whatsapp_number,
    storeName: home.store.name || "Wiragro",
    bundleTitle: "paket pertanian",
    includeCampaign: true,
  }).filter((item) => item.title !== "Repeat order via WA");
  const featuredCampaigns = getFeaturedCampaignLandings(3);
  const mapsUrl = home.store.address
    ? buildGoogleMapsStoreSearchUrl(home.store.name, home.store.address)
    : null;

  return (
    <div className="storefront-home storefront-home--hybrid">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Wiragro | Edukasi, Solusi, dan Toko Pertanian",
            description:
              "Belajar pertanian modern, temukan solusi kebutuhan lapangan, lalu belanja pupuk, benih, pestisida, dan kebutuhan kios dalam satu storefront Wiragro.",
            path: "/",
          }),
          buildStoreJsonLd(home.store),
          buildCollectionJsonLd({
            title: "Produk unggulan Wiragro",
            description:
              "Pilihan produk unggulan dari katalog pertanian Wiragro untuk membantu user bergerak dari insight ke transaksi.",
            path: "/",
            itemUrls: featuredProducts.map((product) => `/produk/${product.slug}`),
          }),
        ]}
        id="homepage-jsonld"
      />

      {storefrontUnavailable ? (
        <section className="storefront-alert">
          <div>
            <strong>Katalog sedang dimuat ulang.</strong>
            <p>Homepage tetap aktif. User masih bisa mulai dari jalur belajar dan solusi.</p>
          </div>
          <Link className="btn btn-primary" href="/belanja">
            Buka hub Belanja
          </Link>
        </section>
      ) : null}

      <section className="storefront-hero storefront-hero--hybrid">
        <div className="storefront-hero__main storefront-hero__main--hybrid">
          <div className="storefront-hero__copy">
            <span className="storefront-eyebrow">{home.store.name || "Wiragro"}</span>
            <h1>Tempat belajar, cari solusi, dan belanja kebutuhan pertanian dalam satu alur.</h1>
            <p>
              Homepage baru ini membantu user memilih jalur yang tepat lebih dulu: belajar
              saat masih butuh konteks, masuk ke solusi saat ada gejala, lalu turun ke katalog
              saat kebutuhan sudah jelas.
            </p>

            <div className="storefront-hero__actions storefront-hero__actions--hybrid">
              <Link className="btn btn-primary" href="/solusi">
                Cari solusi tanaman
              </Link>
              <Link className="btn btn-secondary" href="/belajar">
                Mulai belajar
              </Link>
            </div>

            <Link className="storefront-hero__text-link" href="/belanja">
              Belanja kebutuhan yang sudah Anda tahu
            </Link>

            <div className="storefront-hero__spotlight storefront-hero__spotlight--hybrid">
              <span>Kenapa flow ini lebih sehat</span>
              <strong>User tidak harus langsung masuk ke mode belanja.</strong>
              <em>Masuk dari problem, insight, atau kebutuhan beli yang paling relevan.</em>
              <div className="storefront-hero__spotlight-hours">
                <small>Jam operasional</small>
                <b>{operationalHours}</b>
              </div>
            </div>
          </div>

          <div className="storefront-hero__visual storefront-hero__visual--hybrid" aria-hidden="true">
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--hill"
              height={112}
              src="/wiragro-illustrations/wiragro_dekor_bukit_transparent.png"
              width={280}
            />
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--soil"
              height={80}
              src="/wiragro-illustrations/wiragro_dekor_tanah_transparent.png"
              width={160}
            />
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--leaf-left"
              height={129}
              src="/wiragro-illustrations/wiragro_dekor_daun_kiri_transparent.png"
              width={137}
            />
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--leaf-right"
              height={87}
              src="/wiragro-illustrations/wiragro_dekor_ranting_transparent.png"
              width={112}
            />
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--sprout"
              height={72}
              src="/wiragro-illustrations/wiragro_dekor_tunas_kecil_transparent.png"
              width={72}
            />
            <Image
              alt=""
              className="storefront-hero__art storefront-hero__art--tall"
              height={137}
              src="/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png"
              width={138}
            />
            <Image
              alt="Kemasan pupuk organik untuk hero Wiragro."
              className="storefront-hero__product storefront-hero__product--main"
              height={220}
              priority
              src="/wiragro-illustrations/wiragro_produk_pupuk_transparent.png"
              width={220}
            />
            <Image
              alt="Botol herbisida untuk hero Wiragro."
              className="storefront-hero__product storefront-hero__product--accent"
              height={164}
              src="/wiragro-illustrations/wiragro_produk_herbisida_transparent.png"
              width={104}
            />
          </div>

          <div className="storefront-hero__utility-grid storefront-hero__utility-grid--hybrid">
            {PRIMARY_PILLAR_LINKS.map((pillar) => (
              <Link className="storefront-utility-card" href={pillar.href} key={pillar.href}>
                <span>{pillar.label}</span>
                <strong>{pillar.description}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PathwaySection
        action={{ href: "/solusi", label: "Mulai dari problem user" }}
        cards={HOMEPAGE_ENTRY_CARDS}
        description="Tiga entry point ini menjadi fondasi homepage hybrid: masing-masing jelas, tetapi tetap mengalir satu sama lain."
        eyebrow="Pilih jalur"
        title="Homepage membantu user masuk ke mode yang tepat, bukan langsung dilempar ke katalog."
      />

      <PathwaySection
        action={{ href: "/solusi", label: "Buka semua solusi" }}
        cards={HOMEPAGE_PROBLEM_CARDS}
        description="Section ini ditempatkan tinggi karena banyak user pertanian datang dengan masalah, bukan dengan daftar belanja yang sudah matang."
        eyebrow="Masalah tanaman populer"
        title="Mulai dari problem lapangan yang paling sering dirasakan user."
      />

      <section className="section-block homepage-commodity-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Komoditas populer</span>
            <h2>Pilih komoditas yang paling dekat dengan konteks user.</h2>
            <p>
              Entry point berbasis komoditas membantu user yang tidak datang dengan nama
              produk, tetapi datang dengan kebutuhan tanaman atau usaha taninya.
            </p>
          </div>
          <Link href="/komoditas">Lihat semua komoditas</Link>
        </div>

        <div className="homepage-commodity-grid">
          {HOMEPAGE_COMMODITY_CARDS.map((commodity) => (
            <article
              className={`homepage-commodity-card homepage-commodity-card--${commodity.theme}`}
              key={commodity.title}
            >
              <span className="eyebrow-label">{commodity.eyebrow}</span>
              <strong>{commodity.title}</strong>
              <p>{commodity.description}</p>
              {commodity.supportingLinks?.length ? (
                <div className="homepage-commodity-card__links">
                  {commodity.supportingLinks.map((link) => (
                    <Link href={link.href} key={`${commodity.title}-${link.href}`}>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ) : null}
              <Link className="homepage-commodity-card__action" href={commodity.href}>
                {commodity.actionLabel}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="section-block homepage-article-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Artikel / Insight terbaru</span>
            <h2>Bangun trust dengan insight, bukan hanya listing produk.</h2>
            <p>
              Section ini menjaga brand terasa seperti partner belajar sekaligus tetap
              mendorong user menuju solusi atau pembelian yang lebih yakin.
            </p>
          </div>
          <Link href="/artikel">Lihat semua insight</Link>
        </div>

        <div className="article-grid article-grid--editorial homepage-article-grid">
          {latestArticles.map((article) => (
            <ArticleCard
              article={article}
              href={hasLiveArticles ? `/artikel/${article.slug}` : "/belajar"}
              key={article.slug}
            />
          ))}
        </div>
      </section>

      <section className="storefront-section storefront-section--products">
        <div className="storefront-section__header storefront-section__header--hybrid">
          <div>
            <span className="storefront-eyebrow">Produk unggulan</span>
            <h2>Produk unggulan yang siap mengonversi saat user sudah siap belanja.</h2>
            <p>
              Katalog tetap penting, tetapi sekarang muncul setelah user diberi konteks,
              problem framing, dan pilihan jalur yang lebih jelas.
            </p>
          </div>
          <Link href="/belanja">Masuk ke hub Belanja</Link>
        </div>

        {featuredProducts.length ? (
          <div className="product-grid product-grid--catalog storefront-product-grid">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="storefront-empty">
            <strong>Produk unggulan belum tersedia.</strong>
            <p>Katalog akan tampil di sini setelah data produk aktif dimuat kembali.</p>
          </div>
        )}
      </section>

      <PathwaySection
        action={{ href: "/belanja/paket", label: "Lihat semua paket" }}
        cards={HOMEPAGE_BUNDLE_CARDS}
        description="Bundling membantu user yang ingin bergerak cepat tanpa kehilangan konteks belajar atau problem-solving di belakangnya."
        eyebrow="Bundling"
        title="Kurasi kebutuhan yang lebih siap untuk mendorong conversion."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Campaign landing</span>
            <h2>Halaman musiman dan problem-first untuk intent yang sudah lebih komersial.</h2>
            <p>
              Campaign landing membantu Wiragro menangkap momentum musim, komoditas, atau
              masalah prioritas tanpa memutus jalur bundle, solusi, dan assisted sales.
            </p>
          </div>
          <Link href="/kampanye">Semua campaign</Link>
        </div>
        <div className="campaign-grid">
          {featuredCampaigns.map((campaign) => (
            <CampaignSpotlightCard campaign={campaign} key={campaign.slug} />
          ))}
        </div>
      </section>

      <section className="section-block homepage-trust-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Trust block</span>
            <h2>Proof yang menjelaskan kenapa homepage ini lebih meyakinkan.</h2>
            <p>
              Trust dibangun dari kombinasi edukasi, jalur solusi, dukungan toko, dan
              struktur belanja yang terasa lebih rapi.
            </p>
          </div>
          <Link href="/lacak-pesanan">Lacak pesanan</Link>
        </div>

        <div className="homepage-trust-layout">
          <div className="homepage-trust-grid">
            {HOMEPAGE_TRUST_POINTS.map((point) => (
              <article className="homepage-trust-card" key={point.title}>
                <Image alt={point.title} height={64} src={point.icon} width={64} />
                <div>
                  <strong>{point.title}</strong>
                  <p>{point.body}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="homepage-trust-panel">
            <span className="eyebrow-label">Toko & layanan</span>
            <h3>{home.store.name || "Wiragro"}</h3>
            <p>
              Jalur belajar, solusi, dan belanja semuanya tetap terhubung ke layanan toko,
              jam operasional, dan support yang bisa dihubungi langsung.
            </p>
            <div className="homepage-trust-panel__meta">
              <div>
                <span>Jam operasional</span>
                <strong>{operationalHours}</strong>
              </div>
              <div>
                <span>Alamat</span>
                <strong>{home.store.address || "Alamat toko sedang diperbarui."}</strong>
              </div>
              <div>
                <span>WhatsApp</span>
                <strong>{home.store.whatsapp_number || "Arahkan ke halaman kontak"}</strong>
              </div>
            </div>
            <div className="homepage-trust-panel__actions">
              {consultationUrl ? (
                <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                  Konsultasi WhatsApp
                </a>
              ) : (
                <Link className="btn btn-primary" href="/kontak">
                  Hubungi toko
                </Link>
              )}
              {mapsUrl ? (
                <a className="btn btn-secondary" href={mapsUrl} rel="noreferrer" target="_blank">
                  Buka Google Maps
                </a>
              ) : (
                <Link className="btn btn-secondary" href="/kontak">
                  Lihat kontak
                </Link>
              )}
              <Link className="btn btn-secondary" href="/pengiriman-pembayaran">
                Pengiriman & pembayaran
              </Link>
              <Link className="btn btn-secondary" href="/garansi-retur">
                Garansi & retur
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-block homepage-wa-section">
        <div className="homepage-wa-band">
          <div>
            <span className="eyebrow-label">Konsultasi WA</span>
            <h2>Masih bingung harus mulai dari bundle, konsultasi, atau inquiry partai?</h2>
            <p>
              Fase 3 memperkuat WhatsApp menjadi jalur commerce yang lebih jelas: konsultasi,
              rekomendasi bundle, sampai inquiry B2B. Ini menjaga conversion untuk user yang
              tidak nyaman menavigasi sendiri seluruh flow.
            </p>
          </div>
          {commerceIntentCards.length ? (
            <CommerceIntentGrid items={commerceIntentCards} />
          ) : (
            <div className="homepage-wa-band__actions">
              {consultationUrl ? (
                <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                  Konsultasi via WhatsApp
                </a>
              ) : (
                <Link className="btn btn-primary" href="/kontak">
                  Hubungi lewat kontak
                </Link>
              )}
              <Link className="btn btn-secondary" href="/faq">
                Lihat FAQ dulu
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
