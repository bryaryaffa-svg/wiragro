import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  CAMPAIGN_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  PRODUCT_REFERENCE_SLUGS,
  SOLUTION_REFERENCE_SLUGS,
  assertKnownReferenceSlugs,
  buildCampaignHref,
} from "@/lib/content-reference-catalog";

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
};

const CAMPAIGN_LANDINGS: CampaignLandingDefinition[] = [
  {
    slug: CAMPAIGN_REFERENCE_SLUGS.rainyChili,
    title: "Campaign cabai musim hujan",
    description:
      "Landing komersial untuk user cabai yang masuk di musim hujan dan butuh jalur cepat ke bundle, proteksi, serta konsultasi yang tidak terasa membingungkan.",
    summary:
      "Musim hujan memperbesar kebutuhan validasi penyakit daun, proteksi ringan, dan paket cabai yang siap dibahas lewat WhatsApp atau checkout langsung.",
    seasonLabel: "Musim hujan",
    focusLabel: "Cabai",
    audience: "Petani cabai, kios horti, dan user yang datang dari gejala bercak atau kebutuhan proteksi generatif.",
    theme: "rain",
    href: buildCampaignHref(CAMPAIGN_REFERENCE_SLUGS.rainyChili),
    catalogHref: "/produk?q=fungisida",
    actionLabel: "Buka campaign cabai",
    bundleSlugs: [
      BUNDLE_REFERENCE_SLUGS.chiliTrack,
      BUNDLE_REFERENCE_SLUGS.protection,
    ],
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.earlyPestGuide,
      ARTICLE_REFERENCE_SLUGS.chiliStageGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.leafSpot,
      SOLUTION_REFERENCE_SLUGS.leafPests,
    ],
    relatedCommoditySlugs: [COMMODITY_REFERENCE_SLUGS.chili],
    productSlugs: [
      PRODUCT_REFERENCE_SLUGS.fostin,
      PRODUCT_REFERENCE_SLUGS.gamectin,
      PRODUCT_REFERENCE_SLUGS.superKalium,
    ],
    outcomes: [
      "Campaign ini cocok untuk iklan atau WA follow-up saat intent user sudah komersial tetapi konteks penyakit masih butuh dibaca.",
      "Landing tetap menjaga alur edukasi, solusi, dan bundle agar conversion tidak terasa hard sell.",
      "Tim toko bisa memakai halaman ini sebagai surface promosi musiman yang langsung nyambung ke assisted sales.",
    ],
  },
  {
    slug: CAMPAIGN_REFERENCE_SLUGS.riceSeasonStart,
    title: "Campaign awal musim tanam padi",
    description:
      "Landing untuk kebutuhan awal tanam padi yang menyatukan fase, bundle, dan belanja dasar agar user tidak harus memulai dari pencarian katalog kosong.",
    summary:
      "Fokus campaign ini adalah fase awal: benih, nutrisi dasar, dan jalur repeat order yang lebih mudah untuk kios atau petani yang mulai menanam lagi.",
    seasonLabel: "Awal musim tanam",
    focusLabel: "Padi",
    audience: "Petani padi, kios sawah, dan pembeli yang sedang menyiapkan kebutuhan awal musim.",
    theme: "field",
    href: buildCampaignHref(CAMPAIGN_REFERENCE_SLUGS.riceSeasonStart),
    catalogHref: "/produk?q=benih padi",
    actionLabel: "Buka campaign padi",
    bundleSlugs: [
      BUNDLE_REFERENCE_SLUGS.riceStarter,
      BUNDLE_REFERENCE_SLUGS.starter,
    ],
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
      ARTICLE_REFERENCE_SLUGS.seedGuide,
    ],
    relatedSolutionSlugs: [SOLUTION_REFERENCE_SLUGS.slowGrowth],
    relatedCommoditySlugs: [COMMODITY_REFERENCE_SLUGS.rice],
    productSlugs: [
      PRODUCT_REFERENCE_SLUGS.riceSeed,
      PRODUCT_REFERENCE_SLUGS.organicFertilizer,
      PRODUCT_REFERENCE_SLUGS.superCalsium,
    ],
    outcomes: [
      "Landing ini menangkap intent komersial yang musiman tanpa membuat user loncat dari artikel ke katalog secara acak.",
      "Bundle awal tanam memberi titik masuk AOV yang lebih baik untuk kebutuhan fase awal.",
      "B2B dan repeat order lebih mudah dibuka dari campaign ini karena konteks musimnya sudah jelas.",
    ],
  },
  {
    slug: CAMPAIGN_REFERENCE_SLUGS.leafyYellowLeaves,
    title: "Campaign sayuran daun anti daun kuning",
    description:
      "Landing problem-first untuk sayuran daun yang butuh titik temu antara gejala, nutrisi, media, dan bundle ringan yang siap dikonversi.",
    summary:
      "Campaign ini paling cocok untuk user yang masuk dari masalah daun menguning atau pertumbuhan lambat, terutama di kebun rumah dan sayuran daun intensif.",
    seasonLabel: "Problem prioritas",
    focusLabel: "Sayuran daun",
    audience: "Petani sayuran daun, kebun rumah, dan user yang butuh solusi cepat untuk gejala awal.",
    theme: "leaf",
    href: buildCampaignHref(CAMPAIGN_REFERENCE_SLUGS.leafyYellowLeaves),
    catalogHref: "/produk?q=pupuk",
    actionLabel: "Buka campaign sayuran daun",
    bundleSlugs: [
      BUNDLE_REFERENCE_SLUGS.starter,
      BUNDLE_REFERENCE_SLUGS.protection,
    ],
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
      ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.yellowLeaves,
      SOLUTION_REFERENCE_SLUGS.dampingOff,
    ],
    relatedCommoditySlugs: [
      COMMODITY_REFERENCE_SLUGS.leafyGreens,
      COMMODITY_REFERENCE_SLUGS.homeGarden,
    ],
    productSlugs: [
      PRODUCT_REFERENCE_SLUGS.organicFertilizer,
      PRODUCT_REFERENCE_SLUGS.extraGrow,
      PRODUCT_REFERENCE_SLUGS.chiliSeed,
    ],
    outcomes: [
      "Campaign ini cocok dipakai untuk iklan intent masalah yang butuh jawaban komersial lebih cepat.",
      "User bisa bergerak dari gejala ke bundle dan produk tanpa kehilangan penjelasan fase awal.",
      "Halaman problem-first ini mendukung SEO komersial untuk keyword gejala prioritas yang dekat dengan pembelian.",
    ],
  },
];

