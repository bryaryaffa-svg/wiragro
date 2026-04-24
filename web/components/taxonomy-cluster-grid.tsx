import Link from "next/link";

type TaxonomyClusterItem = {
  href: string;
  label: string;
  description: string;
  count: number;
  meta?: string;
  actionLabel?: string;
};

export function TaxonomyClusterGrid({
  items,
  eyebrow = "Cluster",
  actionLabel = "Buka jalur",
}: {
  items: TaxonomyClusterItem[];
  eyebrow?: string;
  actionLabel?: string;
}) {
  return (
    <div className="feature-grid feature-grid--paths taxonomy-cluster-grid">
      {items.map((item) => (
        <article className="feature-card feature-card--path taxonomy-cluster-card" key={item.href}>
          <span className="eyebrow-label">{eyebrow}</span>
          <strong>{item.label}</strong>
          <p>{item.description}</p>
          <div className="taxonomy-cluster-card__meta">
            <span>{item.count} konten</span>
            {item.meta ? <span>{item.meta}</span> : null}
          </div>
          <Link className="taxonomy-cluster-card__action" href={item.href}>
            {item.actionLabel ?? actionLabel}
          </Link>
        </article>
      ))}
    </div>
  );
}
