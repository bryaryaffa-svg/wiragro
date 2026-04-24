import Link from "next/link";

import {
  SOLUTION_TAXONOMY_SECTIONS,
  buildSolutionTaxonomyBrowseHref,
  buildSolutionFilterHref,
  getSolutionTaxonomySegment,
  type SolutionFilterState,
} from "@/lib/solution-content";

export function SolutionTaxonomyDirectory({
  filters,
  mode = "filter",
  activeTaxonomy,
  activeSlug,
  availableSlugs,
}: {
  filters: SolutionFilterState;
  mode?: "filter" | "browse";
  activeTaxonomy?: string;
  activeSlug?: string;
  availableSlugs?: Partial<Record<Exclude<keyof SolutionFilterState, "q">, string[]>>;
}) {
  return (
    <div className="article-taxonomy-directory">
      {SOLUTION_TAXONOMY_SECTIONS.map((section) => {
        const segment = getSolutionTaxonomySegment(section.queryKey);
        const visibleItems = section.items.filter((item) =>
          availableSlugs?.[section.queryKey]
            ? availableSlugs[section.queryKey]?.includes(item.slug)
            : true,
        );

        if (!visibleItems.length) {
          return null;
        }

        return (
          <section className="article-taxonomy-group" key={section.key}>
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
                      ? buildSolutionTaxonomyBrowseHref(section.queryKey)
                      : buildSolutionTaxonomyBrowseHref(section.queryKey, item.slug)
                    : buildSolutionFilterHref(
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
          </section>
        );
      })}
    </div>
  );
}
