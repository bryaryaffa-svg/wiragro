import { getFallbackArticleSummaries } from "@/lib/article-content";
import { getAllCampaignLandings } from "@/lib/campaign-content";
import { getAllCommodityHubs } from "@/lib/commodity-content";
import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  CAMPAIGN_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  PRODUCT_REFERENCE_SLUGS,
  SOLUTION_REFERENCE_SLUGS,
  buildBundleHref,
  buildCampaignHref,
} from "@/lib/content-reference-catalog";
import { getAllGrowthBundles } from "@/lib/growth-commerce";
import { getAllSolutions } from "@/lib/solution-content";

let validated = false;

function assertUnique(kind: string, slugs: string[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  slugs.forEach((slug) => {
    if (seen.has(slug)) {
      duplicates.add(slug);
      return;
    }

    seen.add(slug);
  });

  if (duplicates.size) {
    throw new Error(
      `[content-relations] Ditemukan slug ${kind} duplikat: ${[...duplicates].join(", ")}`,
    );
  }
}

function assertKnown(kind: string, expected: readonly string[], actual: Set<string>) {
  const missing = expected.filter((slug) => !actual.has(slug));

  if (missing.length) {
    throw new Error(
      `[content-relations] Registry ${kind} belum memiliki slug: ${missing.join(", ")}`,
    );
  }
}

function assertMembership(kind: string, refs: string[], actual: Set<string>, owner: string) {
  const missing = [...new Set(refs)].filter((slug) => !actual.has(slug));

  if (missing.length) {
    throw new Error(
      `[content-relations] ${owner} memuat referensi ${kind} yang belum ada: ${missing.join(", ")}`,
    );
  }
}

function validateStaticContentRelations() {
  if (validated) {
    return;
  }

  validated = true;

  const articleSlugs = new Set(getFallbackArticleSummaries().map((item) => item.slug));
  const solutionSlugs = new Set(getAllSolutions().map((item) => item.slug));
  const commoditySlugs = new Set(getAllCommodityHubs().map((item) => item.slug));
  const bundleDefinitions = getAllGrowthBundles();
  const bundleSlugs = new Set(bundleDefinitions.map((item) => item.slug));
  const productSlugs = new Set(
    bundleDefinitions.flatMap((bundle) =>
      bundle.bundleItems.map((item) => item.productSlug),
    ),
  );
  const campaignDefinitions = getAllCampaignLandings();
  const campaignSlugs = new Set(campaignDefinitions.map((item) => item.slug));

  assertUnique("bundle", bundleDefinitions.map((item) => item.slug));
  assertUnique("campaign", campaignDefinitions.map((item) => item.slug));

  assertKnown("artikel", Object.values(ARTICLE_REFERENCE_SLUGS), articleSlugs);
  assertKnown("solusi", Object.values(SOLUTION_REFERENCE_SLUGS), solutionSlugs);
  assertKnown("komoditas", Object.values(COMMODITY_REFERENCE_SLUGS), commoditySlugs);
  assertKnown("produk", Object.values(PRODUCT_REFERENCE_SLUGS), productSlugs);
  assertKnown("bundle", Object.values(BUNDLE_REFERENCE_SLUGS), bundleSlugs);
  assertKnown("campaign", Object.values(CAMPAIGN_REFERENCE_SLUGS), campaignSlugs);

  bundleDefinitions.forEach((bundle) => {
    assertMembership("artikel", bundle.relatedArticleSlugs, articleSlugs, `bundle ${bundle.slug}`);
    assertMembership("solusi", bundle.relatedSolutionSlugs, solutionSlugs, `bundle ${bundle.slug}`);
    assertMembership(
      "komoditas",
      bundle.relatedCommoditySlugs,
      commoditySlugs,
      `bundle ${bundle.slug}`,
    );

    if (bundle.href !== buildBundleHref(bundle.slug)) {
      throw new Error(
        `[content-relations] Bundle ${bundle.slug} memakai href yang tidak sinkron: ${bundle.href}`,
      );
    }
  });

  campaignDefinitions.forEach((campaign) => {
    assertMembership(
      "bundle",
      campaign.bundleSlugs,
      bundleSlugs,
      `campaign ${campaign.slug}`,
    );
    assertMembership(
      "produk",
      campaign.productSlugs,
      productSlugs,
      `campaign ${campaign.slug}`,
    );
    assertMembership(
      "artikel",
      campaign.relatedArticleSlugs,
      articleSlugs,
      `campaign ${campaign.slug}`,
    );
    assertMembership(
      "solusi",
      campaign.relatedSolutionSlugs,
      solutionSlugs,
      `campaign ${campaign.slug}`,
    );
    assertMembership(
      "komoditas",
      campaign.relatedCommoditySlugs,
      commoditySlugs,
      `campaign ${campaign.slug}`,
    );

    if (campaign.href !== buildCampaignHref(campaign.slug)) {
      throw new Error(
        `[content-relations] Campaign ${campaign.slug} memakai href yang tidak sinkron: ${campaign.href}`,
      );
    }
  });
}

validateStaticContentRelations();
