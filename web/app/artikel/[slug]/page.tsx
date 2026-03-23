import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getArticle } from "@/lib/api";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const article = await getArticle(slug);
    return {
      title: article.seo?.title || article.title,
      description: article.seo?.description || article.excerpt || "",
    };
  } catch {
    return { title: "Artikel" };
  }
}

export default async function ArticleDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const article = await getArticle(slug).catch(() => null);

  if (!article) {
    notFound();
  }

  return (
    <article className="content-shell">
      <div className="page-intro">
        <span className="eyebrow-label">Artikel</span>
        <h1>{article.title}</h1>
        {article.excerpt ? <p>{article.excerpt}</p> : null}
      </div>
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: article.body_html }}
      />
    </article>
  );
}
