import Link from "next/link";

import { formatDate } from "@/lib/format";

export function ArticleCard({
  article,
}: {
  article: {
    slug: string;
    title: string;
    excerpt?: string | null;
    published_at?: string | null;
  };
}) {
  return (
    <article className="article-card">
      <span className="eyebrow-label">Field Notes</span>
      <h3>
        <Link href={`/artikel/${article.slug}`}>{article.title}</Link>
      </h3>
      <p>{article.excerpt || "Artikel ini sedang disiapkan untuk modul konten storefront."}</p>
      <div className="article-card__footer">
        <span>{formatDate(article.published_at)}</span>
        <Link href={`/artikel/${article.slug}`}>Baca artikel</Link>
      </div>
    </article>
  );
}
