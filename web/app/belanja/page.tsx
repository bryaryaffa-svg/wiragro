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
  title: "Belanja Produk Pertanian di Wiragro",
  description:
    "Masuk ke hub belanja Wiragro untuk menjelajahi kategori, produk pilihan, dan jalur beli yang tetap terhubung ke belajar dan solusi.",
  path: "/belanja",
  canonicalPath: "/belanja",
  keywords: ["belanja produk pertanian", "hub belanja wiragro", "kategori produk pertanian"],
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
    bundleTitle: "paket belanja pertanian",
  }).filter((item) => item.title !== "Repeat order via WA");

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Belanja Produk Pertanian di Wiragro",
            description:
              "Hub belanja yang tetap menjaga konteks belajar dan solusi sebelum user turun ke katalog lama.",
            path: "/belanja",
          }),
          buildCollectionJsonLd({
            title: "Hub Belanja Wiragro",
            description:
              "Pintu masuk komersial yang lebih rapi sebelum user turun ke katalog produk aktif.",
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
          <span className="eyebrow-label">Belanja</span>
          <h1>Katalog tetap jadi mesin conversion, tetapi sekarang punya pintu masuk yang lebih jelas.</h1>
          <p>
            Hub belanja memisahkan intent beli dari intent belajar atau menyelesaikan masalah,
            sambil tetap mengalirkan user ke katalog lama yang sudah siap dipakai.
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
            <strong>Kebutuhan yang sudah jelas dan siap dibeli</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Mempercepat pencarian kategori, promo, dan produk aktif</strong>
          </div>
          <div>
            <span>Jaga conversion</span>
            <strong>Route katalog lama tetap hidup agar transisi tidak merusak UX</strong>
          </div>
        </div>
      </section>

      <PathwaySection
        action={{ href: "/produk", label: "Masuk ke katalog" }}
        cards={getShoppingHubCards()}
        description="Belanja tetap kuat, tetapi tidak lagi menjadi satu-satunya wajah situs. User bisa selalu kembali ke belajar atau solusi saat konteksnya belum cukup."
        eyebrow="Hub belanja"
        title="Masuk ke jalur komersial tanpa memutus konteks yang dibangun di dua pilar lainnya."
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Paket & bundle</span>
            <h2>Landing komersial yang lebih siap untuk assisted conversion.</h2>
            <p>
              Bundle hub dipakai untuk menaikkan AOV, memudahkan user memilih paket yang
              sudah dikurasi, dan membuka jalur masuk ke pembelian partai atau repeat order.
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
            <h2>Pilihan awal untuk user yang sudah siap bertransaksi.</h2>
            <p>
              Hub ini sengaja tidak menggantikan katalog lama. Ia hanya merapikan pintu
              masuk sebelum user turun ke listing produk yang lebih dalam.
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
            <h2>Hub belanja aktif, tetapi data katalog sedang tidak berhasil dimuat.</h2>
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
              <h2>Belanja sekarang punya jalur assisted selling yang lebih siap dipakai.</h2>
            </div>
            <Link href="/b2b">B2B inquiry</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
