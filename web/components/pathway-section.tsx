import Link from "next/link";

import type { PathwayCard } from "@/lib/hybrid-navigation";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PathwaySection({
  eyebrow,
  title,
  description,
  cards,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  cards: PathwayCard[];
  action?: {
    href: string;
    label: string;
  };
  className?: string;
}) {
  return (
    <section className={joinClassNames("section-block pathway-section", className)}>
      <div className="section-heading section-heading--pathway">
        <div>
          <span className="eyebrow-label">{eyebrow}</span>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {action ? <Link href={action.href}>{action.label}</Link> : null}
      </div>

      <div className="feature-grid feature-grid--paths pathway-section__grid">
        {cards.map((card) => (
          <article
            className={`feature-card feature-card--path pathway-card pathway-card--${card.pillar}`}
            key={`${card.pillar}-${card.title}`}
          >
            <span className="eyebrow-label">{card.eyebrow}</span>
            <strong>{card.title}</strong>
            <p>{card.description}</p>
            {card.bullets?.length ? (
              <ul className="plain-list pathway-card__bullets">
                {card.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : null}
            {card.supportingLinks?.length ? (
              <div className="pathway-card__links">
                {card.supportingLinks.map((link) => (
                  <Link href={link.href} key={`${card.title}-${link.href}`}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
            <Link className="pathway-card__action" href={card.href}>
              {card.actionLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
