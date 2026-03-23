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

  return (
    <div className="catalog-layout">
      <aside className="catalog-sidebar">
        <span className="eyebrow-label">Filter katalog</span>
        <h1>Produk pertanian</h1>
        <p className="catalog-sidebar__lead">
          Cari produk, ubah urutan, dan lompat cepat ke kategori yang paling relevan.
        </p>
        <form className="filter-form">
          <label>
            Cari produk
            <input defaultValue={search} name="q" placeholder="Nama atau kata kunci" />
          </label>
          <label>
            Urutkan
            <select defaultValue={sort} name="sort">
              <option value="latest">Terbaru</option>
              <option value="best_seller">Terlaris</option>
              <option value="name_asc">Nama A-Z</option>
            </select>
          </label>
          <button className="btn btn-primary" type="submit">
            Terapkan
          </button>
        </form>

        <div className="chip-list">
          {categories.map((item) => (
            <Link href={`/produk?kategori=${item.slug}`} key={item.id}>
              {item.name}
            </Link>
          ))}
        </div>
      </aside>

      <section className="catalog-content">
        <div className="page-intro page-intro--compact">
          <span className="eyebrow-label">Katalog</span>
          <h1>{category ? `Kategori: ${category}` : "Semua produk yang aktif di storefront"}</h1>
          <p>
            Tampilan katalog disusun agar lebih nyaman dipindai, baik dari desktop maupun mobile.
          </p>
        </div>
        <div className="section-heading section-heading--catalog">
          <div>
            <span className="eyebrow-label">Hasil pencarian</span>
            <h2>{products.pagination.count} item ditemukan</h2>
          </div>
          <span>{search ? `Kata kunci: "${search}"` : "Semua produk aktif"}</span>
        </div>
        <div className="product-grid">
          {products.items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
