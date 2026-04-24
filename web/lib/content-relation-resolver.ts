import {
  getProduct,
  type ArticleSummaryPayload,
  type ProductDetailPayload,
  type ProductSummary,
} from "@/lib/api";
import { getFallbackArticleSummaries } from "@/lib/article-content";
import {
  getCampaignLanding,
  type CampaignLandingDefinition,
} from "@/lib/campaign-content";
import {
  getGrowthBundle,
  type GrowthBundleDefinition,
} from "@/lib/growth-commerce";
import { getSolutionBySlug, type SolutionSummary } from "@/lib/solution-content";
import type { ContentRelationIssue, ContentRelationKind } from "@/lib/content-reference-catalog";

type ResolvedRelationResult<T> = {
  items: T[];
  missing: ContentRelationIssue[];
};

function uniqueByKey<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = getKey(item);

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildMissing(kind: ContentRelationKind, slugs: string[]): ContentRelationIssue[] {
  return [...new Set(slugs)].map((slug) => ({
    kind,
    slug,
  }));
}

export function resolveArticleReferences(
  slugs: string[],
  articlePool?: ArticleSummaryPayload[],
): ResolvedRelationResult<ArticleSummaryPayload> {
  const mergedPool = uniqueByKey(
    [...(articlePool ?? []), ...getFallbackArticleSummaries()],
    (item) => item.slug,
  );
  const bySlug = new Map(mergedPool.map((item) => [item.slug, item]));
  const items = slugs
    .map((slug) => bySlug.get(slug) ?? null)
    .filter((item): item is ArticleSummaryPayload => Boolean(item));
  const missing = buildMissing(
    "article",
    slugs.filter((slug) => !bySlug.has(slug)),
  );

  return {
    items: uniqueByKey(items, (item) => item.slug),
    missing,
  };
}

export function resolveSolutionReferences(
  slugs: string[],
): ResolvedRelationResult<SolutionSummary> {
  const items = slugs
    .map((slug) => getSolutionBySlug(slug))
    .filter((item): item is SolutionSummary => Boolean(item));
  const found = new Set(items.map((item) => item.slug));

  return {
    items: uniqueByKey(items, (item) => item.slug),
    missing: buildMissing(
      "solution",
      slugs.filter((slug) => !found.has(slug)),
    ),
  };
}

export function resolveBundleReferences(
  slugs: string[],
): ResolvedRelationResult<GrowthBundleDefinition> {
  const items = slugs
    .map((slug) => getGrowthBundle(slug))
    .filter((item): item is GrowthBundleDefinition => Boolean(item));
  const found = new Set(items.map((item) => item.slug));

  return {
    items: uniqueByKey(items, (item) => item.slug),
    missing: buildMissing(
      "bundle",
      slugs.filter((slug) => !found.has(slug)),
    ),
  };
}

export function resolveCampaignReferences(
  slugs: string[],
): ResolvedRelationResult<CampaignLandingDefinition> {
  const items = slugs
    .map((slug) => getCampaignLanding(slug))
    .filter((item): item is CampaignLandingDefinition => Boolean(item));
  const found = new Set(items.map((item) => item.slug));

  return {
    items: uniqueByKey(items, (item) => item.slug),
    missing: buildMissing(
      "campaign",
      slugs.filter((slug) => !found.has(slug)),
    ),
  };
}

export async function resolveProductReferences(
  slugs: string[],
): Promise<ResolvedRelationResult<ProductSummary>> {
  const results: Array<ProductDetailPayload | null> = await Promise.all(
    slugs.map(async (slug) => {
      try {
        return await getProduct(slug);
      } catch {
        return null;
      }
    }),
  );
  const items = results.filter((item): item is ProductDetailPayload => Boolean(item));
  const found = new Set(items.map((item) => item.slug));

  return {
    items: uniqueByKey(items, (item) => item.slug),
    missing: buildMissing(
      "product",
      slugs.filter((slug) => !found.has(slug)),
    ),
  };
}
