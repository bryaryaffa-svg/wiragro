import Link from "next/link";

import type { CommerceIntentCard } from "@/lib/growth-commerce";

export function CommerceIntentGrid({
  items,
}: {
  items: CommerceIntentCard[];
}) {
  return (
    <div className="feature-grid feature-grid--paths commerce-intent-grid">
      {items.map((item) => (
        <article className="feature-card feature-card--path commerce-intent-card" key={item.href}>
          <span className="eyebrow-label">{item.eyebrow}</span>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
          {item.href.startsWith("http") ? (
            <a
              className="commerce-intent-card__action"
              href={item.href}
              rel="noreferrer"
              target="_blank"
            >
              {item.actionLabel}
            </a>
          ) : (
            <Link className="commerce-intent-card__action" href={item.href}>
              {item.actionLabel}
            </Link>
          )}
        </article>
      ))}
    </div>
  );
}
