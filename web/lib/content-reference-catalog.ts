export const ARTICLE_REFERENCE_SLUGS = {
  fertilizerGuide: "panduan-memilih-pupuk",
  seedGuide: "dasar-memilih-benih",
  yellowLeavesGuide: "daun-menguning-dan-nutrisi-awal",
  earlyPestGuide: "pengendalian-hama-awal-yang-lebih-tenang",
  chiliStageGuide: "fase-tanam-cabai-dari-semai-sampai-berbuah",
} as const;

export const SOLUTION_REFERENCE_SLUGS = {
  yellowLeaves: "daun-menguning",
  leafPests: "hama-daun",
  dampingOff: "semai-rebah",
  slowGrowth: "pertumbuhan-lambat",
  blossomDrop: "bunga-rontok-dan-buah-tidak-jadi",
  leafSpot: "bercak-daun-dan-gejala-jamur",
} as const;

export const COMMODITY_REFERENCE_SLUGS = {
  rice: "padi",
  chili: "cabai",
  corn: "jagung",
  leafyGreens: "sayuran-daun",
  fruitHorti: "horti-buah",
  homeGarden: "kebun-rumah",
} as const;

export const STAGE_REFERENCE_SLUGS = {
  nursery: "persemaian",
  earlyPlanting: "awal-tanam",
  vegetative: "vegetatif",
  generative: "generatif",
} as const;

export const LEARN_GOAL_REFERENCE_SLUGS = {
  basics: "belajar-dasar",
} as const;

export const BUNDLE_REFERENCE_SLUGS = {
  starter: "mulai-tanam",
  protection: "proteksi-dasar",
  kioskRestock: "belanja-kios",
  riceStarter: "padi-awal-tanam",
  chiliTrack: "jalur-cabai",
} as const;

export const CAMPAIGN_REFERENCE_SLUGS = {
  rainyChili: "cabai-musim-hujan",
  riceSeasonStart: "awal-musim-tanam-padi",
  leafyYellowLeaves: "sayuran-daun-anti-daun-kuning",
} as const;

export const PRODUCT_REFERENCE_SLUGS = {
  organicFertilizer: "pupuk-organik-25-kg",
  chiliSeed: "benih-cabai-prima-f1",
  riceSeed: "benih-padi-inpari-32-5kg",
  gamectin: "gamectin-30-ec-500-ml",
  fostin: "fostin-610-ec-400-ml",
  vProtect: "v-protect-100-ml",
  extraGrow: "extra-grow-liquid-500-ml",
  superCalsium: "super-calsium-liquid-500-ml",
  superKalium: "super-kalium",
  sprayer: "sprayer-punggung-16l",
} as const;

export type ContentRelationKind =
  | "article"
  | "solution"
  | "commodity"
  | "stage"
  | "product"
  | "bundle"
  | "campaign";

export type ContentRelationIssue = {
  kind: ContentRelationKind;
  slug: string;
};

type ProductCommodityReferenceEntry = {
  label: string;
  href: string;
};

type ProductStageReferenceEntry = {
  label: string;
  href: string;
};

type ProductSolutionReferenceEntry = {
  slug: string;
  label: string;
  href: string;
  description: string;
};

export const PRODUCT_COMMODITY_REFERENCE_MAP: Record<
  string,
  ProductCommodityReferenceEntry
> = {
  [COMMODITY_REFERENCE_SLUGS.rice]: {
    label: "Padi",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.rice}`,
  },
  [COMMODITY_REFERENCE_SLUGS.chili]: {
    label: "Cabai",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.chili}`,
  },
  [COMMODITY_REFERENCE_SLUGS.corn]: {
    label: "Jagung",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.corn}`,
  },
  [COMMODITY_REFERENCE_SLUGS.leafyGreens]: {
    label: "Sayuran daun",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.leafyGreens}`,
  },
  [COMMODITY_REFERENCE_SLUGS.fruitHorti]: {
    label: "Horti & buah",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.fruitHorti}`,
  },
  [COMMODITY_REFERENCE_SLUGS.homeGarden]: {
    label: "Kebun rumah",
    href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.homeGarden}`,
  },
};

