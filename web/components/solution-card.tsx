import Link from "next/link";

import type { SolutionSummary } from "@/lib/solution-content";

export function SolutionCard({
  solution,
  href = `/solusi/masalah/${solution.slug}`,
}: {
  solution: SolutionSummary;
  href?: string;
}) {
  return (
    <article className="solution-card">
      <div className="solution-card__body">
        <span className="eyebrow-label">Cari Solusi</span>
        <h3>
          <Link href={href}>{solution.title}</Link>
        </h3>
        <p>{solution.excerpt}</p>
        {solution.taxonomy_labels.length ? (
          <div className="solution-card__chips">
            {solution.taxonomy_labels.slice(0, 4).map((label) => (
              <span key={`${solution.slug}-${label}`}>{label}</span>
            ))}
          </div>
        ) : null}
        <ul className="plain-list solution-card__list">
          {solution.probable_causes.slice(0, 2).map((item) => (
            <li key={`${solution.slug}-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
      <Link className="solution-card__action" href={href}>
        Buka solusi
      </Link>
    </article>
  );
}
