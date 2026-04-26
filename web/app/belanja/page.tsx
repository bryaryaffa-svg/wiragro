import Link from "next/link";

import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import { StorefrontCategoryDirectory } from "@/components/storefront-category-directory";
import {
  getCategories,
  getFallbackProductList,
  getFallbackStoreProfile,
  getProducts,
  getStoreProfile,
} from "@/lib/api";
import { buildCommerceIntentCards, getFeaturedGrowthBundles } from "@/lib/growth-commerce";
import { getShoppingHubCards } from "@/lib/hybrid-navigation";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildCatalogMetadata({
  title: "Belanja Produk Pertanian - Wiragro",
  description:
    "Masuk ke produk, bundle, dan campaign Wiragro saat kebutuhan tanaman Anda sudah lebih jelas.",
  path: "/belanja",
  canonicalPath: "/belanja",
  keywords: ["belanja pertanian wiragro", "bundle pertanian", "campaign pertanian"],
});

export default async function BelanjaPage() {
  const [categoriesResult, productsResult, storeResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ page_size: 4, sort: "latest" }),
    getStoreProfile(),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const featuredProducts =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : getFallbackProductList({ page_size: 4, sort: "latest" });
  const store = storeResult.status === "fulfilled" ? storeResult.value : getFallbackStoreProfile();
  const featuredBundles = getFeaturedGrowthBundles(3);
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: "/belanja",
    surface: "shopping-hub",
  });

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Belanja Produk Pertanian - Wiragro",
            description:
              "Jalur belanja Wiragro yang menjaga produk, bundle, dan campaign tetap terhubung ke solusi dan edukasi.",
            path: "/belanja",
          }),
          buildCollectionJsonLd({
            title: "Produk dan bundle Wiragro",
            description:
              "Pintu masuk untuk produk, bundle, dan campaign resmi saat kebutuhan tanaman sudah cukup jelas.",
            path: "/belanja",
            itemUrls: featuredProducts.items.slice(0, 8).map((product) => `/produk/${product.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Belanja", path: "/belanja" },
          ]),
        ]}
        id="belanja-page-jsonld"
      />

      <section className="hub-hero hub-hero--shop">
        <div className="hub-hero__copy">
          <span className="eyebrow-label">Belanja terarah</span>
          <h1>Masuk ke produk saat kebutuhan tanaman Anda sudah lebih jelas.</h1>
          <p>
            Jalur ini membantu pengguna yang sudah tahu apa yang ingin dicari, ingin memilih paket
            yang lebih ringkas, atau siap melanjutkan ke pembelian tanpa kehilangan konteks solusi
            dan edukasi dari pilar utama Wiragro.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="/produk">
              Buka semua produk
            </Link>
            <Link className="btn btn-secondary" href="/solusi">
              Mulai dari solusi
            </Link>
            <Link className="btn btn-secondary" href="/artikel">
              Buka edukasi
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Masuk dari</span>
            <strong>Kebutuhan yang sudah jelas, pencarian produk cepat, atau paket yang siap dibeli</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Mempercepat pencarian produk tanpa memutus alur solusi dan edukasi</strong>
          </div>
          <div>
            <span>Jaga keputusan</span>
            <strong>Produk, bundle, dan campaign tetap mengarah balik ke konteks lapangan</strong>
          </div>
        </div>
      </section>

      <PathwaySection
        action={{ href: "/produk", label: "Masuk ke katalog" }}
        cards={getShoppingHubCards()}
        description="Belanja tetap penting, tetapi sekarang posisinya menjadi langkah lanjutan yang lebih sehat setelah user punya konteks masalah, tanaman, atau tujuan budidaya."
        eyebrow="Jalur produk"
        title="Belanja di Wiragro tidak berdiri sendiri. Ia tetap ditopang solusi dan edukasi."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Paket & bundle</span>
            <h2>Paket pilihan membantu kebutuhan yang sudah jelas terasa lebih ringkas.</h2>
            <p>
              Bundle memudahkan pembeli memilih paket yang sudah dikurasi, lalu melanjutkannya ke
              checkout, belanja ulang, atau diskusi kebutuhan volume bila dibutuhkan.
            </p>
          </div>
          <Link href="/belanja/paket">Lihat semua paket</Link>
        </div>
        <div className="growth-bundle-grid">
          {featuredBundles.map((bundle) => (
            <GrowthBundleCard bundle={bundle} key={bundle.slug} />
          ))}
        </div>
      </section>

      <StorefrontCategoryDirectory categories={categories} />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk pilihan</span>
            <h2>Produk yang siap dilihat lebih lanjut saat kebutuhan sudah mendekati keputusan beli.</h2>
            <p>
              Jika Anda masih ragu dengan tanaman atau masalahnya, kembali dulu ke solusi atau
              edukasi. Jika konteksnya sudah jelas, lanjutkan dari sini ke katalog yang lebih dalam.
            </p>
          </div>
          <Link href="/produk">Lihat semua produk</Link>
        </div>

        {featuredProducts.items.length ? (
          <div className="product-grid product-grid--catalog storefront-product-grid">
            {featuredProducts.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Produk belum tampil</span>
            <h2>Data katalog sedang dimuat ulang.</h2>
            <p>
              Anda tetap bisa melanjutkan ke halaman produk utama, membuka solusi tanaman, atau
              membaca edukasi sambil sinkronisasi produk diselesaikan.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Buka katalog
              </Link>
              <Link className="btn btn-secondary" href="/solusi">
                Cari solusi
              </Link>
            </div>
          </article>
        )}
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan lanjutan</span>
              <h2>Butuh bantuan menyusun kebutuhan produk atau pembelian rutin?</h2>
              <p>
                Jalur bantuan ini membantu pengguna yang sudah dekat ke pembelian, tetapi masih
                perlu arahan singkat, repeat order, atau diskusi kebutuhan volume.
              </p>
            </div>
            <Link href="/b2b">Buka bantuan bisnis</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
