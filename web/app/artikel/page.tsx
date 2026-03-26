import { ArticleCard } from "@/components/article-card";
import { getArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === "string" ? resolved.q : undefined;
  const articles = await getArticles({ q: query, page_size: 9 });

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Artikel / Blog</span>
        <h1>Konten edukasi pertanian</h1>
        <p>
          Artikel disusun untuk SEO dan edukasi customer, dengan layout yang lebih rapi dan
          konsisten dengan storefront produk.
        </p>
      </div>

      <form action="/artikel" className="filter-form filter-form--inline">
        <input defaultValue={query} name="q" placeholder="Cari artikel..." />
        <button className="btn btn-primary" type="submit">
          Cari
        </button>
      </form>

      {articles.items.length ? (
        <div className="article-grid">
          {articles.items.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      ) : (
        <article className="empty-state">
          <span className="eyebrow-label">Konten belum tersedia</span>
          <h2>Artikel dari SiGe Manager belum dipublikasikan.</h2>
          <p>
            Katalog produk publik sudah dipindahkan ke backend Laravel. Modul artikel akan
            diaktifkan setelah endpoint konten tersedia di backend yang sama.
          </p>
        </article>
      )}
    </section>
  );
}
