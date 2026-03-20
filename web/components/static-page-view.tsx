import { notFound } from "next/navigation";

import { getStaticPage } from "@/lib/api";

export async function StaticPageView({ slug }: { slug: string }) {
  const page = await getStaticPage(slug);
  if ("detail" in (page as unknown as { detail?: string })) {
    notFound();
  }

  return (
    <article className="content-shell">
      <div className="page-intro">
        <span className="eyebrow-label">Informasi</span>
        <h1>{page.title}</h1>
        {page.excerpt ? <p>{page.excerpt}</p> : null}
      </div>
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: page.body_html }}
      />
    </article>
  );
}
