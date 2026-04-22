import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { StorefrontCategoryNavigator } from "@/components/storefront-category-navigator";
import { getCategories, getFallbackProductList, getProducts } from "@/lib/api";
import { resolveStorefrontCategorySelection } from "@/lib/storefront-category-system";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

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
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Katalog produk</span>
        <h1>
          {activeCategory
            ? `Katalog ${activeCategory.name}`
            : activeStorefrontMain
              ? activeStorefrontMain.label
              : "Katalog produk Sidomakmur"}
        </h1>
        <p>
          Gunakan pencarian, kategori, dan urutan untuk menemukan produk yang Anda butuhkan.
          Harga, status stok, dan kategori utama ditampilkan langsung di katalog.
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
            <h2>Daftar produk sementara tidak tersedia dari server.</h2>
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
    </section>
  );
}
