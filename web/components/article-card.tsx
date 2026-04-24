import Link from "next/link";

import { formatDate } from "@/lib/format";

export function ArticleCard({
  article,
  href = `/artikel/${article.slug}`,
}: {
  article: {
    slug: string;
    title: string;
    excerpt?: string | null;
    published_at?: string | null;
    reading_time_minutes?: number;
    taxonomy_labels?: string[];
  };
  href?: string | null;
}) {
  const isLinked = Boolean(href);
  const safeHref = href ?? "/artikel";

  return (
    <article className="article-card">
      <span className="eyebrow-label">Field Notes</span>
      {article.taxonomy_labels?.length ? (
        <div className="article-card__chips">
          {article.taxonomy_labels.slice(0, 3).map((label) => (
            <span key={`${article.slug}-${label}`}>{label}</span>
          ))}
        </div>
      ) : null}
      <h3>
        {isLinked ? <Link href={safeHref}>{article.title}</Link> : <span>{article.title}</span>}
      </h3>
      <p>{article.excerpt || "Artikel ini sedang disiapkan untuk modul konten storefront."}</p>
      <div className="article-card__footer">
        <span>
          {formatDate(article.published_at)}
          {article.reading_time_minutes ? ` • ${article.reading_time_minutes} menit` : ""}
        </span>
        {isLinked ? <Link href={safeHref}>Baca artikel</Link> : <span>Segera tersedia</span>}
      </div>
    </article>
  );
}
