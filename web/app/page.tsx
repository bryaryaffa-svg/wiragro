import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { CommerceIntentLink } from "@/components/commerce-intent-link";
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
} from "@/lib/homepage-content";
import {
  buildCommerceIntentCards,
  buildCommerceWhatsAppLink,
} from "@/lib/growth-commerce";
import {
  HOMEPAGE_COMMERCIAL_ENTRY_CARDS,
  HOMEPAGE_ENTRY_CARDS,
  PLATFORM_ENTRY_LINKS,
} from "@/lib/hybrid-navigation";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";
import {
  BRAND_SUBTAGLINE,
  BRAND_TAGLINE,
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
      "Pahami mutu benih, varietas, dan kebutuhan awal agar Anda tidak langsung belanja tanpa konteks.",
    published_at: null,
  },
  {
    slug: "manajemen-belanja-toko",
    title: "Menyusun kebutuhan tani dalam satu ritme belanja yang lebih rapi",
    excerpt:
      "Gabungkan kebutuhan budidaya, solusi, dan produk agar keputusan pembelian terasa lebih terarah dan tidak reaktif.",
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
  const consultationLink = buildCommerceWhatsAppLink({
    phone: home.store.whatsapp_number,
    storeName: home.store.name || "Wiragro",
    intent: "consultation",
    sourcePath: "/",
    surface: "homepage",
    funnelStage: "discover",
  });
  const commerceIntentCards = buildCommerceIntentCards({
    phone: home.store.whatsapp_number,
    storeName: home.store.name || "Wiragro",
    sourcePath: "/",
    surface: "homepage",
  });
  const featuredCampaigns = getFeaturedCampaignLandings(3);
  const mapsUrl = home.store.address
    ? buildGoogleMapsStoreSearchUrl(home.store.name, home.store.address)
    : null;

  return (
    <div className="storefront-home storefront-home--hybrid">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `Wiragro | ${BRAND_TAGLINE}`,
            description: BRAND_SUBTAGLINE,
            path: "/",
          }),
          buildStoreJsonLd(home.store),
          buildCollectionJsonLd({
            title: "Produk unggulan Wiragro",
            description:
              "Pilihan produk unggulan dari katalog pertanian Wiragro untuk membantu pengunjung bergerak dari pemahaman ke pembelian.",
            path: "/",
            itemUrls: featuredProducts.map((product) => `/produk/${product.slug}`),
          }),
        ]}
        id="homepage-jsonld"
      />

      {storefrontUnavailable ? (
        <section className="storefront-alert">
          <div>
            <strong>Data produk sedang dimuat ulang.</strong>
            <p>Anda tetap bisa mulai dari solusi tanaman, edukasi, dan layanan utama Wiragro.</p>
          </div>
          <Link className="btn btn-primary" href="/produk">
            Jelajahi produk
          </Link>
        </section>
      ) : null}

      <section className="storefront-hero storefront-hero--hybrid">
        <div className="storefront-hero__main storefront-hero__main--hybrid">
          <div className="storefront-hero__copy">
            <span className="storefront-eyebrow">{BRAND_TAGLINE}</span>
            <h1>{BRAND_SUBTAGLINE}</h1>
            <p>
              Wiragro dirancang sebagai platform digital pertanian yang membantu Anda
              bergerak dari masalah tanaman ke tindakan, pembelajaran, pembelian, dan
              layanan premium dengan alur yang lebih jelas.
            </p>

            <div className="storefront-hero__actions storefront-hero__actions--hybrid">
              <Link className="btn btn-primary" href="/solusi">
                Cari solusi tanaman
              </Link>
              <Link className="btn btn-secondary" href="/produk">
                Jelajahi produk
              </Link>
              <Link className="btn btn-secondary" href="/ai-chat">
                Buka AI Chat
              </Link>
            </div>

            <Link className="storefront-hero__text-link" href="/belajar">
              Masuk ke edukasi pertanian
            </Link>

            <div className="storefront-hero__spotlight storefront-hero__spotlight--hybrid">
              <span>Satu platform, banyak jalur masuk</span>
              <strong>Solusi, edukasi, produk, AI premium, dan B2C/B2B saling terhubung.</strong>
              <em>Pilih jalur yang paling relevan tanpa terasa dilempar ke katalog terlalu cepat.</em>
              <div className="storefront-hero__spotlight-hours">
                <small>Jam layanan</small>
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
            {PLATFORM_ENTRY_LINKS.map((pillar) => (
              <Link className="storefront-utility-card" href={pillar.href} key={pillar.href}>
                <span>{pillar.label}</span>
                <strong>{pillar.description}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <PathwaySection
        action={{ href: "/solusi", label: "Mulai dari masalah tanaman" }}
        cards={HOMEPAGE_ENTRY_CARDS}
        description="Tiga jalur inti ini membantu pengunjung memilih mode yang paling tepat sebelum masuk lebih jauh ke platform."
        eyebrow="Pilih jalur"
        title="Homepage membantu pengunjung masuk ke mode yang tepat, bukan langsung dilempar ke katalog."
      />

      <PathwaySection
        action={{ href: "/produk", label: "Buka semua jalur belanja" }}
        cards={HOMEPAGE_COMMERCIAL_ENTRY_CARDS}
        description="Paket, program musiman, dan B2B hadir sebagai lini penawaran resmi Wiragro yang mendukung kebutuhan retail maupun bisnis."
        eyebrow="Lini penawaran resmi"
        title="Jalur penawaran Wiragro tidak berhenti di satu katalog saja."
      />

      <PathwaySection
        action={{ href: "/solusi", label: "Buka semua solusi" }}
        cards={HOMEPAGE_PROBLEM_CARDS}
        description="Bagian ini ditempatkan tinggi karena banyak pengunjung pertanian datang dengan masalah, bukan dengan daftar belanja yang sudah matang."
        eyebrow="Masalah tanaman populer"
        title="Mulai dari masalah lapangan yang paling sering dirasakan petani."
      />

      <section className="section-block homepage-commodity-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Komoditas populer</span>
            <h2>Pilih komoditas yang paling dekat dengan kebutuhan Anda.</h2>
            <p>
              Jalur berbasis komoditas membantu pengunjung yang tidak datang dengan nama
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
            <span className="eyebrow-label">Edukasi terbaru</span>
            <h2>Bangun kepercayaan lewat edukasi, bukan hanya lewat listing produk.</h2>
            <p>
              Konten edukasi membantu Wiragro terasa seperti partner belajar yang
              terpercaya sekaligus tetap relevan untuk keputusan lapangan.
            </p>
          </div>
          <Link href="/artikel">Lihat semua artikel</Link>
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
            <h2>Produk unggulan yang siap dipilih saat kebutuhan Anda sudah lebih jelas.</h2>
            <p>
              Katalog tetap penting, tetapi kini hadir sebagai bagian dari alur yang
              lebih utuh bersama solusi, edukasi, dan pendampingan.
            </p>
          </div>
          <Link href="/produk">Jelajahi produk</Link>
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
        description="Bundle resmi membantu Anda bergerak cepat tanpa kehilangan konteks belajar atau solusi yang dibutuhkan."
        eyebrow="Bundle resmi"
        title="Kurasi kebutuhan yang lebih siap dipilih dan dibeli."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Campaign resmi</span>
            <h2>Halaman musiman dan problem-first untuk kebutuhan yang sudah dekat ke keputusan beli.</h2>
            <p>
              Program musiman membantu Wiragro menangkap momentum musim, komoditas, atau
              masalah prioritas tanpa memutus jalur bundle, solusi, dan bantuan tim.
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
            <span className="eyebrow-label">Kepercayaan</span>
            <h2>Alasan kenapa Wiragro terasa lebih meyakinkan sejak halaman pertama.</h2>
            <p>
              Kepercayaan dibangun dari kombinasi edukasi, solusi, layanan yang jelas,
              dan pengalaman belanja yang terasa lebih rapi.
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
            <span className="eyebrow-label">Layanan Wiragro</span>
            <h3>{home.store.name || "Wiragro"}</h3>
            <p>
              Semua jalur di platform ini tetap terhubung ke layanan, jam operasional,
              dan tim yang bisa dihubungi langsung saat Anda butuh bantuan.
            </p>
            <div className="homepage-trust-panel__meta">
              <div>
                <span>Jam layanan</span>
                <strong>{operationalHours}</strong>
              </div>
              <div>
                <span>Alamat layanan</span>
                <strong>{home.store.address || "Alamat layanan sedang diperbarui."}</strong>
              </div>
              <div>
                <span>WhatsApp</span>
                <strong>{home.store.whatsapp_number || "Arahkan ke halaman kontak"}</strong>
              </div>
            </div>
            <div className="homepage-trust-panel__actions">
              {consultationLink ? (
                <CommerceIntentLink
                  className="btn btn-primary"
                  href={consultationLink.href}
                  leadRef={consultationLink.leadRef}
                  leadSummary={consultationLink.leadSummary}
                  tracking={consultationLink.tracking}
                >
                  Konsultasi WhatsApp
                </CommerceIntentLink>
              ) : (
                <Link className="btn btn-primary" href="/kontak">
                  Hubungi tim
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
            <h2>Pilih jalur WA yang paling masuk akal setelah visitor paham konteksnya.</h2>
            <p>
              Homepage tidak lagi menampilkan semua intent sekaligus. Konsultasi tetap ada
              di panel trust, sementara section ini fokus ke rekomendasi kebutuhan dan jalur
              inquiry partai yang lebih mudah dibaca tim layanan.
            </p>
          </div>
          {commerceIntentCards.length ? (
            <CommerceIntentGrid items={commerceIntentCards} />
          ) : (
            <div className="homepage-wa-band__actions">
              {consultationLink ? (
                <CommerceIntentLink
                  className="btn btn-primary"
                  href={consultationLink.href}
                  leadRef={consultationLink.leadRef}
                  leadSummary={consultationLink.leadSummary}
                  tracking={consultationLink.tracking}
                >
                  Konsultasi via WhatsApp
                </CommerceIntentLink>
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
