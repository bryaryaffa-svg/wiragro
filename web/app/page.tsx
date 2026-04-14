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
import { formatCurrency } from "@/lib/format";

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
  const serviceHighlights = [
    {
      title: "Pencarian produk yang langsung ke inti kebutuhan",
      body: "Cari pupuk, benih, pestisida, dan kebutuhan kios dari katalog yang ditata untuk dipindai cepat.",
    },
    {
      title: "Checkout dan pelacakan pesanan yang lebih jelas",
      body: "Masukkan pesanan dengan alur yang rapi, lalu pantau status order tanpa berpindah-pindah halaman.",
    },
    {
      title: "Edukasi produk sebagai pendamping keputusan beli",
      body: "Baca panduan singkat agar pelanggan bisa memilih produk yang lebih tepat sebelum checkout.",
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
  const heroPrice = heroFeature ? formatCurrency(heroFeature.price.amount) : null;

  return (
    <div className="page-stack page-stack--home">
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__copy">
            <span className="eyebrow-label">Wiragro / Sidomakmur</span>
            <p className="home-hero__kicker">Katalog pertanian dan kebutuhan kios</p>
            <h1>Belanja kebutuhan pertanian dan toko dalam satu storefront yang rapi.</h1>
            <p>
              Sidomakmur membantu pelanggan mencari produk, memeriksa ketersediaan, dan
              menyelesaikan pesanan lewat pengalaman belanja yang lebih profesional di web.
            </p>
            <div className="home-hero__actions">
              <Link className="btn btn-primary" href="/produk">
                Jelajahi katalog
              </Link>
              <Link className="btn btn-secondary" href="/lacak-pesanan">
                Lacak pesanan
              </Link>
            </div>
            <form action="/produk" className="header-search header-search--hero home-hero__search">
              <input
                name="q"
                placeholder="Cari pupuk, benih, pestisida, nutrisi, atau kebutuhan toko"
                type="search"
              />
              <button type="submit">Cari</button>
            </form>
            <ul className="home-hero__support">
              <li>
                <strong>{home.store.name}</strong>
                <span>{home.store.operational_hours || "Jam operasional tersedia"}</span>
              </li>
              <li>
                <strong>{home.category_highlights.length} kategori inti</strong>
                <span>Mulai dari pupuk, benih, sampai kebutuhan kios.</span>
              </li>
              <li>
                <strong>Checkout delivery atau pickup</strong>
                <span>Sesuaikan alur pesanan dengan kebutuhan pelanggan.</span>
              </li>
            </ul>
          </div>

          <div className="home-hero__aside">
            <article className="home-hero__product">
              <div className="home-hero__media">
                {heroFeatureImage ? (
                  <Image
                    alt={heroFeatureImage.alt_text || heroFeature?.name || "Produk unggulan"}
                    fill
                    sizes="(max-width: 1024px) 100vw, 36vw"
                    src={heroFeatureImage.url}
                  />
                ) : (
                  <div className="product-card__placeholder" />
                )}
              </div>
              <div className="home-hero__card">
                <span className="eyebrow-label">Sorotan produk</span>
                <h2>{heroFeature?.name ?? "Produk unggulan dari katalog Sidomakmur"}</h2>
                <p>
                  {heroFeature?.summary ||
                    "Buka katalog untuk melihat produk yang paling sering dicari pelanggan dan siap diproses hari ini."}
                </p>
                <div className="home-hero__price">
                  <strong>{heroPrice ?? "Katalog aktif"}</strong>
                  <span>
                    {heroFeature?.availability.label || "Produk dan harga diperbarui dari katalog toko."}
                  </span>
                </div>
                <Link
                  className="btn btn-secondary"
                  href={heroFeature ? `/produk/${heroFeature.slug}` : "/produk"}
                >
                  Lihat detail produk
                </Link>
              </div>
            </article>

            <ul className="home-hero__metrics">
              <li>
                <span>Produk unggulan</span>
                <strong>{home.featured_products.length}</strong>
              </li>
              <li>
                <span>Produk baru</span>
                <strong>{home.new_arrivals.length}</strong>
              </li>
              <li>
                <span>Banner aktif</span>
                <strong>{home.banners.length}</strong>
              </li>
              <li>
                <span>Operasional toko</span>
                <strong>{home.store.operational_hours || "Sesuai jam cabang"}</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section-shell section-shell--tight">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Layanan inti</span>
            <h2>Halaman depan sekarang difokuskan untuk membantu pelanggan cepat memahami, memilih, dan membeli.</h2>
          </div>
        </div>
        <div className="home-proof-grid">
          {serviceHighlights.map((item, index) => (
            <article className="home-proof" key={item.title}>
              <span className="home-proof__index">0{index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {storefrontUnavailable ? (
        <section className="section-shell section-shell--soft">
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
        <section className="section-shell section-shell--soft">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Informasi toko</span>
              <h2>Promo dan pengumuman penting ditampilkan sebagai update yang mudah dibaca.</h2>
            </div>
          </div>
          <div className="notice-list">
            {home.banners.map((banner) => (
              <article className="notice-item" key={`${banner.title}-${banner.target_url ?? "no-link"}`}>
                <div>
                  <span className="eyebrow-label">Update</span>
                  <strong>{banner.title}</strong>
                  <p>{banner.subtitle || "Informasi aktif dari dashboard toko."}</p>
                </div>
                {banner.target_url ? (
                  <Link className="btn btn-secondary" href={banner.target_url}>
                    Buka detail
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Kategori utama</span>
            <h2>Masuk ke katalog dari kategori yang paling sering dicari pelanggan.</h2>
          </div>
          <Link href="/produk">Lihat semua kategori</Link>
        </div>
        <div className="category-rail">
          {home.category_highlights.map((category) => (
            <Link className="category-rail__item" href={`/produk?kategori=${category.slug}`} key={category.slug}>
              <span className="eyebrow-label">Kategori</span>
              <strong>{category.name}</strong>
              <p>Buka daftar produk {category.name.toLowerCase()}.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pilihan unggulan</span>
            <h2>Produk yang paling relevan untuk pembelian cepat dan pengisian stok.</h2>
          </div>
          <Link href="/produk">Lihat semua</Link>
        </div>
        <div className="product-grid">
          {home.featured_products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell section-shell--soft">
        <div className="split-section">
          <div className="split-section__copy">
            <span className="eyebrow-label">Edukasi & insight</span>
            <h2>Konten pendamping membantu pelanggan memahami pilihan sebelum membeli.</h2>
            <p>
              Artikel dipakai sebagai area edukasi singkat untuk produk, penggunaan dasar,
              dan pengambilan keputusan yang lebih percaya diri.
            </p>
            <Link className="btn btn-secondary" href="/artikel">
              Buka halaman edukasi
            </Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {editorialFeed.map((article) => (
              <ArticleCard article={article} key={article.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk terbaru</span>
            <h2>Tambahan katalog yang baru tersedia di Sidomakmur.</h2>
          </div>
        </div>
        <div className="product-grid">
          {home.new_arrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk terlaris</span>
            <h2>Item yang paling sering menjadi acuan pembelian pelanggan.</h2>
          </div>
          <Link href="/produk?sort=best_seller">Lihat katalog</Link>
        </div>
        <div className="product-grid">
          {home.best_sellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="home-cta">
        <div>
          <span className="eyebrow-label">Mulai belanja</span>
          <h2>Pilih produk, simpan favorit, lalu lanjutkan ke checkout atau pelacakan pesanan.</h2>
          <p>
            Jika Anda sudah mengetahui kebutuhan yang dicari, buka katalog. Jika sudah
            memiliki nomor order, langsung lanjut ke halaman pelacakan.
          </p>
        </div>
        <div className="home-cta__actions">
          <Link className="btn btn-primary" href="/produk">
            Buka katalog
          </Link>
          <Link className="btn btn-secondary" href="/lacak-pesanan">
            Lacak order
          </Link>
        </div>
      </section>
    </div>
  );
}
