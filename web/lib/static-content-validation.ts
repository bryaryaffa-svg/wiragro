import { getFallbackArticleSummaries } from "@/lib/article-content";
import {
  getAllCampaignLandingDefinitions,
  type CampaignLandingDefinition,
} from "@/lib/campaign-content";
import {
  type CommercialEntryOps,
  type CommercialScheduleWindow,
} from "@/lib/commercial-content/shared";
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
import {
  getAllGrowthBundleDefinitions,
  type GrowthBundleDefinition,
} from "@/lib/growth-commerce";
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
      `[content-relations] Ditemukan nilai ${kind} duplikat: ${[...duplicates].join(", ")}`,
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

function assertNonEmpty(label: string, value: string | undefined | null, owner: string) {
  if (!String(value ?? "").trim()) {
    throw new Error(`[content-relations] ${owner} wajib memiliki ${label} yang terisi.`);
  }
}

function assertInternalHref(
  owner: string,
  label: string,
  href: string | undefined | null,
  expectedPrefix?: string,
) {
  assertNonEmpty(label, href, owner);

  if (!href?.startsWith("/")) {
    throw new Error(`[content-relations] ${owner} harus memakai ${label} internal, menerima: ${href}`);
  }

  if (expectedPrefix && !href.startsWith(expectedPrefix)) {
    throw new Error(
      `[content-relations] ${owner} harus memakai ${label} yang diawali ${expectedPrefix}, menerima: ${href}`,
    );
  }
}

function parseScheduleDate(owner: string, label: string, value?: string) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) {
    throw new Error(
      `[content-relations] ${owner} memiliki ${label} yang bukan tanggal ISO valid: ${value}`,
    );
  }

  return new Date(timestamp);
}

function assertValidCommercialOps(owner: string, ops: CommercialEntryOps) {
  if (!["active", "inactive"].includes(ops.status)) {
    throw new Error(`[content-relations] ${owner} memiliki status yang tidak dikenal: ${ops.status}`);
  }

  if (!Number.isInteger(ops.priority) || ops.priority < 0) {
    throw new Error(
      `[content-relations] ${owner} harus memakai priority bilangan bulat >= 0, menerima: ${ops.priority}`,
    );
  }

  const startsAt = parseScheduleDate(owner, "ops.schedule.startsAt", ops.schedule?.startsAt);
  const endsAt = parseScheduleDate(owner, "ops.schedule.endsAt", ops.schedule?.endsAt);

  if (startsAt && endsAt && startsAt.getTime() > endsAt.getTime()) {
    throw new Error(
      `[content-relations] ${owner} memiliki schedule terbalik: startsAt ${ops.schedule?.startsAt} lebih besar dari endsAt ${ops.schedule?.endsAt}`,
    );
  }
}

function assertNonEmptyList(kind: string, values: string[], owner: string) {
  if (!values.length) {
    throw new Error(`[content-relations] ${owner} wajib memiliki minimal satu ${kind}.`);
  }

  values.forEach((value, index) => {
    assertNonEmpty(`${kind}[${index}]`, value, owner);
  });
}

function assertMoney(owner: string, label: string, value: string | undefined | null) {
  assertNonEmpty(label, value, owner);
  const amount = Number.parseFloat(String(value));

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`[content-relations] ${owner} memiliki ${label} yang bukan nominal valid: ${value}`);
  }
}

function normalizeWindowBounds(schedule?: CommercialScheduleWindow) {
  const startsAt = schedule?.startsAt ? Date.parse(schedule.startsAt) : Number.NEGATIVE_INFINITY;
  const endsAt = schedule?.endsAt ? Date.parse(schedule.endsAt) : Number.POSITIVE_INFINITY;

  return {
    startsAt,
    endsAt,
  };
}

function canPublicationWindowsOverlap(left: CommercialEntryOps, right: CommercialEntryOps) {
  if (left.status !== "active" || right.status !== "active") {
    return false;
  }

  const leftBounds = normalizeWindowBounds(left.schedule);
  const rightBounds = normalizeWindowBounds(right.schedule);

  return leftBounds.startsAt <= rightBounds.endsAt && rightBounds.startsAt <= leftBounds.endsAt;
}

