import Link from "next/link";

import { AgriIcon } from "@/components/ui/agri-icon";

export function IconCard({
  actionLabel = "Buka",
  description,
  eyebrow,
  href,
  icon,
  title,
  tone = "default",
}: {
  actionLabel?: string;
  description: string;
  eyebrow?: string;
  href: string;
  icon: Parameters<typeof AgriIcon>[0]["name"];
  title: string;
  tone?: "accent" | "default";
}) {
  return (
    <article className={`icon-card icon-card--${tone}`}>
      <span className="icon-card__icon">
        <AgriIcon name={icon} />
      </span>
      <div className="icon-card__copy">
        {eyebrow ? <span className="eyebrow-label">{eyebrow}</span> : null}
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <Link className="icon-card__action" href={href}>
        {actionLabel}
      </Link>
    </article>
  );
}
