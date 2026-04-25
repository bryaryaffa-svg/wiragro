import type { ProductDetailPayload } from "@/lib/api";
import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  PRODUCT_REFERENCE_SLUGS,
  PRODUCT_COMMODITY_REFERENCE_MAP,
  PRODUCT_SOLUTION_REFERENCE_MAP,
  PRODUCT_STAGE_REFERENCE_MAP,
  SOLUTION_REFERENCE_SLUGS,
  STAGE_REFERENCE_SLUGS,
  assertKnownReferenceSlugs,
  buildBundleHref,
} from "@/lib/content-reference-catalog";

type ProductProfile = "nutrition" | "seed" | "protection" | "media" | "tool" | "general";

export type ProductInfoLink = {
  slug: string;
  label: string;
  href: string;
};

export type ProductProblemLink = ProductInfoLink & {
  description: string;
};

export type ProductFaqItem = {
  question: string;
  answer: string;
};

export type ProductTrustPoint = {
  title: string;
  body: string;
};

export type ProductBundleSuggestion = {
  title: string;
  description: string;
  href: string;
};

export type ProductReviewPlaceholder = {
  title: string;
  body: string;
  bullets: string[];
};

export type ProductPageEnrichment = {
  profile: ProductProfile;
  useCaseLabel: string;
  purpose: string;
  guidanceNote: string;
  primaryBenefits: string[];
  usageSteps: string[];
  commodityLinks: ProductInfoLink[];
  stageLinks: ProductInfoLink[];
  problemLinks: ProductProblemLink[];
  faq: ProductFaqItem[];
  trustPoints: ProductTrustPoint[];
  relatedArticleSlugs: string[];
  relatedSolutionSlugs: string[];
  complementaryProductSlugs: string[];
  bundleSuggestion: ProductBundleSuggestion;
  reviewPlaceholder: ProductReviewPlaceholder;
  repeatOrderTitle: string;
  repeatOrderBody: string;
  consultationPrompt: string;
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  quickMeta: string[];
};