function validateBundleDefinition(
  bundle: GrowthBundleDefinition,
  context: {
    articleSlugs: Set<string>;
    commoditySlugs: Set<string>;
    productSlugs: Set<string>;
    solutionSlugs: Set<string>;
  },
) {
  const owner = `bundle ${bundle.slug}`;

  assertValidCommercialOps(owner, bundle.ops);
  assertNonEmpty("sku", bundle.sku, owner);
  assertNonEmpty("title", bundle.title, owner);
  assertNonEmpty("description", bundle.description, owner);
  assertNonEmpty("summary", bundle.summary, owner);
  assertNonEmpty("audience", bundle.audience, owner);
  assertNonEmpty("actionLabel", bundle.actionLabel, owner);
  assertInternalHref(owner, "href", bundle.href);
  assertInternalHref(owner, "catalogHref", bundle.catalogHref, "/produk");

  if (bundle.href !== buildBundleHref(bundle.slug)) {
    throw new Error(
      `[content-relations] Bundle ${bundle.slug} memakai href yang tidak sinkron: ${bundle.href}`,
    );
  }

  assertNonEmptyList("bundle item", bundle.bundleItems.map((item) => item.lineId), owner);
  assertUnique(`${owner} lineId`, bundle.bundleItems.map((item) => item.lineId));
  assertUnique(`${owner} related article`, bundle.relatedArticleSlugs);
  assertUnique(`${owner} related solution`, bundle.relatedSolutionSlugs);
  assertUnique(`${owner} related commodity`, bundle.relatedCommoditySlugs);
  assertUnique(
    `${owner} supporting link href`,
    bundle.supportingLinks?.map((link) => link.href) ?? [],
  );

  assertMembership("artikel", bundle.relatedArticleSlugs, context.articleSlugs, owner);
  assertMembership("solusi", bundle.relatedSolutionSlugs, context.solutionSlugs, owner);
  assertMembership("komoditas", bundle.relatedCommoditySlugs, context.commoditySlugs, owner);

  bundle.supportingLinks?.forEach((link, index) => {
    assertNonEmpty(`supportingLinks[${index}].label`, link.label, owner);
    assertInternalHref(owner, `supportingLinks[${index}].href`, link.href);
  });

  bundle.bundleItems.forEach((item, index) => {
    const itemOwner = `${owner} item ${item.lineId}`;

    if (!context.productSlugs.has(item.productSlug)) {
      throw new Error(
        `[content-relations] ${itemOwner} memakai productSlug yang belum ada di registry: ${item.productSlug}`,
      );
    }

    if (!Number.isInteger(item.qty) || item.qty <= 0) {
      throw new Error(
        `[content-relations] ${itemOwner} harus memakai qty bilangan bulat > 0, menerima: ${item.qty}`,
      );
    }

    assertNonEmpty(`bundleItems[${index}].roleLabel`, item.roleLabel, owner);
    assertNonEmpty("fallback.sku", item.fallback.sku, itemOwner);
    assertNonEmpty("fallback.productName", item.fallback.productName, itemOwner);
    assertNonEmpty("fallback.categoryName", item.fallback.categoryName, itemOwner);
    assertNonEmpty("fallback.unit", item.fallback.unit, itemOwner);
    assertNonEmpty("fallback.weightGrams", item.fallback.weightGrams, itemOwner);
    assertNonEmpty("fallback.summary", item.fallback.summary, itemOwner);
    assertMoney(itemOwner, "fallback.priceAmount", item.fallback.priceAmount);

    if (item.fallback.compareAtAmount) {
      assertMoney(itemOwner, "fallback.compareAtAmount", item.fallback.compareAtAmount);
    }
  });

  assertMoney(owner, "pricing.bundlePriceAmount", bundle.pricing.bundlePriceAmount);
  assertNonEmpty("pricing.note", bundle.pricing.note, owner);
  assertNonEmptyList("outcome", bundle.outcomes, owner);

  if (!bundle.proofSignals.length) {
    throw new Error(`[content-relations] ${owner} wajib memiliki minimal satu proof signal.`);
  }

  bundle.proofSignals.forEach((signal, index) => {
    assertNonEmpty(`proofSignals[${index}].title`, signal.title, owner);
    assertNonEmpty(`proofSignals[${index}].body`, signal.body, owner);
  });
}

