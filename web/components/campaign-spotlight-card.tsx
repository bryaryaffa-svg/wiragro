import Link from "next/link";

import type { CampaignLandingDefinition } from "@/lib/campaign-content";

export function CampaignSpotlightCard({
  campaign,
}: {
  campaign: CampaignLandingDefinition;
}) {
  return (
    <article className={`campaign-card campaign-card--${campaign.theme}`}>
      <span className="eyebrow-label">{campaign.seasonLabel}</span>
      <strong>{campaign.title}</strong>
      <p>{campaign.description}</p>
      <div className="campaign-card__meta">
        <span>{campaign.focusLabel}</span>
        <span>{campaign.audience}</span>
      </div>
      <Link className="campaign-card__action" href={campaign.href}>
        {campaign.actionLabel}
      </Link>
    </article>
  );
}
