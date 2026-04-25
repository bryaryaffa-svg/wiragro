import { CAMPAIGN_LANDING_SOURCES } from "@/lib/commercial-content/campaigns";
import {
  type CommercialEntryOps,
  type CommercialPublicationState,
  type CommercialQueryOptions,
  filterCommercialEntries,
  resolveCommercialPublicationState,
  sortCommercialEntriesByPriority,
} from "@/lib/commercial-content/shared";
import { buildCampaignHref } from "@/lib/content-reference-catalog";

export type CampaignTheme = "rain" | "field" | "leaf";

export type CampaignLandingDefinition = {
  slug: string;
  title: string;
  description: string;
  summary: string;
  seasonLabel: string;
  focusLabel: string;
  audience: string;
  theme: CampaignTheme;
  href: string;
  catalogHref: string;
  actionLabel: string;
  bundleSlugs: string[];
  relatedArticleSlugs: string[];
  relatedSolutionSlugs: string[];
  relatedCommoditySlugs: string[];
  productSlugs: string[];
  outcomes: string[];
  ops: CommercialEntryOps;
  publicationState: CommercialPublicationState;
};

export type CampaignLandingSourceDefinition = Omit<
  CampaignLandingDefinition,
  "href" | "publicationState"
>;

function hydrateCampaignLanding(
  source: CampaignLandingSourceDefinition,
  now = new Date(),
): CampaignLandingDefinition {
  return {
    ...source,
    href: buildCampaignHref(source.slug),
    publicationState: resolveCommercialPublicationState(source.ops, now),
  };
}

function getHydratedCampaignLandings(now = new Date()) {
  return sortCommercialEntriesByPriority(
    CAMPAIGN_LANDING_SOURCES.map((campaign) => hydrateCampaignLanding(campaign, now)),
  );
}

export function getAllCampaignLandingDefinitions(
  options: Pick<CommercialQueryOptions, "now"> = {},
) {
  return getHydratedCampaignLandings(options.now ?? new Date());
}

export function getAllCampaignLandings(options: CommercialQueryOptions = {}) {
  const now = options.now ?? new Date();
  return filterCommercialEntries(getHydratedCampaignLandings(now), options);
}

export function getCampaignLanding(
  slug: string,
  options: CommercialQueryOptions = {},
) {
  const campaigns = options.includeInactive
    ? getAllCampaignLandingDefinitions({ now: options.now })
    : getAllCampaignLandings(options);

  return campaigns.find((item) => item.slug === slug) ?? null;
}

export function getFeaturedCampaignLandings(
  limit = 3,
  options: CommercialQueryOptions = {},
) {
  return getAllCampaignLandings(options).slice(0, limit);
}

export function getCampaignLandingsForCommodity(
  commoditySlug?: string | null,
  limit = 2,
  options: CommercialQueryOptions = {},
) {
  if (!commoditySlug) {
    return [];
  }

  return getAllCampaignLandings(options)
    .filter((item) => item.relatedCommoditySlugs.includes(commoditySlug))
    .slice(0, limit);
}

export function getCampaignLandingsForSolution(
  input: {
    solutionSlug?: string | null;
    commoditySlugs?: string[];
  },
  limit = 2,
  options: CommercialQueryOptions = {},
) {
  return getAllCampaignLandings(options)
    .map((item) => {
      let score = 0;

      if (input.solutionSlug && item.relatedSolutionSlugs.includes(input.solutionSlug)) {
        score += 3;
      }

      const commodityMatches = (input.commoditySlugs ?? []).filter((slug) =>
        item.relatedCommoditySlugs.includes(slug),
      ).length;
      score += commodityMatches * 2;

      return {
        item,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.item.ops.priority - left.item.ops.priority;
    })
    .slice(0, limit)
    .map((entry) => entry.item);
}