export const PRODUCT_STAGE_REFERENCE_MAP: Record<string, ProductStageReferenceEntry> = {
  [STAGE_REFERENCE_SLUGS.nursery]: {
    label: "Persemaian",
    href: `/solusi/fase/${STAGE_REFERENCE_SLUGS.nursery}`,
  },
  [STAGE_REFERENCE_SLUGS.earlyPlanting]: {
    label: "Awal tanam",
    href: `/solusi/fase/${STAGE_REFERENCE_SLUGS.earlyPlanting}`,
  },
  [STAGE_REFERENCE_SLUGS.vegetative]: {
    label: "Vegetatif",
    href: `/solusi/fase/${STAGE_REFERENCE_SLUGS.vegetative}`,
  },
  [STAGE_REFERENCE_SLUGS.generative]: {
    label: "Generatif",
    href: `/solusi/fase/${STAGE_REFERENCE_SLUGS.generative}`,
  },
};

export const PRODUCT_SOLUTION_REFERENCE_MAP: Record<
  string,
  ProductSolutionReferenceEntry
> = {
  [SOLUTION_REFERENCE_SLUGS.yellowLeaves]: {
    slug: SOLUTION_REFERENCE_SLUGS.yellowLeaves,
    label: "Daun menguning",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.yellowLeaves}`,
    description:
      "Bantu user memetakan masalah nutrisi, akar, dan pola air sebelum belanja reaktif.",
  },
  [SOLUTION_REFERENCE_SLUGS.leafPests]: {
    slug: SOLUTION_REFERENCE_SLUGS.leafPests,
    label: "Hama daun",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.leafPests}`,
    description:
      "Masuk dari kerusakan daun dan serangan hama sebelum memilih proteksi.",
  },
  [SOLUTION_REFERENCE_SLUGS.dampingOff]: {
    slug: SOLUTION_REFERENCE_SLUGS.dampingOff,
    label: "Semai rebah",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.dampingOff}`,
    description:
      "Cocok untuk fase bibit dan awal tanam yang perlu lingkungan semai lebih stabil.",
  },
  [SOLUTION_REFERENCE_SLUGS.slowGrowth]: {
    slug: SOLUTION_REFERENCE_SLUGS.slowGrowth,
    label: "Pertumbuhan lambat",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.slowGrowth}`,
    description:
      "Bantu user memeriksa fondasi fase awal sebelum membeli booster tambahan.",
  },
  [SOLUTION_REFERENCE_SLUGS.blossomDrop]: {
    slug: SOLUTION_REFERENCE_SLUGS.blossomDrop,
    label: "Bunga rontok / buah tidak jadi",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.blossomDrop}`,
    description:
      "Gunakan saat fase generatif terganggu dan user butuh konteks yang lebih tepat.",
  },
  [SOLUTION_REFERENCE_SLUGS.leafSpot]: {
    slug: SOLUTION_REFERENCE_SLUGS.leafSpot,
    label: "Bercak daun / gejala jamur",
    href: `/solusi/masalah/${SOLUTION_REFERENCE_SLUGS.leafSpot}`,
    description:
      "Pisahkan gejala penyakit dari masalah lain sebelum memilih proteksi.",
  },
};

export const RELATION_REFERENCE_SETS = {
  articles: Object.values(ARTICLE_REFERENCE_SLUGS),
  solutions: Object.values(SOLUTION_REFERENCE_SLUGS),
  commodities: Object.values(COMMODITY_REFERENCE_SLUGS),
  stages: Object.values(STAGE_REFERENCE_SLUGS),
  products: Object.values(PRODUCT_REFERENCE_SLUGS),
  bundles: Object.values(BUNDLE_REFERENCE_SLUGS),
  campaigns: Object.values(CAMPAIGN_REFERENCE_SLUGS),
} as const;

export function buildBundleHref(slug: string) {
  return `/belanja/paket/${slug}`;
}

export function buildCampaignHref(slug: string) {
  return `/kampanye/${slug}`;
}

export function assertKnownReferenceSlugs(
  moduleName: string,
  kind: ContentRelationKind,
  slugs: string[],
  knownSlugs: readonly string[],
) {
  const known = new Set(knownSlugs);
  const missing = [...new Set(slugs)].filter((slug) => !known.has(slug));

  if (!missing.length) {
    return;
  }

  throw new Error(
    `[content-relations] ${moduleName} memuat referensi ${kind} yang tidak dikenal: ${missing.join(", ")}`,
  );
}
