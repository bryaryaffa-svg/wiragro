import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  CAMPAIGN_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  PRODUCT_REFERENCE_SLUGS,
  SOLUTION_REFERENCE_SLUGS,
} from "@/lib/content-reference-catalog";
import type { CampaignLandingSourceDefinition } from "@/lib/campaign-content";

export const CAMPAIGN_LANDING_SOURCES = [
  {
    ops: {
      status: "active",
      priority: 100,
    },
    slug: CAMPAIGN_REFERENCE_SLUGS.rainyChili,
    title: "Campaign cabai musim hujan",
    description:
      "Halaman tematik untuk petani cabai di musim hujan yang membutuhkan jalur cepat ke paket, proteksi, dan konsultasi tanpa terasa membingungkan.",
    summary:
      "Musim hujan memperbesar kebutuhan validasi penyakit daun, proteksi ringan, dan paket cabai yang siap dibahas lewat WhatsApp atau checkout langsung.",
    seasonLabel: "Musim hujan",
    focusLabel: "Cabai",
    audience:
      "Petani cabai, toko pertanian hortikultura, dan pengunjung yang datang dari gejala bercak atau kebutuhan proteksi generatif.",
    theme: "rain",
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
      "Halaman ini cocok untuk promosi atau WhatsApp saat kebutuhan beli sudah muncul tetapi konteks penyakit masih perlu dibaca.",
      "Alur edukasi, solusi, dan paket tetap terjaga agar keputusan belanja terasa wajar dan tidak memaksa.",
      "Program musiman ini membantu tim Wiragro mengarahkan pembeli ke solusi yang tepat dengan lebih cepat.",
    ],
  },
  {
    ops: {
      status: "active",
      priority: 90,
    },
    slug: CAMPAIGN_REFERENCE_SLUGS.riceSeasonStart,
    title: "Campaign awal musim tanam padi",
    description:
      "Halaman untuk kebutuhan awal tanam padi yang menyatukan fase, paket, dan belanja dasar agar pengunjung tidak harus memulai dari pencarian katalog kosong.",
    summary:
      "Fokus program ini adalah fase awal: benih, nutrisi dasar, dan jalur repeat order yang lebih mudah untuk toko pertanian atau petani yang mulai menanam lagi.",
    seasonLabel: "Awal musim tanam",
    focusLabel: "Padi",
    audience:
      "Petani padi, toko pertanian area sawah, dan pembeli yang sedang menyiapkan kebutuhan awal musim.",
    theme: "field",
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
      "Halaman ini menangkap kebutuhan musiman tanpa membuat pengunjung loncat dari artikel ke katalog secara acak.",
      "Paket awal tanam memberi titik mulai yang lebih jelas untuk kebutuhan fase awal.",
      "B2B dan repeat order lebih mudah dibuka dari program ini karena konteks musimnya sudah jelas.",
    ],
  },
  {
    ops: {
      status: "active",
      priority: 80,
    },
    slug: CAMPAIGN_REFERENCE_SLUGS.leafyYellowLeaves,
    title: "Campaign sayuran daun anti daun kuning",
    description:
      "Halaman solusi untuk sayuran daun yang mempertemukan gejala, nutrisi, media, dan paket ringan dalam satu alur yang siap dipakai.",
    summary:
      "Program ini paling cocok untuk pengunjung yang masuk dari masalah daun menguning atau pertumbuhan lambat, terutama di kebun rumah dan sayuran daun intensif.",
    seasonLabel: "Problem prioritas",
    focusLabel: "Sayuran daun",
    audience:
      "Petani sayuran daun, kebun rumah, dan pengunjung yang butuh solusi cepat untuk gejala awal.",
    theme: "leaf",
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
      "Program ini cocok dipakai untuk promosi masalah tanaman yang butuh jawaban lebih cepat.",
      "Pengunjung bisa bergerak dari gejala ke paket dan produk tanpa kehilangan penjelasan fase awal.",
      "Halaman solusi ini mendukung SEO untuk gejala prioritas yang dekat dengan keputusan pembelian.",
    ],
  },
] satisfies CampaignLandingSourceDefinition[];
