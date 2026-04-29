"use client";

import Image from "next/image";
import Link from "next/link";

import { trackUiEvent } from "@/lib/analytics";
import { formatDate } from "@/lib/format";
import { WIRAGRO_CATEGORY_ASSETS } from "@/lib/wiragro-assets";

export function pickArticleVisual(article: {
  title: string;
  taxonomy_labels?: string[];
}) {
  const haystack = `${article.title} ${(article.taxonomy_labels ?? []).join(" ")}`.toLowerCase();

  if (haystack.includes("benih") || haystack.includes("bibit")) {
    return WIRAGRO_CATEGORY_ASSETS.benih;
  }
  if (haystack.includes("pupuk") || haystack.includes("nutrisi")) {
    return WIRAGRO_CATEGORY_ASSETS.pupuk;
  }
  if (haystack.includes("hama") || haystack.includes("penyakit")) {
    return WIRAGRO_CATEGORY_ASSETS.pesticide;
  }
  if (haystack.includes("fase") || haystack.includes("persemaian")) {
    return WIRAGRO_CATEGORY_ASSETS.decorativeSeedling;
  }

  return WIRAGRO_CATEGORY_ASSETS.education;
}

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
  const visual = pickArticleVisual(article);
  const isIllustration =
    visual.includes("/illustrations/") ||
    visual.includes("/wiragro-illustrations/") ||
    visual.endsWith(".svg");

  return (
    <article className="article-card">
      <Link
        className="article-card__media"
        href={safeHref}
        onClick={() =>
          trackUiEvent("read_article", {
            slug: article.slug,
            title: article.title,
          })
        }
      >
        <Image
          alt={article.title}
          className={isIllustration ? "article-card__image article-card__image--illustration" : "article-card__image"}
          fill
          sizes="(max-width: 768px) 92vw, (max-width: 1200px) 32vw, 24vw"
          src={visual}
        />
      </Link>
      <span className="eyebrow-label">Edukasi</span>
      {article.taxonomy_labels?.length ? (
        <div className="article-card__chips">
          {article.taxonomy_labels.slice(0, 3).map((label) => (
            <span key={`${article.slug}-${label}`}>{label}</span>
          ))}
        </div>
      ) : null}
      <h3>
        {isLinked ? (
          <Link
            href={safeHref}
            onClick={() =>
              trackUiEvent("read_article", {
                slug: article.slug,
                title: article.title,
              })
            }
          >
            {article.title}
          </Link>
        ) : (
          <span>{article.title}</span>
        )}
      </h3>
      <p>
        {article.excerpt ||
          "Panduan ini membantu Anda memahami konteks lapangan sebelum memilih solusi atau produk yang lebih tepat."}
      </p>
      <div className="article-card__footer">
        <span>
          {formatDate(article.published_at)}
          {article.reading_time_minutes ? ` | ${article.reading_time_minutes} menit` : ""}
        </span>
        {isLinked ? (
          <Link
            href={safeHref}
            onClick={() =>
              trackUiEvent("read_article", {
                slug: article.slug,
                title: article.title,
              })
            }
          >
            Baca
          </Link>
        ) : (
          <span>Lihat ringkasan</span>
        )}
      </div>
    </article>
  );
}
