import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/api";

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
  const sort = typeof resolved.sort === "string" ? resolved.sort : "latest";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ q: search, category_slug: category, sort }),
  ]);
  const activeCategory = categories.find((item) => item.slug === category);

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Katalog produk</span>
        <h1>
          {activeCategory
            ? `Kategori ${activeCategory.name}`
            : "Temukan produk yang mudah dicari di layar kecil"}
        </h1>
        <p>
          Search, kategori, dan urutan katalog dibuat lebih ringkas agar user bisa cepat
          menemukan produk lalu langsung menambahkannya ke keranjang.
        </p>
      </div>

      <section className="catalog-shell">
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
            <h2>{products.pagination.count} item ditemukan</h2>
          </div>
          <span>{search ? `Kata kunci: "${search}"` : "Semua produk aktif"}</span>
        </div>

        {products.items.length ? (
          <div className="product-grid product-grid--catalog">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Produk tidak ditemukan</span>
            <h2>Tidak ada item yang cocok dengan filter saat ini</h2>
            <p>Coba ganti kata kunci, reset kategori, atau kembali ke semua produk aktif.</p>
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
