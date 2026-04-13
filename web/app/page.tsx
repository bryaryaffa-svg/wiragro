import Image from "next/image";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ProductCard } from "@/components/product-card";
import {
  type ArticleListPayload,
  getArticles,
  getFallbackHomeData,
  getHomeData,
} from "@/lib/api";

export const dynamic = "force-dynamic";

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

  const heroFeature =
    home.featured_products[0] ?? home.new_arrivals[0] ?? home.best_sellers[0] ?? null;
  const heroFeatureImage =
    heroFeature?.images.find((image) => image.is_primary) ?? heroFeature?.images[0];
  const knowledgeTracks = [
    {
      title: "Pilih produk berdasarkan kebutuhan lapangan",
      body: "Mulai dari kategori inti seperti pupuk, benih, nutrisi, dan kebutuhan toko agar keputusan belanja terasa lebih cepat.",
      href: "/produk",
      cta: "Buka katalog",
    },
    {
      title: "Pelajari dasar pemakaian sebelum membeli",
      body: "Gunakan area edukasi untuk memahami konteks penggunaan, perbandingan, dan kebiasaan belanja yang lebih tepat.",
      href: "/artikel",
      cta: "Masuk ke edukasi",
    },
    {
      title: "Lanjutkan ke order atau lacak pengiriman",
      body: "Setelah memilih produk, alur belanja diarahkan ke keranjang, checkout, dan pelacakan pesanan yang lebih jelas.",
      href: "/lacak-pesanan",
      cta: "Lacak pesanan",
    },
  ];
  const fallbackEditorial = [
    {
      slug: "panduan-memilih-pupuk",
      title: "Panduan memilih pupuk sesuai kebutuhan tanaman",
      excerpt:
        "Mulai dari pemupukan dasar, penguatan akar, sampai kebutuhan nutrisi lanjutan untuk lahan yang berbeda.",
      published_at: null,
    },
    {
      slug: "dasar-memilih-benih",
      title: "Cara membaca kualitas benih sebelum membeli",
      excerpt:
        "Panduan cepat untuk menilai benih, kesesuaian varietas, dan hal-hal yang perlu diperiksa sebelum checkout.",
      published_at: null,
    },
    {
      slug: "manajemen-belanja-toko",
      title: "Belanja kebutuhan kios dan pertanian dengan lebih efisien",
      excerpt:
        "Gabungkan kebutuhan toko, stok harian, dan produk inti pertanian dalam ritme belanja yang lebih tertata.",
      published_at: null,
    },
  ];
  const editorialFeed = articleFeed.items.length ? articleFeed.items : fallbackEditorial;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="eyebrow-label">Agricultural storefront</span>
          <h1>Storefront pertanian yang terasa lebih presisi, modern, dan siap dipakai sehari-hari.</h1>
          <p>
            Kios Sidomakmur menggabungkan katalog pupuk, benih, kebutuhan kios, dan promo
            toko ke pengalaman belanja yang lebih bersih, cepat, dan terasa premium di
            desktop maupun mobile.
          </p>
          <div className="hero-panel__actions">
            <Link className="btn btn-primary" href="/produk">
              Jelajahi produk
            </Link>
            <Link className="btn btn-secondary" href="/lacak-pesanan">
              Lacak pesanan
            </Link>
          </div>
          <form action="/produk" className="header-search header-search--hero">
            <input
              name="q"
              placeholder="Cari pupuk, benih, pestisida, nutrisi, atau kebutuhan toko..."
              type="search"
            />
            <button type="submit">Cari</button>
          </form>
          <div className="hero-panel__chips">
            {home.category_highlights.slice(0, 4).map((category) => (
              <Link href={`/produk?kategori=${category.slug}`} key={category.slug}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-panel__visual">
          <article className="hero-showcase hero-showcase--primary">
            <div className="hero-showcase__media">
              {heroFeatureImage ? (
                <Image
                  alt={heroFeatureImage.alt_text || heroFeature?.name || "Produk unggulan"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 34vw"
                  src={heroFeatureImage.url}
                />
              ) : (
                <div className="product-card__placeholder" />
              )}
            </div>
            <div className="hero-showcase__body">
              <span className="hero-showcase__kicker">Pilihan unggulan</span>
              <strong>{heroFeature?.name ?? "Katalog siap dibuka dari storefront pusat"}</strong>
              <p>
                {heroFeature?.summary ||
                  "Mulai dari produk yang paling sering dicari, lalu lanjut ke katalog lengkap dengan pencarian yang lebih cepat."}
              </p>
              <div className="hero-showcase__tags">
                <span>{home.store.name}</span>
                <span>{home.store.operational_hours || "Jam toko aktif"}</span>
              </div>
            </div>
          </article>

          <article className="hero-showcase hero-showcase--note">
            <span className="hero-showcase__kicker">Storefront notes</span>
            <strong>Visual lebih ringan, katalog lebih fokus, dan alur belanja tetap fungsional.</strong>
            <p>
              Nuansa agritech yang clean dipakai supaya produk, promo, dan search lebih mudah
              dibaca sejak layar pertama.
            </p>
          </article>

          <div className="hero-panel__stats">
          <div className="stats-card stats-card--highlight">
            <span>Store focus</span>
            <strong>Belanja terasa singkat, jelas, dan siap dipakai dari layar kecil.</strong>
          </div>
          <div className="stats-card">
            <span>Produk tampil</span>
            <strong>{home.featured_products.length + home.new_arrivals.length} item unggulan</strong>
          </div>
          <div className="stats-card">
            <span>Banner aktif</span>
            <strong>{home.banners.length} slot homepage</strong>
          </div>
          <div className="stats-card">
            <span>Jam toko</span>
            <strong>{home.store.operational_hours || "Jam operasional tersedia"}</strong>
          </div>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Flow utama</span>
            <h2>Alur UX yang menghubungkan produk, edukasi, dan aksi belanja.</h2>
          </div>
        </div>
        <div className="feature-grid feature-grid--paths">
          {knowledgeTracks.map((track) => (
            <article className="feature-card feature-card--path" key={track.title}>
              <span className="eyebrow-label">Flow step</span>
              <strong>{track.title}</strong>
              <p>{track.body}</p>
              <Link href={track.href}>{track.cta}</Link>
            </article>
          ))}
        </div>
      </section>

      {storefrontUnavailable ? (
        <section className="section-block section-block--contrast">
          <div className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Koneksi katalog sedang bermasalah</span>
            <h2>Homepage tetap aktif, tetapi data produk belum berhasil dimuat.</h2>
            <p>
              Coba muat ulang halaman beberapa saat lagi. Jika perlu, buka katalog lagi
              setelah koneksi server kembali stabil.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Buka katalog
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {home.banners.length ? (
        <section className="section-block section-block--contrast">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Store signals</span>
              <h2>Promo dan pengumuman yang tampil seperti panel informasi agritech modern.</h2>
            </div>
          </div>
          <div className="feature-grid">
            {home.banners.map((banner) => (
              <article
                className="feature-card feature-card--editorial"
                key={`${banner.title}-${banner.target_url ?? "no-link"}`}
              >
                <strong>{banner.title}</strong>
                <p>{banner.subtitle || "Banner publik aktif dari backend Laravel SiGe Manager."}</p>
                {banner.target_url ? <Link href={banner.target_url}>Buka tautan</Link> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kategori inti</span>
            <h2>Pilih kategori utama dengan layout yang lebih bersih dan mudah dipindai.</h2>
          </div>
        </div>
        <div className="feature-grid feature-grid--categories">
          {home.category_highlights.map((category) => (
            <Link
              className="feature-card feature-card--link feature-card--category"
              href={`/produk?kategori=${category.slug}`}
              key={category.slug}
            >
              <strong>{category.name}</strong>
              <p>Buka katalog {category.name.toLowerCase()} dengan filter yang lebih fokus.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Mengapa Sidomakmur</span>
            <h2>Rasa marketplace yang lebih premium, tetap fokus pada kebutuhan pertanian dan toko cabang.</h2>
          </div>
        </div>
        <div className="feature-grid">
          <article className="feature-card">
            <strong>Harga per toko</strong>
            <p>Harga retail, grosir, dan member bisa tampil sesuai cabang yang aktif.</p>
          </article>
          <article className="feature-card">
            <strong>Checkout guest</strong>
            <p>Belanja tetap cepat tanpa mengharuskan login lebih dulu.</p>
          </article>
          <article className="feature-card">
            <strong>Sinkron ke pusat</strong>
            <p>Order dan payment flow dirancang agar tetap sejalan dengan SiGe Manajer.</p>
          </article>
          <article className="feature-card">
            <strong>Edukasi terintegrasi</strong>
            <p>Produk dan panduan bisa dibaca dalam flow yang sama agar keputusan beli terasa lebih mantap.</p>
          </article>
        </div>
      </section>

      <section className="section-block section-block--contrast">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Edukasi & Insight</span>
            <h2>Konten pendamping yang membuat storefront terasa seperti pusat produk sekaligus pengetahuan.</h2>
          </div>
          <Link href="/artikel">Buka edukasi</Link>
        </div>
        <div className="article-grid article-grid--editorial">
          {editorialFeed.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Katalog utama</span>
            <h2>Produk unggulan</h2>
          </div>
          <Link href="/produk">Lihat semua</Link>
        </div>
        <div className="product-grid">
          {home.featured_products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Update terbaru</span>
            <h2>Produk baru</h2>
          </div>
        </div>
        <div className="product-grid">
          {home.new_arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-block section-block--contrast">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Sorotan agristore</span>
            <h2>Produk yang sedang ditonjolkan dari data backend.</h2>
          </div>
          <Link href="/produk?sort=latest">Lihat katalog</Link>
        </div>
        <div className="product-grid">
          {home.best_sellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
