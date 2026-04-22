import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { StorefrontCategoryDirectory } from "@/components/storefront-category-directory";
import {
  type ArticleListPayload,
  type ProductSummary,
  getArticles,
  getCategories,
  getFallbackHomeData,
  getHomeData,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type TrustHighlight = {
  title: string;
  body: string;
  icon: string;
};

type ArticleFallback = {
  slug: string;
  title: string;
  excerpt: string;
};

const trustHighlights: TrustHighlight[] = [
  {
    title: "Produk Berkualitas",
    body: "Pilihan yang lebih meyakinkan untuk kebutuhan tani harian.",
    icon: "/wiragro-illustrations/wiragro_feature_produk_berkualitas_transparent.png",
  },
  {
    title: "Harga Bersahabat",
    body: "Harga yang rapi dan mudah dibandingkan saat belanja.",
    icon: "/wiragro-illustrations/wiragro_feature_harga_bersahabat_transparent.png",
  },
  {
    title: "Layanan Terpercaya",
    body: "Checkout dan pelacakan order lebih jelas dari mobile.",
    icon: "/wiragro-illustrations/wiragro_feature_layanan_terpercaya_transparent.png",
  },
  {
    title: "Petani Indonesia",
    body: "Visual dan katalog dibuat dekat dengan dunia pertanian lokal.",
    icon: "/wiragro-illustrations/wiragro_feature_petani_indonesia_transparent.png",
  },
];

const fallbackArticles: ArticleFallback[] = [
  {
    slug: "panduan-memilih-pupuk",
    title: "Tips Bertani yang lebih rapi untuk keputusan beli",
    excerpt: "Panduan singkat untuk memilih pupuk, benih, dan nutrisi dengan lebih percaya diri sebelum checkout.",
  },
  {
    slug: "dasar-memilih-benih",
    title: "Cara membaca kualitas benih sebelum membeli",
    excerpt: "Panduan cepat untuk menilai benih, varietas, dan kebutuhan lahan sebelum belanja.",
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
    pagination: { page: 1, page_size: 2, count: 0 },
  };
  let categoryDirectory = home.category_highlights;

  try {
    home = await getHomeData();
    categoryDirectory = home.category_highlights;
  } catch {
    storefrontUnavailable = true;
  }

  try {
    articleFeed = await getArticles({ page_size: 2 });
  } catch {
    articleFeed = { items: [], pagination: { page: 1, page_size: 2, count: 0 } };
  }

  try {
    categoryDirectory = await getCategories();
  } catch {
    categoryDirectory = home.category_highlights;
  }

  const selectedProducts = dedupeProducts([
    ...home.featured_products,
    ...home.new_arrivals,
    ...home.best_sellers,
  ]).slice(0, 4);
  const heroProduct = selectedProducts[0] ?? null;
  const promoBanner = home.banners[0] ?? null;
  const educationItem = articleFeed.items[0] ?? fallbackArticles[0];
  const operationalHours = home.store.operational_hours || "Senin - Sabtu, 08:00 - 17:00";
  const heroHighlight = heroProduct
    ? {
        title: heroProduct.name,
        price: formatCurrency(heroProduct.price.amount),
      }
    : {
        title: "Produk aktif dari Sidomakmur",
        price: "Katalog diperbarui",
      };

  return (
    <div className="storefront-home">
      {storefrontUnavailable ? (
        <section className="storefront-alert">
          <div>
            <strong>Katalog sedang dimuat ulang.</strong>
            <p>Homepage tetap aktif. Anda masih bisa membuka katalog beberapa saat lagi.</p>
          </div>
          <Link className="btn btn-primary" href="/produk">
            Buka katalog
          </Link>
        </section>
      ) : null}

      <section className="storefront-hero">
        <div className="storefront-hero__main">
          <div className="storefront-hero__copy">
            <span className="storefront-eyebrow">{home.store.name || "Kios Sidomakmur"}</span>
            <h1>Solusi lengkap untuk kebutuhan pertanian Anda</h1>
            <p>Produk berkualitas, harga bersaing, pelayanan cepat dan terpercaya.</p>

            <div className="storefront-hero__actions">
              <Link className="btn btn-primary" href="/produk">
                Jelajahi katalog
              </Link>
              <Link className="btn btn-secondary" href="/lacak-pesanan">
                Lacak pesanan
              </Link>
            </div>

            <div className="storefront-hero__spotlight">
              <span>Siap dibeli</span>
              <strong>{heroHighlight.title}</strong>
              <em>{heroHighlight.price}</em>
              <div className="storefront-hero__spotlight-hours">
                <small>Jam operasional</small>
                <b>{operationalHours}</b>
              </div>
            </div>
          </div>

          <div className="storefront-hero__visual" aria-hidden="true">
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
            <div className="storefront-hero__dots">
              <span className="is-active" />
              <span />
              <span />
            </div>
          </div>
        </div>

      </section>

      <StorefrontCategoryDirectory categories={categoryDirectory} />

      <section className="storefront-section">
        <div className="storefront-promo-grid">
          <article className="storefront-promo-card storefront-promo-card--promo">
            <div className="storefront-promo-card__copy">
              <span className="storefront-pill">Promo</span>
              <h3>{promoBanner?.title || "Promo Musim Tanam"}</h3>
              <p>
                {promoBanner?.subtitle ||
                  "Dapatkan diskon untuk produk pilihan agar belanja kebutuhan tani terasa lebih ringan."}
              </p>
              <Link className="storefront-inline-action" href={promoBanner?.target_url || "/produk"}>
                Belanja sekarang
              </Link>
            </div>
            <div className="storefront-promo-card__visual">
              <Image
                alt=""
                className="storefront-promo-card__decor storefront-promo-card__decor--soil"
                height={88}
                src="/wiragro-illustrations/wiragro_dekor_tanah_transparent.png"
                width={160}
              />
              <Image
                alt=""
                className="storefront-promo-card__decor storefront-promo-card__decor--twig"
                height={87}
                src="/wiragro-illustrations/wiragro_dekor_ranting_transparent.png"
                width={112}
              />
              <Image
                alt="Kemasan pupuk organik untuk promo."
                className="storefront-promo-card__product"
                height={168}
                src="/wiragro-illustrations/wiragro_produk_pupuk_transparent.png"
                width={168}
              />
            </div>
          </article>

          <article className="storefront-promo-card storefront-promo-card--info">
            <div className="storefront-promo-card__copy">
              <span className="storefront-pill storefront-pill--soft">Edukasi</span>
              <h3>{educationItem.title}</h3>
              <p>
                {"excerpt" in educationItem && educationItem.excerpt
                  ? educationItem.excerpt
                  : "Baca panduan singkat untuk membantu memilih produk yang lebih tepat."}
              </p>
              <Link className="storefront-inline-action" href={`/artikel/${educationItem.slug}`}>
                Baca tips
              </Link>
            </div>
            <div className="storefront-promo-card__visual">
              <Image
                alt=""
                className="storefront-promo-card__decor storefront-promo-card__decor--leaf"
                height={129}
                src="/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png"
                width={88}
              />
              <Image
                alt=""
                className="storefront-promo-card__decor storefront-promo-card__decor--hill"
                height={112}
                src="/wiragro-illustrations/wiragro_dekor_bukit_transparent.png"
                width={220}
              />
              <Image
                alt="Karung benih untuk kartu edukasi."
                className="storefront-promo-card__product storefront-promo-card__product--benih"
                height={160}
                src="/wiragro-illustrations/wiragro_produk_benih_transparent.png"
                width={160}
              />
            </div>
          </article>
        </div>
      </section>

      <section className="storefront-section storefront-section--products">
        <div className="storefront-section__header">
          <div>
            <span className="storefront-eyebrow">Produk pilihan</span>
            <h2>Produk pilihan</h2>
          </div>
          <Link href="/produk">Lihat semua</Link>
        </div>

        {selectedProducts.length ? (
          <div className="product-grid product-grid--catalog storefront-product-grid">
            {selectedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="storefront-empty">
            <strong>Produk pilihan belum tersedia.</strong>
            <p>Katalog akan tampil di sini setelah data produk aktif dimuat kembali.</p>
          </div>
        )}
      </section>

      <section className="storefront-section storefront-section--trust">
        <div className="storefront-trust-grid">
          {trustHighlights.map((item) => (
            <article className="storefront-trust-card" key={item.title}>
              <Image alt={item.title} height={72} src={item.icon} width={72} />
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="storefront-section storefront-section--cta">
        <div className="storefront-cta">
          <div>
            <span className="storefront-eyebrow storefront-eyebrow--light">Mulai belanja</span>
            <h2>Dapatkan produk pertanian yang lebih mudah dicari dan lebih rapi dibeli.</h2>
            <p>
              Buka katalog untuk melihat produk aktif, atau langsung cek status order jika
              Anda sudah memiliki nomor pesanan.
            </p>
          </div>
          <div className="storefront-cta__actions">
            <Link className="btn btn-primary" href="/produk">
              Buka katalog
            </Link>
            <Link className="btn btn-secondary" href="/lacak-pesanan">
              Lacak pesanan
            </Link>
          </div>
          <Image
            alt=""
            className="storefront-cta__decor storefront-cta__decor--wheelbarrow"
            height={94}
            src="/wiragro-illustrations/wiragro_dekor_gerobak_tanam_transparent.png"
            width={170}
          />
          <Image
            alt=""
            className="storefront-cta__decor storefront-cta__decor--shrub"
            height={96}
            src="/wiragro-illustrations/wiragro_dekor_semak_transparent.png"
            width={106}
          />
        </div>
      </section>
    </div>
  );
}
