import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import { StorefrontCategoryNavigator } from "@/components/storefront-category-navigator";
import { getCategories, getFallbackProductList, getProducts } from "@/lib/api";
import { getProductRelationCards } from "@/lib/hybrid-navigation";
import { resolveStorefrontCategorySelection } from "@/lib/storefront-category-system";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;
  const category = typeof resolved.kategori === "string" ? resolved.kategori : undefined;
  const mainCategoryKey = typeof resolved.kelompok === "string" ? resolved.kelompok : undefined;
  const subcategory = typeof resolved.subkategori === "string" ? resolved.subkategori : undefined;
  const sort = typeof resolved.sort === "string" ? resolved.sort : undefined;
  const hasRefinement = Boolean(
    search || category || mainCategoryKey || subcategory || (sort && sort !== "latest"),
  );

  return buildCatalogMetadata({
    title: hasRefinement ? "Hasil pencarian produk pertanian" : "Produk Pertanian Wiragro",
    description: hasRefinement
      ? "Hasil pencarian produk pertanian Wiragro. Buka halaman produk utama untuk menjelajahi seluruh produk aktif."
      : "Jelajahi produk pertanian Wiragro: pupuk, benih, pestisida, nutrisi, alat pertanian, bundle, dan penawaran terkait.",
    path: "/produk",
    canonicalPath: "/produk",
    noIndex: hasRefinement,
    keywords: ["katalog produk", "produk pertanian", "pupuk", "benih", "pestisida"],
  });
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;
  const category = typeof resolved.kategori === "string" ? resolved.kategori : undefined;
  const mainCategoryKey = typeof resolved.kelompok === "string" ? resolved.kelompok : undefined;
  const subcategory = typeof resolved.subkategori === "string" ? resolved.subkategori : undefined;
  const sort = typeof resolved.sort === "string" ? resolved.sort : "latest";

  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProducts({ q: search, category_slug: category, sort }),
  ]);
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const products =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : getFallbackProductList({ q: search, category_slug: category, sort });
  const catalogUnavailable = productsResult.status === "rejected";
  const activeCategory = categories.find((item) => item.slug === category);
  const storefrontSelection = resolveStorefrontCategorySelection({
    mainKey: mainCategoryKey,
    subLabel: subcategory,
    categorySlug: category,
    query: search,
  });
  const activeStorefrontMain = storefrontSelection.main;

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildCollectionJsonLd({
            title: "Katalog Produk Pertanian Wiragro",
            description:
              "Katalog produk pertanian aktif dari Wiragro, mulai dari pupuk, benih, pestisida, hingga alat pertanian.",
            path: "/produk",
            itemUrls: products.items.slice(0, 12).map((product) => `/produk/${product.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Produk", path: "/produk" },
          ]),
        ]}
        id="products-page-jsonld"
      />
      <div className="page-intro page-intro--compact">
            <span className="eyebrow-label">Belanja / Katalog</span>
        <h1>
          {activeCategory
            ? `Katalog ${activeCategory.name}`
            : activeStorefrontMain
              ? activeStorefrontMain.label
              : "Produk pertanian Wiragro"}
        </h1>
        <p>
          Gunakan pencarian, kategori, dan urutan untuk menemukan produk yang paling relevan.
          Harga, ketersediaan, dan kategori utama ditampilkan langsung agar proses belanja terasa lebih jelas.
        </p>
      </div>

      <section className="catalog-shell">
        <StorefrontCategoryNavigator
          activeCategorySlug={category}
          activeMainKey={mainCategoryKey}
          activeQuery={search}
          activeSubcategory={subcategory}
          categories={categories}
        />

        <form action="/produk" className="catalog-search-card">
          <div className="catalog-search-card__primary">
            <label className="catalog-search-card__field">
              <span>Cari produk</span>
              <input
                defaultValue={search}
                name="q"
                placeholder="Cari pupuk, benih, pestisida, minyak, gula..."
              />
            </label>
            <label className="catalog-search-card__field catalog-search-card__field--select">
              <span>Urutkan</span>
              <select defaultValue={sort} name="sort">
                <option value="latest">Terbaru</option>
                <option value="promo">Promo aktif</option>
                <option value="best_seller">Paling disorot</option>
                <option value="name_asc">Nama A-Z</option>
                <option value="price_asc">Harga termurah</option>
                <option value="price_desc">Harga tertinggi</option>
              </select>
            </label>
            {mainCategoryKey ? <input name="kelompok" type="hidden" value={mainCategoryKey} /> : null}
            {subcategory ? <input name="subkategori" type="hidden" value={subcategory} /> : null}
            {category ? <input name="kategori" type="hidden" value={category} /> : null}
            <button className="btn btn-primary" type="submit">
              Cari
            </button>
          </div>

          <div className="catalog-chip-row" aria-label="Kategori produk">
            <Link
              className={!category ? "is-active" : undefined}
              href={search ? `/produk?q=${encodeURIComponent(search)}` : "/produk"}
            >
              Semua
            </Link>
            {categories.map((item) => {
              const href = search
                ? `/produk?kategori=${item.slug}&q=${encodeURIComponent(search)}`
                : `/produk?kategori=${item.slug}`;

              return (
                <Link
                  className={category === item.slug ? "is-active" : undefined}
                  href={href}
                  key={item.id}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </form>

        <div className="catalog-results-header">
          <div>
            <span className="eyebrow-label">Hasil pencarian</span>
            <h2>{products.pagination.count} produk tersedia</h2>
          </div>
          <span>{search ? `Kata kunci: "${search}"` : "Menampilkan seluruh produk aktif"}</span>
        </div>

        {catalogUnavailable ? (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Katalog belum dapat dimuat</span>
            <h2>Daftar produk sementara belum bisa dimuat.</h2>
            <p>
              Silakan muat ulang halaman beberapa saat lagi. Pencarian dan filter Anda tetap
              dipertahankan.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Muat ulang katalog
              </Link>
            </div>
          </article>
        ) : products.items.length ? (
          <div className="product-grid product-grid--catalog">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Produk tidak ditemukan</span>
            <h2>Tidak ada produk yang cocok dengan filter saat ini</h2>
            <p>Coba ubah kata kunci, reset kategori, atau kembali ke seluruh katalog aktif.</p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Lihat semua produk
              </Link>
            </div>
          </article>
        )}
      </section>

      <PathwaySection
        cards={getProductRelationCards(undefined, activeCategory)}
        description="Katalog perlu tetap fokus pada pembelian, tetapi selalu memberi jalan kembali ke belajar dan solusi saat kebutuhan belum benar-benar final."
        eyebrow="Relasi silang"
        title="Belanja yang sehat tetap terhubung ke konteks."
      />
    </section>
  );
}
