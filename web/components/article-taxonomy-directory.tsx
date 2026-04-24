import Link from "next/link";

import {
  ARTICLE_TAXONOMY_SECTIONS,
  type ArticleFilterState,
  buildArticleTaxonomyBrowseHref,
  buildArticleFilterHref,
  getArticleTaxonomySegment,
} from "@/lib/article-content";

export function ArticleTaxonomyDirectory({
  filters,
  mode = "filter",
  activeTaxonomy,
  activeSlug,
  availableSlugs,
}: {
  filters: ArticleFilterState;
  mode?: "filter" | "browse";
  activeTaxonomy?: string;
  activeSlug?: string;
  availableSlugs?: Partial<Record<Exclude<keyof ArticleFilterState, "q">, string[]>>;
}) {
  return (
    <section className="article-taxonomy-directory">
      {ARTICLE_TAXONOMY_SECTIONS.map((section) => {
        const segment = getArticleTaxonomySegment(section.queryKey);
        const visibleItems = section.items.filter((item) =>
          availableSlugs?.[section.queryKey]
            ? availableSlugs[section.queryKey]?.includes(item.slug)
            : true,
        );

        if (!visibleItems.length) {
          return null;
        }

        return (
          <article className="article-taxonomy-group" key={section.key}>
            <div className="article-taxonomy-group__header">
              <strong>{section.title}</strong>
              <p>{section.description}</p>
            </div>
            <div className="article-taxonomy-group__chips">
              {visibleItems.map((item) => {
                const isActive =
                  mode === "browse"
                    ? activeTaxonomy === segment && activeSlug === item.slug
                    : filters[section.queryKey] === item.slug;
                const href =
                  mode === "browse"
                    ? isActive
                      ? buildArticleTaxonomyBrowseHref(section.queryKey)
                      : buildArticleTaxonomyBrowseHref(section.queryKey, item.slug)
                    : buildArticleFilterHref(
                        filters,
                        section.queryKey,
                        isActive ? undefined : item.slug,
                      );

                return (
                  <Link
                    className={isActive ? "is-active" : undefined}
                    href={href}
                    key={`${section.key}-${item.slug}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </article>
        );
      })}
    </section>
  );
}
