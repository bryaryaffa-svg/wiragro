import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getHomeData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const home = await getHomeData();

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="eyebrow-label">Storefront terhubung pusat</span>
          <h1>Belanja kebutuhan pertanian dengan storefront yang modern dan terasa profesional.</h1>
          <p>
            Wiragro / Kios Sidomakmur membawa katalog pusat SiGe Manajer ke web yang
            ramah desktop dan mobile, dengan alur order, promo, dan konten publik yang
            tampil lebih konsisten.
          </p>
          <div className="hero-panel__actions">
            <Link className="btn btn-primary" href="/produk">
              Jelajahi produk
            </Link>
            <Link className="btn btn-secondary" href="/lacak-pesanan">
              Lacak pesanan
            </Link>
          </div>
          <div className="hero-panel__chips">
            {home.category_highlights.map((category) => (
              <Link href={`/produk?kategori=${category.slug}`} key={category.slug}>
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="hero-panel__stats">
          <div className="stats-card stats-card--highlight">
            <span>Fokus storefront</span>
            <strong>Belanja cepat, konten rapi, dan checkout yang mudah dipahami.</strong>
          </div>
          <div className="stats-card">
            <span>Produk aktif</span>
            <strong>{home.featured_products.length + home.new_arrivals.length} item tampil</strong>
          </div>
          <div className="stats-card">
            <span>Banner aktif</span>
            <strong>{home.banners.length} slot homepage</strong>
          </div>
          <div className="stats-card">
            <span>Info toko</span>
            <strong>{home.store.operational_hours || "Jam operasional tersedia"}</strong>
          </div>
        </div>
      </section>

      {home.banners.length ? (
        <section className="section-block section-block--contrast">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Banner toko</span>
              <h2>Promo dan pengumuman yang dikelola dari admin.</h2>
            </div>
          </div>
          <div className="feature-grid">
            {home.banners.map((banner) => (
              <article className="feature-card" key={`${banner.title}-${banner.target_url ?? "no-link"}`}>
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
            <span className="eyebrow-label">Kategori utama</span>
            <h2>Pilih alur belanja yang terasa jelas sejak halaman pertama.</h2>
          </div>
        </div>
        <div className="feature-grid feature-grid--categories">
          {home.category_highlights.map((category) => (
            <Link className="feature-card feature-card--link" href={`/produk?kategori=${category.slug}`} key={category.slug}>
              <strong>{category.name}</strong>
              <p>Buka katalog {category.name.toLowerCase()} dengan filter yang lebih fokus.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Alasan memilih</span>
            <h2>Rasa marketplace, tapi tetap fokus pada kebutuhan petani dan toko cabang.</h2>
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
            <span className="eyebrow-label">Promo pilihan</span>
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
