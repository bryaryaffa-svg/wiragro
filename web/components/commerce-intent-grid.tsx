import { CommerceIntentLink } from "@/components/commerce-intent-link";
import type { CommerceIntentCard } from "@/lib/growth-commerce";

export function CommerceIntentGrid({
  items,
}: {
  items: CommerceIntentCard[];
}) {
  return (
    <div className="feature-grid feature-grid--paths commerce-intent-grid">
      {items.map((item) => (
        <article
          className="feature-card feature-card--path commerce-intent-card"
          key={item.leadRef}
        >
          <span className="eyebrow-label">{item.eyebrow}</span>
          <strong>{item.title}</strong>
          <p>{item.description}</p>
          <CommerceIntentLink
            className="commerce-intent-card__action"
            href={item.href}
            leadRef={item.leadRef}
            leadSummary={item.leadSummary}
            tracking={item.tracking}
          >
            {item.actionLabel}
          </CommerceIntentLink>
        </article>
      ))}
    </div>
  );
}
