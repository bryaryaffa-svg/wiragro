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
  title: "Jalur Produk Pertanian di Wiragro",
  description:
    "Jelajahi kategori, produk pilihan, bundle, dan campaign resmi Wiragro dari satu jalur produk yang lebih rapi.",
  path: "/belanja",
  canonicalPath: "/belanja",
  keywords: ["produk pertanian wiragro", "jalur produk pertanian", "bundle dan campaign pertanian"],
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
            title: "Jalur Produk Pertanian di Wiragro",
            description:
              "Halaman produk yang menjaga konteks edukasi dan solusi sebelum Anda turun ke katalog.",
            path: "/belanja",
          }),
          buildCollectionJsonLd({
            title: "Produk Wiragro",
            description:
              "Pintu masuk produk, bundle, dan campaign resmi sebelum Anda turun ke katalog produk aktif.",
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
          <span className="eyebrow-label">Produk</span>
          <h1>Produk, bundle, dan campaign resmi kini hadir dalam satu jalur yang lebih jelas.</h1>
          <p>
            Halaman ini membantu Anda masuk dari kategori, bundle, campaign, atau katalog produk
            tanpa kehilangan konteks solusi dan edukasi yang sudah dibangun di website.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="/produk">
              Buka semua produk
            </Link>
            <Link className="btn btn-secondary" href="/solusi">
              Masuk dari solusi
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Masuk dari</span>
            <strong>Kebutuhan yang sudah jelas, ingin cepat, atau siap dibeli</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Mempercepat pencarian kategori, penawaran resmi, dan produk aktif</strong>
          </div>
          <div>
            <span>Jaga keputusan</span>
            <strong>Semua jalur tetap terhubung ke solusi, edukasi, dan katalog aktif</strong>
          </div>
        </div>
      </section>

      <PathwaySection
        action={{ href: "/produk", label: "Masuk ke katalog" }}
        cards={getShoppingHubCards()}
        description="Jalur produk tetap kuat, tetapi tidak lagi menjadi satu-satunya wajah situs. User bisa selalu kembali ke edukasi atau solusi saat konteksnya belum cukup."
        eyebrow="Jalur produk"
        title="Masuk ke penawaran resmi tanpa memutus konteks yang dibangun di dua pilar lainnya."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Paket & bundle</span>
            <h2>Paket pilihan yang memudahkan pembeli menentukan kebutuhan.</h2>
            <p>
              Bundle membantu pembeli memilih paket yang sudah dikurasi, lalu membuka jalur
              ke pembelian partai atau belanja ulang bila dibutuhkan.
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
            <h2>Pilihan awal untuk pembeli yang sudah siap bertransaksi.</h2>
            <p>
              Hub ini sengaja tidak menggantikan katalog lama. Ia hanya merapikan pintu
              masuk sebelum Anda turun ke listing produk yang lebih dalam.
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
            <h2>Halaman produk aktif, tetapi data katalog sedang tidak berhasil dimuat.</h2>
            <p>
              Route lama tetap tersedia dan bisa dipakai ulang begitu data produk kembali aktif.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Buka katalog
              </Link>
            </div>
          </article>
        )}
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Growth entry</span>
              <h2>Belanja sekarang punya jalur bantuan yang lebih siap dipakai.</h2>
            </div>
            <Link href="/b2b">B2B inquiry</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
