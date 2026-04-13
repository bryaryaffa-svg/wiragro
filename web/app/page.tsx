import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFallbackHomeData, getHomeData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let home = getFallbackHomeData();
  let storefrontUnavailable = false;

  try {
    home = await getHomeData();
  } catch {
    storefrontUnavailable = true;
  }

  const heroFeature =
    home.featured_products[0] ?? home.new_arrivals[0] ?? home.best_sellers[0] ?? null;
  const heroFeatureImage =
    heroFeature?.images.find((image) => image.is_primary) ?? heroFeature?.images[0];

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
            <strong>Siap offline cache</strong>
            <p>Fondasi web ini sudah menyiapkan konsumsi delta cache dari backend.</p>
          </article>
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
