import Link from "next/link";

import { AgriIcon } from "@/components/ui/agri-icon";
import type { SolutionSummary } from "@/lib/solution-content";

function pickSolutionIcon(solution: SolutionSummary) {
  const haystack = `${solution.title} ${solution.taxonomy_labels.join(" ")}`.toLowerCase();

  if (haystack.includes("daun")) {
    return "yellow-leaf" as const;
  }
  if (haystack.includes("hama")) {
    return "pest" as const;
  }
  if (haystack.includes("buah") || haystack.includes("bunga")) {
    return "fruit-drop" as const;
  }
  if (haystack.includes("akar")) {
    return "root" as const;
  }
  if (haystack.includes("jamur") || haystack.includes("bercak")) {
    return "fungus" as const;
  }

  return "solution" as const;
}

export function SolutionCard({
  solution,
  href = `/solusi/masalah/${solution.slug}`,
}: {
  solution: SolutionSummary;
  href?: string;
}) {
  return (
    <article className="solution-card">
      <span className="solution-card__icon">
        <AgriIcon name={pickSolutionIcon(solution)} />
      </span>
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
