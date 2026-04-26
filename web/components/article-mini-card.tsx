import Link from "next/link";

import type { ArticleSummaryPayload } from "@/lib/api";

export function ArticleMiniCard({ article }: { article: ArticleSummaryPayload }) {
  return (
    <article className="chat-mini-card">
      <div className="chat-mini-card__body">
        <span className="eyebrow-label">Artikel terkait</span>
        <strong>{article.title}</strong>
        <p>{article.excerpt || "Panduan ini membantu memperjelas konteks masalah sebelum membeli produk."}</p>
        <Link className="btn btn-secondary" href={`/artikel/${article.slug}`}>
          Baca artikel
        </Link>
      </div>
    </article>
  );
}
