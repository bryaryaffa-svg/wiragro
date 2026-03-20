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
      <div className="page-intro">
        <span className="eyebrow-label">Artikel / Blog</span>
        <h1>Konten edukasi pertanian</h1>
        <p>
          Halaman artikel ini disiapkan untuk SEO dan penguatan konten produk pertanian.
        </p>
      </div>

      <form action="/artikel" className="filter-form filter-form--inline">
        <input defaultValue={query} name="q" placeholder="Cari artikel..." />
        <button className="btn btn-primary" type="submit">
          Cari
        </button>
      </form>

      <div className="article-grid">
        {articles.items.map((article) => (
          <ArticleCard article={article} key={article.slug} />
        ))}
      </div>
    </section>
  );
}