function validateCampaignDefinition(
  campaign: CampaignLandingDefinition,
  context: {
    articleSlugs: Set<string>;
    bundleBySlug: Map<string, GrowthBundleDefinition>;
    bundleSlugs: Set<string>;
    commoditySlugs: Set<string>;
    productSlugs: Set<string>;
    solutionSlugs: Set<string>;
  },
) {
  const owner = `campaign ${campaign.slug}`;

  assertValidCommercialOps(owner, campaign.ops);
  assertNonEmpty("title", campaign.title, owner);
  assertNonEmpty("description", campaign.description, owner);
  assertNonEmpty("summary", campaign.summary, owner);
  assertNonEmpty("seasonLabel", campaign.seasonLabel, owner);
  assertNonEmpty("focusLabel", campaign.focusLabel, owner);
  assertNonEmpty("audience", campaign.audience, owner);
  assertNonEmpty("actionLabel", campaign.actionLabel, owner);
  assertInternalHref(owner, "href", campaign.href);
  assertInternalHref(owner, "catalogHref", campaign.catalogHref, "/produk");

  if (campaign.href !== buildCampaignHref(campaign.slug)) {
    throw new Error(
      `[content-relations] Campaign ${campaign.slug} memakai href yang tidak sinkron: ${campaign.href}`,
    );
  }

  if (!campaign.bundleSlugs.length && !campaign.productSlugs.length) {
    throw new Error(
      `[content-relations] ${owner} wajib memiliki minimal satu bundle atau product sebagai jalur masuk komersial.`,
    );
  }

  assertUnique(`${owner} bundle`, campaign.bundleSlugs);
  assertUnique(`${owner} product`, campaign.productSlugs);
  assertUnique(`${owner} related article`, campaign.relatedArticleSlugs);
  assertUnique(`${owner} related solution`, campaign.relatedSolutionSlugs);
  assertUnique(`${owner} related commodity`, campaign.relatedCommoditySlugs);

  assertMembership("bundle", campaign.bundleSlugs, context.bundleSlugs, owner);
  assertMembership("produk", campaign.productSlugs, context.productSlugs, owner);
  assertMembership("artikel", campaign.relatedArticleSlugs, context.articleSlugs, owner);
  assertMembership("solusi", campaign.relatedSolutionSlugs, context.solutionSlugs, owner);
  assertMembership("komoditas", campaign.relatedCommoditySlugs, context.commoditySlugs, owner);
  assertNonEmptyList("outcome", campaign.outcomes, owner);

  if (campaign.ops.status === "active") {
    campaign.bundleSlugs.forEach((bundleSlug) => {
      const bundle = context.bundleBySlug.get(bundleSlug);

      if (!bundle) {
        return;
      }

      if (bundle.ops.status !== "active") {
        throw new Error(
          `[content-relations] ${owner} aktif, tetapi mereferensikan bundle ${bundleSlug} yang nonaktif.`,
        );
      }

      if (!canPublicationWindowsOverlap(campaign.ops, bundle.ops)) {
        throw new Error(
          `[content-relations] ${owner} aktif, tetapi jendela publish-nya tidak pernah overlap dengan bundle ${bundleSlug}.`,
        );
      }
    });
  }
}

function validateStaticContentRelations() {
  if (validated) {
    return;
  }

  validated = true;

  const now = new Date();
  const articleSlugs = new Set(getFallbackArticleSummaries().map((item) => item.slug));
  const solutionSlugs = new Set(getAllSolutions().map((item) => item.slug));
  const commoditySlugs = new Set(getAllCommodityHubs().map((item) => item.slug));
  const productSlugs = new Set(Object.values(PRODUCT_REFERENCE_SLUGS));
  const bundleDefinitions = getAllGrowthBundleDefinitions({ now });
  const campaignDefinitions = getAllCampaignLandingDefinitions({ now });
  const bundleSlugs = new Set(bundleDefinitions.map((item) => item.slug));
  const campaignSlugs = new Set(campaignDefinitions.map((item) => item.slug));
  const bundleBySlug = new Map(bundleDefinitions.map((item) => [item.slug, item]));

  assertUnique("bundle slug", bundleDefinitions.map((item) => item.slug));
  assertUnique("bundle sku", bundleDefinitions.map((item) => item.sku));
  assertUnique("campaign slug", campaignDefinitions.map((item) => item.slug));

  assertKnown("artikel", Object.values(ARTICLE_REFERENCE_SLUGS), articleSlugs);
  assertKnown("solusi", Object.values(SOLUTION_REFERENCE_SLUGS), solutionSlugs);
  assertKnown("komoditas", Object.values(COMMODITY_REFERENCE_SLUGS), commoditySlugs);
  assertKnown("bundle", Object.values(BUNDLE_REFERENCE_SLUGS), bundleSlugs);
  assertKnown("campaign", Object.values(CAMPAIGN_REFERENCE_SLUGS), campaignSlugs);

  bundleDefinitions.forEach((bundle) =>
    validateBundleDefinition(bundle, {
      articleSlugs,
      commoditySlugs,
      productSlugs,
      solutionSlugs,
    }),
  );

  campaignDefinitions.forEach((campaign) =>
    validateCampaignDefinition(campaign, {
      articleSlugs,
      bundleBySlug,
      bundleSlugs,
      commoditySlugs,
      productSlugs,
      solutionSlugs,
    }),
  );
}

validateStaticContentRelations();