assertKnownReferenceSlugs(
  "product-content",
  "solution",
  Object.keys(PRODUCT_SOLUTION_REFERENCE_MAP),
  Object.values(SOLUTION_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "product-content",
  "commodity",
  Object.keys(PRODUCT_COMMODITY_REFERENCE_MAP),
  Object.values(COMMODITY_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "product-content",
  "stage",
  Object.keys(PRODUCT_STAGE_REFERENCE_MAP),
  Object.values(STAGE_REFERENCE_SLUGS),
);

function normalizeText(product: ProductDetailPayload) {
  return [
    product.name,
    product.category?.name,
    product.product_type,
    product.summary,
    product.description,
  ]
    .join(" ")
    .toLowerCase();
}

function matches(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

function detectProfile(text: string): ProductProfile {
  if (matches(text, ["pestisida", "insekt", "fungis", "herbis", "proteksi"])) {
    return "protection";
  }

  if (matches(text, ["benih", "bibit", "seed"])) {
    return "seed";
  }

  if (matches(text, ["media", "tray", "polybag", "cocopeat", "sekam"])) {
    return "media";
  }

  if (matches(text, ["sprayer", "alat", "gunting", "pompa", "selang"])) {
    return "tool";
  }

  if (matches(text, ["pupuk", "nutrisi", "npk", "urea", "za", "booster", "mikro", "makro"])) {
    return "nutrition";
  }

  return "general";
}

function buildCommodityLinks(slugs: string[]) {
  return slugs
    .map((slug) => {
      const item =
        PRODUCT_COMMODITY_REFERENCE_MAP[
          slug as keyof typeof PRODUCT_COMMODITY_REFERENCE_MAP
        ];

      if (!item) {
        return null;
      }

      return { slug, ...item };
    })
    .filter((item): item is ProductInfoLink => Boolean(item));
}

function buildStageLinks(slugs: string[]) {
  return slugs
    .map((slug) => {
      const item =
        PRODUCT_STAGE_REFERENCE_MAP[slug as keyof typeof PRODUCT_STAGE_REFERENCE_MAP];

      if (!item) {
        return null;
      }

      return { slug, ...item };
    })
    .filter((item): item is ProductInfoLink => Boolean(item));
}

function buildProblemLinks(slugs: string[]) {
  return slugs
    .map(
      (slug) =>
        PRODUCT_SOLUTION_REFERENCE_MAP[
          slug as keyof typeof PRODUCT_SOLUTION_REFERENCE_MAP
        ] ?? null,
    )
    .filter((item): item is ProductProblemLink => Boolean(item));
}

function deriveCommoditySlugs(text: string, profile: ProductProfile) {
  const dynamic = new Set<string>();

  if (text.includes("cabai")) dynamic.add(COMMODITY_REFERENCE_SLUGS.chili);
  if (text.includes("padi")) dynamic.add(COMMODITY_REFERENCE_SLUGS.rice);
  if (text.includes("jagung")) dynamic.add(COMMODITY_REFERENCE_SLUGS.corn);
  if (matches(text, ["sayur", "selada", "kangkung", "sawi"])) {
    dynamic.add(COMMODITY_REFERENCE_SLUGS.leafyGreens);
  }
  if (matches(text, ["buah", "melon", "semangka", "tomat"])) {
    dynamic.add(COMMODITY_REFERENCE_SLUGS.fruitHorti);
  }
  if (matches(text, ["rumah", "urban", "polybag"])) {
    dynamic.add(COMMODITY_REFERENCE_SLUGS.homeGarden);
  }

  if (!dynamic.size) {
    const defaults: Record<ProductProfile, string[]> = {
      nutrition: [
        COMMODITY_REFERENCE_SLUGS.rice,
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.corn,
        COMMODITY_REFERENCE_SLUGS.leafyGreens,
      ],
      seed: [
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.corn,
        COMMODITY_REFERENCE_SLUGS.leafyGreens,
        COMMODITY_REFERENCE_SLUGS.homeGarden,
      ],
      protection: [
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.fruitHorti,
        COMMODITY_REFERENCE_SLUGS.leafyGreens,
      ],
      media: [
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.leafyGreens,
        COMMODITY_REFERENCE_SLUGS.homeGarden,
      ],
      tool: [
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.fruitHorti,
        COMMODITY_REFERENCE_SLUGS.rice,
      ],
      general: [
        COMMODITY_REFERENCE_SLUGS.chili,
        COMMODITY_REFERENCE_SLUGS.rice,
        COMMODITY_REFERENCE_SLUGS.homeGarden,
      ],
    };

    defaults[profile].forEach((item) => dynamic.add(item));
  }

  return [...dynamic];
}

function deriveStageSlugs(text: string, profile: ProductProfile) {
  const dynamic = new Set<string>();

  if (matches(text, ["semai", "bibit", "tray", "media"])) {
    dynamic.add(STAGE_REFERENCE_SLUGS.nursery);
  }
  if (matches(text, ["awal", "starter", "dasar"])) {
    dynamic.add(STAGE_REFERENCE_SLUGS.earlyPlanting);
  }
  if (matches(text, ["daun", "akar", "vegetatif"])) {
    dynamic.add(STAGE_REFERENCE_SLUGS.vegetative);
  }
  if (matches(text, ["buah", "bunga", "generatif"])) {
    dynamic.add(STAGE_REFERENCE_SLUGS.generative);
  }

  if (!dynamic.size) {
    const defaults: Record<ProductProfile, string[]> = {
      nutrition: [
        STAGE_REFERENCE_SLUGS.earlyPlanting,
        STAGE_REFERENCE_SLUGS.vegetative,
        STAGE_REFERENCE_SLUGS.generative,
      ],
      seed: [STAGE_REFERENCE_SLUGS.nursery, STAGE_REFERENCE_SLUGS.earlyPlanting],
      protection: [STAGE_REFERENCE_SLUGS.vegetative, STAGE_REFERENCE_SLUGS.generative],
      media: [STAGE_REFERENCE_SLUGS.nursery, STAGE_REFERENCE_SLUGS.earlyPlanting],
      tool: [STAGE_REFERENCE_SLUGS.vegetative, STAGE_REFERENCE_SLUGS.generative],
      general: [STAGE_REFERENCE_SLUGS.earlyPlanting, STAGE_REFERENCE_SLUGS.vegetative],
    };

    defaults[profile].forEach((item) => dynamic.add(item));
  }

  return [...dynamic];
}

function deriveSolutionSlugs(text: string, profile: ProductProfile) {
  const dynamic = new Set<string>();

  if (matches(text, ["kuning", "nutrisi", "pupuk", "booster"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.yellowLeaves);
  }
  if (matches(text, ["hama", "insekt", "ulat", "thrips", "kutu"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.leafPests);
  }
  if (matches(text, ["jamur", "fungis", "bercak"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.leafSpot);
  }
  if (matches(text, ["semai", "bibit", "tray", "media"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.dampingOff);
  }
  if (matches(text, ["booster", "buah", "bunga", "generatif"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.blossomDrop);
  }
  if (matches(text, ["starter", "pertumbuhan", "dasar", "benih"])) {
    dynamic.add(SOLUTION_REFERENCE_SLUGS.slowGrowth);
  }

  if (!dynamic.size) {
    const defaults: Record<ProductProfile, string[]> = {
      nutrition: [
        SOLUTION_REFERENCE_SLUGS.yellowLeaves,
        SOLUTION_REFERENCE_SLUGS.slowGrowth,
        SOLUTION_REFERENCE_SLUGS.blossomDrop,
      ],
      seed: [SOLUTION_REFERENCE_SLUGS.dampingOff, SOLUTION_REFERENCE_SLUGS.slowGrowth],
      protection: [SOLUTION_REFERENCE_SLUGS.leafPests, SOLUTION_REFERENCE_SLUGS.leafSpot],
      media: [SOLUTION_REFERENCE_SLUGS.dampingOff, SOLUTION_REFERENCE_SLUGS.yellowLeaves],
      tool: [SOLUTION_REFERENCE_SLUGS.leafPests, SOLUTION_REFERENCE_SLUGS.leafSpot],
      general: [SOLUTION_REFERENCE_SLUGS.slowGrowth, SOLUTION_REFERENCE_SLUGS.yellowLeaves],
    };

    defaults[profile].forEach((item) => dynamic.add(item));
  }

  return [...dynamic];
}

function buildFaq(profile: ProductProfile, productName: string) {
  const common = [
    {
      question: `Apakah ${productName} bisa dipakai tanpa memahami gejalanya lebih dulu?`,
      answer:
        "Sebaiknya tidak. Gunakan produk ini setelah konteks tanaman, fase, dan gejalanya cukup jelas agar pembelian lebih tepat.",
    },
    {
      question: "Kalau saya belum yakin dengan kecocokannya, apa langkah paling aman?",
      answer:
        "Buka artikel atau halaman solusi terkait, lalu lanjutkan ke konsultasi WhatsApp agar tim Wiragro membantu membaca kebutuhan Anda.",
    },
  ];

  const profileFaq: Record<ProductProfile, ProductFaqItem[]> = {
    nutrition: [
      {
        question: "Dipakai pada fase apa?",
        answer:
          "Produk nutrisi biasanya paling efektif bila diposisikan sesuai fase: awal tanam, vegetatif, atau generatif. Hindari asumsi bahwa satu pola aplikasi cocok untuk semua fase.",
      },
      {
        question: "Kalau tanaman menguning, apakah produk ini otomatis jadi jawaban?",
        answer:
          "Belum tentu. Daun menguning perlu dibaca bersama akar, media, dan pola air sebelum Anda memutuskan ritme nutrisi yang tepat.",
      },
    ],
    seed: [
      {
        question: "Benih ini cocok untuk siapa?",
        answer:
          "Cocok untuk pembeli yang sudah tahu komoditas dan jalur tanamnya, lalu ingin mulai dari fase awal dengan lebih terarah.",
      },
      {
        question: "Kalau semai saya sering rebah, apakah cukup ganti benih?",
        answer:
          "Tidak selalu. Periksa juga media, tray, kelembapan, dan pola persemaian karena masalah fase awal jarang datang dari satu faktor saja.",
      },
    ],
    protection: [
      {
        question: "Apakah produk proteksi ini boleh langsung dipakai saat gejala muncul?",
        answer:
          "Sebaiknya verifikasi dulu apakah gejala lebih dekat ke hama, penyakit, atau stres tanaman lain. Itu akan membantu Anda memilih produk yang lebih relevan.",
      },
      {
        question: "Kapan saya perlu alat aplikasi tambahan?",
        answer:
          "Jika skala aplikasi atau intensitas masalah cukup tinggi, alat aplikasi yang tepat akan sangat memengaruhi hasil dan efisiensi penggunaan produk proteksi.",
      },
    ],
    media: [
      {
        question: "Produk ini dipakai paling cocok di fase apa?",
        answer:
          "Media dan perlengkapan awal paling berperan di fase persemaian dan awal tanam ketika akar serta lingkungan tumbuh masih sangat sensitif.",
      },
      {
        question: "Kalau bibit lemah, apakah cukup mengganti media?",
        answer:
          "Media sering menjadi faktor besar, tetapi tetap periksa kelembapan, kepadatan semai, dan ritme penanganan bibit.",
      },
    ],
    tool: [
      {
        question: "Produk alat seperti ini cocok dipakai bersama apa?",
        answer:
          "Biasanya alat paling bernilai saat dipasangkan dengan input yang memang sudah cocok dengan masalah dan fase tanaman Anda.",
      },
      {
        question: "Apakah alat ini penting untuk repeat order?",
        answer:
          "Ya, alat yang tepat membantu ritme penggunaan input lebih stabil dan membuat pembelian ulang jadi lebih terarah.",
      },
    ],
    general: [
      {
        question: "Bagaimana cara memastikan produk ini cocok untuk kebutuhan saya?",
        answer:
          "Lihat komoditas, fase, dan masalah yang ingin dibantu. Bila konteksnya belum jelas, gunakan artikel, solusi, atau konsultasi sebelum checkout.",
      },
      {
        question: "Apakah produk ini lebih cocok untuk trial atau repeat order?",
        answer:
          "Gunakan sekali untuk memastikan kecocokannya, lalu simpan ke wishlist atau jadikan referensi repeat order saat ritme kebutuhannya sudah stabil.",
      },
    ],
  };

  return [...profileFaq[profile], ...common];
}

function buildTrustPoints(profile: ProductProfile) {
  const base: ProductTrustPoint[] = [
    {
      title: "Status stok dan harga aktif",
      body: "Harga yang tampil mengikuti katalog aktif, dan status stok membantu pembeli menilai apakah produk ini siap diproses sekarang.",
    },
    {
      title: "Pengiriman dan tindak lanjut pesanan",
      body: "Setelah checkout, pembeli bisa melacak pesanan dan kembali ke produk ini saat ingin repeat order atau membandingkan opsi pelengkap.",
    },
    {
      title: "Konsultasi sebelum beli",
      body: "Jika kebutuhan belum jelas, arahkan pembeli ke WhatsApp Wiragro agar keputusan belanjanya tetap terasa aman dan masuk akal.",
    },
  ];

  if (profile === "protection") {
    base.unshift({
      title: "Konfirmasi aplikasi lebih aman",
      body: "Untuk produk proteksi, konsultasi sebelum beli membantu memastikan konteks gejala dan alat aplikasi sudah cukup tepat.",
    });
  }

  if (profile === "seed" || profile === "media") {
    base.unshift({
      title: "Lebih aman untuk fase awal",
      body: "Produk fase awal sebaiknya dibeli bersama konteks persemaian dan media yang benar, bukan hanya karena nama produk terlihat familiar.",
    });
  }

  return base.slice(0, 3);
}

export function buildProductConsultationUrl(
  phone?: string | null,
  storeName = "Wiragro",
  productName?: string,
) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  const formatted = normalized.startsWith("0")
    ? `62${normalized.slice(1)}`
    : normalized;
  const message = encodeURIComponent(
    `Halo ${storeName}, saya ingin konsultasi apakah ${productName ?? "produk ini"} cocok untuk tanaman dan kebutuhan saya.`,
  );

  return `https://wa.me/${formatted}?text=${message}`;
}

export function buildProductPageEnrichment(product: ProductDetailPayload): ProductPageEnrichment {
  const text = normalizeText(product);
  const profile = detectProfile(text);
  const commoditySlugs = deriveCommoditySlugs(text, profile);
  const stageSlugs = deriveStageSlugs(text, profile);
  const solutionSlugs = deriveSolutionSlugs(text, profile);

  const baseByProfile: Record<
    ProductProfile,
    Omit<
      ProductPageEnrichment,
      | "profile"
      | "commodityLinks"
      | "stageLinks"
      | "problemLinks"
      | "faq"
      | "trustPoints"
      | "relatedSolutionSlugs"
    >
  > = {
    nutrition: {
      useCaseLabel: "Input nutrisi",
      purpose: "Produk ini paling masuk akal dipakai ketika Anda ingin menjaga ritme nutrisi, mendukung fase tanam, dan mengurangi keputusan belanja yang terlalu reaktif.",
      guidanceNote: "Baca produk ini sebagai bagian dari ritme budidaya, bukan jawaban tunggal untuk semua gejala.",
      primaryBenefits: [
        "Membantu menopang fase awal, vegetatif, atau generatif sesuai konteks tanaman.",
        "Cocok dipakai saat tujuan aplikasinya sudah jelas, bukan hanya karena nama produknya.",
        "Bisa menjadi bagian dari pola repeat order bila ritme penggunaannya sudah stabil.",
      ],
      usageSteps: [
        "Tentukan dulu fase tanam dan tujuan aplikasinya.",
        "Mulai dari pola penggunaan yang konservatif dan pantau respons tanaman.",
        "Gabungkan keputusan produk dengan kondisi akar, media, dan air agar hasilnya lebih masuk akal.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
        ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
        ARTICLE_REFERENCE_SLUGS.chiliStageGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.organicFertilizer,
        PRODUCT_REFERENCE_SLUGS.extraGrow,
        PRODUCT_REFERENCE_SLUGS.sprayer,
      ],
      bundleSuggestion: {
        title: "Lengkapi dengan pendamping fase tanam",
        description: "Paket ringan ini cocok untuk pembeli yang tidak ingin berhenti di satu produk saja, tetapi juga tidak ingin belanja terlalu berlebihan.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.starter),
      },
      reviewPlaceholder: {
        title: "Feedback penggunaan masih bertahap",
        body: "Belum ada rating publik yang matang untuk produk ini. Untuk tahap awal, tampilkan status stok, harga aktif, dan jalur konsultasi sebagai sinyal kepercayaan yang jujur.",
        bullets: ["Status stok real-time", "Harga aktif saat checkout", "Konsultasi WhatsApp tersedia"],
      },
      repeatOrderTitle: "Siapkan jalur repeat order yang lebih rapi",
      repeatOrderBody: "Jika ritme aplikasi produk ini sudah cocok, simpan ke wishlist atau gunakan sebagai referensi order berikutnya agar keputusan belanja berikutnya lebih cepat.",
      consultationPrompt: "Tanya dulu kalau Anda masih ragu apakah kebutuhan Anda benar-benar ada di nutrisi, akar, atau fase tanaman.",
      primaryCtaLabel: "Tambah untuk ritme pemupukan",
      secondaryCtaLabel: "Beli sekarang untuk fase ini",
      quickMeta: ["Untuk ritme nutrisi", "Bisa dipakai lintas fase", "Cocok dibaca bersama gejala"],
    },
    seed: {
      useCaseLabel: "Input fase awal",
      purpose: "Produk ini paling cocok untuk Anda yang sedang menyiapkan fase awal tanam dan ingin memastikan fondasi budidayanya lebih rapi sejak awal.",
      guidanceNote: "Keputusan fase awal paling sehat datang dari kombinasi benih, media, dan ritme persemaian yang saling nyambung.",
      primaryBenefits: [
        "Membantu memulai fase tanam dengan konteks yang lebih jelas.",
        "Cocok dipadukan dengan media dan perlengkapan awal yang relevan.",
        "Lebih meyakinkan bila komoditas dan jalur semainya dipahami lebih dulu.",
      ],
      usageSteps: [
        "Pastikan komoditas dan tujuan tanamnya sudah jelas.",
        "Siapkan media, tray, dan lingkungan awal yang sesuai sebelum penggunaan.",
        "Pantau fase semai dan awal tanam agar keputusan lanjutannya tidak reaktif.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.seedGuide,
        ARTICLE_REFERENCE_SLUGS.chiliStageGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.chiliSeed,
        PRODUCT_REFERENCE_SLUGS.extraGrow,
        PRODUCT_REFERENCE_SLUGS.organicFertilizer,
      ],
      bundleSuggestion: {
        title: "Mulai dari paket fase semai",
        description: "Paket ini membantu memulai dengan fondasi yang lebih utuh, bukan hanya membeli satu item awal.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.starter),
      },
      reviewPlaceholder: {
        title: "Belum ada review publik yang lengkap",
        body: "Untuk produk fase awal, sinyal kepercayaan paling aman sekarang adalah kejelasan komoditas, fase pakai, dan jalur konsultasi sebelum checkout.",
        bullets: ["Cek komoditas", "Cek fase semai", "Gunakan konsultasi sebelum beli"],
      },
      repeatOrderTitle: "Gunakan sebagai acuan siklus tanam berikutnya",
      repeatOrderBody: "Begitu Anda menemukan kombinasi awal yang cocok, jadikan produk ini bagian dari daftar belanja berulang untuk musim atau batch berikutnya.",
      consultationPrompt: "Konsultasi sangat membantu bila Anda masih bingung memilih produk fase awal yang cocok dengan media dan komoditas.",
      primaryCtaLabel: "Tambah untuk mulai tanam",
      secondaryCtaLabel: "Beli sekarang untuk fase awal",
      quickMeta: ["Cocok untuk semai", "Nyambung ke media", "Bagus untuk batch berikutnya"],
    },
    protection: {
      useCaseLabel: "Proteksi lapangan",
      purpose: "Produk ini lebih tepat dipakai setelah dugaan masalahnya cukup kuat, sehingga proteksi tidak terasa seperti pembelian panik.",
      guidanceNote: "Proteksi paling efektif saat gejalanya sudah dibedakan dengan cukup jelas antara hama, penyakit, dan stres tanaman lain.",
      primaryBenefits: [
        "Membantu bergerak dari verifikasi gejala ke tindakan yang lebih tepat.",
        "Cocok dipasangkan dengan alat aplikasi dan monitoring lapangan.",
        "Lebih aman karena keputusan beli tidak dipaksa tanpa konteks gejala.",
      ],
      usageSteps: [
        "Verifikasi dulu apakah gejala lebih dekat ke hama atau penyakit.",
        "Sesuaikan skala penggunaan dengan intensitas masalah di lapangan.",
        "Lengkapi dengan alat aplikasi atau produk pendamping bila memang dibutuhkan.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.earlyPestGuide,
        ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.sprayer,
        PRODUCT_REFERENCE_SLUGS.fostin,
        PRODUCT_REFERENCE_SLUGS.gamectin,
      ],
      bundleSuggestion: {
        title: "Lengkapi dengan alat aplikasi",
        description: "Pembeli yang sudah masuk ke jalur proteksi biasanya butuh kombinasi produk dan alat yang saling mendukung.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.protection),
      },
      reviewPlaceholder: {
        title: "Rating publik belum tersedia",
        body: "Untuk produk proteksi, trust dibangun paling baik dari penjelasan gejala, cara pakai, dan jalur konsultasi yang jujur sebelum pembelian.",
        bullets: ["Baca gejala dulu", "Sesuaikan alat aplikasi", "Konsultasi sebelum checkout"],
      },
      repeatOrderTitle: "Simpan untuk proteksi berulang yang lebih terukur",
      repeatOrderBody: "Jika produk ini cocok, gunakan wishlist atau order history sebagai referensi repeat order agar ritme proteksi berikutnya lebih mudah diulang.",
      consultationPrompt: "Kalau Anda belum yakin gejalanya hama atau penyakit, minta bantuan tim sebelum memilih proteksi.",
      primaryCtaLabel: "Tambah untuk proteksi lapangan",
      secondaryCtaLabel: "Beli sekarang dan lanjut ke checkout",
      quickMeta: ["Untuk gejala yang sudah diverifikasi", "Nyambung ke alat aplikasi", "Lebih aman dengan konsultasi"],
    },
    media: {
      useCaseLabel: "Media & pendukung akar",
      purpose: "Produk ini membantu membangun lingkungan tumbuh yang lebih stabil pada fase semai atau awal tanam, saat akar dan media masih sangat menentukan.",
      guidanceNote: "Masalah fase awal sering datang dari lingkungan tumbuh, jadi media dan perlengkapan pendukung perlu dibaca bersama, bukan terpisah.",
      primaryBenefits: [
        "Membantu fase semai dan awal tanam terasa lebih stabil.",
        "Cocok dipadukan dengan benih dan ritme perawatan awal yang benar.",
        "Bisa menjadi fondasi yang membuat input lanjutan bekerja lebih baik.",
      ],
      usageSteps: [
        "Siapkan media dan lingkungan tumbuh sebelum penggunaan.",
        "Gunakan pada fase awal saat akar masih beradaptasi.",
        "Pantau kelembapan dan respons bibit agar lingkungan semai tidak terlalu berat.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.seedGuide,
        ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.chiliSeed,
        PRODUCT_REFERENCE_SLUGS.extraGrow,
        PRODUCT_REFERENCE_SLUGS.organicFertilizer,
      ],
      bundleSuggestion: {
        title: "Padukan dengan kebutuhan semai",
        description: "Pada fase awal, media, benih, dan nutrisi dasar biasanya lebih efektif jika disiapkan dalam satu alur.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.starter),
      },
      reviewPlaceholder: {
        title: "Trust dibangun lewat konteks penggunaan",
        body: "Pada produk media dan fase awal, pembeli biasanya lebih percaya saat halaman menjelaskan kapan dipakai, untuk bibit apa, dan apa risiko bila salah konteks.",
        bullets: ["Cocok untuk persemaian", "Bantu fase awal", "Terhubung ke solusi semai"],
      },
      repeatOrderTitle: "Cocok dijadikan daftar belanja awal",
      repeatOrderBody: "Jika produk ini berhasil menopang fase awal Anda, simpan sebagai bagian dari paket wajib saat memulai batch tanam berikutnya.",
      consultationPrompt: "Jika bibit masih sering lemah atau media belum stabil, konsultasi bisa membantu sebelum Anda menambah produk lain.",
      primaryCtaLabel: "Tambah untuk fase semai",
      secondaryCtaLabel: "Beli sekarang untuk persiapan awal",
      quickMeta: ["Untuk media dan akar", "Paling cocok di fase awal", "Bagus dipadukan dengan benih"],
    },
    tool: {
      useCaseLabel: "Alat pendukung lapangan",
      purpose: "Produk ini bukan hanya tambahan aksesoris. Ia membantu menjalankan input lain dengan lebih rapi, efisien, dan konsisten di lapangan.",
      guidanceNote: "Alat paling bernilai saat dipakai sebagai bagian dari alur kerja yang jelas, bukan pembelian tambahan tanpa peran yang konkret.",
      primaryBenefits: [
        "Mendukung aplikasi produk lain agar lebih rapi dan efisien.",
        "Membantu menjaga konsistensi penggunaan di lapangan.",
        "Bisa menjadi pendamping penting untuk proteksi atau nutrisi berulang.",
      ],
      usageSteps: [
        "Pastikan alat ini memang menjawab tahap kerja yang sedang Anda jalankan.",
        "Padukan dengan produk utama yang memang sudah cocok untuk gejala atau fase tanaman.",
        "Jadikan alat ini bagian dari pola kerja agar repeat order dan pemakaian berikutnya lebih konsisten.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.earlyPestGuide,
        ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.gamectin,
        PRODUCT_REFERENCE_SLUGS.fostin,
        PRODUCT_REFERENCE_SLUGS.extraGrow,
      ],
      bundleSuggestion: {
        title: "Lengkapi dengan input yang memang dipakai",
        description: "Alat ini paling terasa nilainya bila dipasangkan dengan produk utama yang sesuai kebutuhan lapangan Anda.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.protection),
      },
      reviewPlaceholder: {
        title: "Belum ada rating publik",
        body: "Untuk tahap awal, nilai kepercayaan produk alat bisa dibangun dari konteks penggunaannya, produk pendampingnya, dan konsultasi sebelum beli.",
        bullets: ["Cek peran alat", "Cek input pendamping", "Hubungi tim bila ragu"],
      },
      repeatOrderTitle: "Bantu pola kerja dan pembelian ulang",
      repeatOrderBody: "Setelah alat yang tepat ditemukan, pembelian input pendamping akan lebih mudah diulang karena alur aplikasinya sudah stabil.",
      consultationPrompt: "Kalau Anda bingung alat ini paling tepat dipakai bersama produk apa, tim Wiragro bisa membantu menyesuaikannya.",
      primaryCtaLabel: "Tambah alat ini ke keranjang",
      secondaryCtaLabel: "Beli sekarang",
      quickMeta: ["Untuk ritme kerja lapangan", "Mendukung input utama", "Nyambung ke repeat order"],
    },
    general: {
      useCaseLabel: "Kebutuhan lapangan",
      purpose: "Produk ini paling baik dibaca dari konteks kebutuhan yang sedang dicari, lalu dihubungkan ke komoditas, fase tanam, dan masalah yang sedang dihadapi.",
      guidanceNote: "Jika konteks belum jelas, jangan paksa pembeli langsung checkout. Gunakan artikel, solusi, dan konsultasi sebagai jembatan.",
      primaryBenefits: [
        "Memberi opsi belanja yang tetap terhubung ke konteks penggunaan.",
        "Bisa diposisikan sebagai produk inti atau pelengkap sesuai kebutuhan.",
        "Lebih meyakinkan bila masalah dan fase yang sedang dihadapi sudah dipahami.",
      ],
      usageSteps: [
        "Hubungkan produk ini dengan kebutuhan atau problem yang sedang berjalan.",
        "Pastikan fase tanam dan komoditasnya cukup relevan sebelum membeli.",
        "Jika butuh, gunakan solusi dan artikel terkait untuk memperjelas keputusan.",
      ],
      relatedArticleSlugs: [
        ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
        ARTICLE_REFERENCE_SLUGS.chiliStageGuide,
      ],
      complementaryProductSlugs: [
        PRODUCT_REFERENCE_SLUGS.organicFertilizer,
        PRODUCT_REFERENCE_SLUGS.chiliSeed,
        PRODUCT_REFERENCE_SLUGS.gamectin,
      ],
      bundleSuggestion: {
        title: "Cari pasangan produk yang paling relevan",
        description: "Paket di tahap ini sebaiknya tidak dipaksakan; lebih baik bantu menyusun kombinasi yang benar-benar dibutuhkan.",
        href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.kioskRestock),
      },
      reviewPlaceholder: {
        title: "Sinyal trust masih sederhana",
        body: "Sebelum ada review publik yang kuat, kejelasan fungsi produk, status stok, dan jalur konsultasi adalah sinyal trust yang paling jujur.",
        bullets: ["Lihat fungsi produk", "Baca solusi terkait", "Konsultasi sebelum checkout"],
      },
      repeatOrderTitle: "Siapkan jalur order ulang yang lebih cepat",
      repeatOrderBody: "Simpan produk ini sebagai referensi jika nantinya terbukti cocok untuk kebutuhan lapangan Anda.",
      consultationPrompt: "Kalau fungsi produk ini masih terasa terlalu umum, gunakan konsultasi agar konteks pembelian lebih jelas.",
      primaryCtaLabel: "Tambah ke keranjang",
      secondaryCtaLabel: "Beli sekarang",
      quickMeta: ["Butuh konteks penggunaan", "Bisa jadi produk inti atau pelengkap", "Terhubung ke solusi dan edukasi"],
    },
  };

  return {
    profile,
    ...baseByProfile[profile],
    commodityLinks: buildCommodityLinks(commoditySlugs),
    stageLinks: buildStageLinks(stageSlugs),
    problemLinks: buildProblemLinks(solutionSlugs),
    faq: buildFaq(profile, product.name),
    trustPoints: buildTrustPoints(profile),
    relatedSolutionSlugs: solutionSlugs,
  };
}
