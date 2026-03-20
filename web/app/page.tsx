import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ProductCard } from "@/components/product-card";
import { getArticles, getCacheManifest, getHomeData } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [home, articles, cacheManifest] = await Promise.all([
    getHomeData(),
    getArticles({ page_size: 3 }),
    getCacheManifest(),
  ]);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <span className="eyebrow-label">Storefront terhubung pusat</span>
          <h1>Belanja sarana pertanian dengan tampilan ringan dan alur order yang rapi.</h1>
          <p>
            Kios Sidomakmur membawa katalog pusat SiGe Manajer ke web yang ramah desktop
            dan mobile, dengan nuansa hijau muda yang modern dan tetap mudah dikembangkan.
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
          <div className="stats-card">
            <span>Delta cache awal</span>
            <strong>{cacheManifest.products.length} produk siap dimuat</strong>
          </div>
          <div className="stats-card">
            <span>Banner aktif</span>
            <strong>{home.banners.length} slot homepage</strong>
          </div>
          <div className="stats-card">
            <span>Konten publik</span>
            <strong>{cacheManifest.content_pages.length} halaman & artikel</strong>
          </div>
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

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Edukasi</span>
            <h2>Artikel pertanian</h2>
          </div>
          <Link href="/artikel">Buka blog</Link>
        </div>
        <div className="article-grid">
          {articles.items.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      </section>
    </div>
  );
}