assertKnownReferenceSlugs(
  "campaign-content",
  "bundle",
  CAMPAIGN_LANDINGS.flatMap((campaign) => campaign.bundleSlugs),
  Object.values(BUNDLE_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "campaign-content",
  "product",
  CAMPAIGN_LANDINGS.flatMap((campaign) => campaign.productSlugs),
  Object.values(PRODUCT_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "campaign-content",
  "article",
  CAMPAIGN_LANDINGS.flatMap((campaign) => campaign.relatedArticleSlugs),
  Object.values(ARTICLE_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "campaign-content",
  "solution",
  CAMPAIGN_LANDINGS.flatMap((campaign) => campaign.relatedSolutionSlugs),
  Object.values(SOLUTION_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "campaign-content",
  "commodity",
  CAMPAIGN_LANDINGS.flatMap((campaign) => campaign.relatedCommoditySlugs),
  Object.values(COMMODITY_REFERENCE_SLUGS),
);

export function getAllCampaignLandings() {
  return CAMPAIGN_LANDINGS;
}

export function getCampaignLanding(slug: string) {
  return CAMPAIGN_LANDINGS.find((item) => item.slug === slug) ?? null;
}

export function getFeaturedCampaignLandings(limit = 3) {
  return CAMPAIGN_LANDINGS.slice(0, limit);
}

export function getCampaignLandingsForCommodity(
  commoditySlug?: string | null,
  limit = 2,
) {
  if (!commoditySlug) {
    return [];
  }

  return CAMPAIGN_LANDINGS.filter((item) => item.relatedCommoditySlugs.includes(commoditySlug)).slice(
    0,
    limit,
  );
}

export function getCampaignLandingsForSolution(input: {
  solutionSlug?: string | null;
  commoditySlugs?: string[];
}, limit = 2) {
  return CAMPAIGN_LANDINGS.map((item) => {
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
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}
