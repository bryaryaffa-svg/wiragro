import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  LEARN_GOAL_REFERENCE_SLUGS,
  SOLUTION_REFERENCE_SLUGS,
  STAGE_REFERENCE_SLUGS,
  assertKnownReferenceSlugs,
  buildBundleHref,
} from "@/lib/content-reference-catalog";

export type CommerceIntent =
  | "consult"
  | "bundle"
  | "repeat-order"
  | "b2b"
  | "campaign"
  | "checkout-followup";

export type CommerceIntentCard = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
};

export type GrowthProofSignal = {
  title: string;
  body: string;
};

export type GrowthBundleItemFallback = {
  sku: string;
  productName: string;
  categoryName: string;
  unit: string;
  weightGrams: string;
  summary: string;
  priceAmount: string;
  compareAtAmount?: string | null;
};

export type GrowthBundleItemDefinition = {
  lineId: string;
  productSlug: string;
  qty: number;
  roleLabel: string;
  notes?: string;
  fallback: GrowthBundleItemFallback;
};

export type GrowthBundlePricingDefinition = {
  bundlePriceAmount: string;
  priceStatus: "mock" | "confirmed";
  note: string;
};

export type GrowthBundleDefinition = {
  sku: string;
  slug: string;
  kind: "commodity" | "phase" | "problem";
  title: string;
  description: string;
  summary: string;
  audience: string;
  catalogHref: string;
  actionLabel: string;
  href: string;
  supportingLinks?: Array<{ href: string; label: string }>;
  bundleItems: GrowthBundleItemDefinition[];
  pricing: GrowthBundlePricingDefinition;
  relatedArticleSlugs: string[];
  relatedSolutionSlugs: string[];
  relatedCommoditySlugs: string[];
  outcomes: string[];
  proofSignals: GrowthProofSignal[];
};

export type GrowthBundlePricingPreview = {
  itemCount: number;
  skuCount: number;
  normalTotalAmount: string;
  bundlePriceAmount: string;
  savingsAmount: string;
  savingsPercent: number;
};

export type B2BOffer = {
  title: string;
  description: string;
  bullets: string[];
};

function normalizePhone(phone?: string | null) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  return normalized.startsWith("0") ? `62${normalized.slice(1)}` : normalized;
}

function parseAmount(value?: string | number | null) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function buildIntentMessage(
  intent: CommerceIntent,
  storeName: string,
  context?: {
    bundleTitle?: string;
    productName?: string;
    campaignTitle?: string;
    commodityLabel?: string;
    checkoutLabel?: string;
  },
) {
  switch (intent) {
    case "bundle":
      return `Halo ${storeName}, saya ingin minta rekomendasi bundle "${context?.bundleTitle ?? "paket kebutuhan tani"}"${context?.commodityLabel ? ` untuk ${context.commodityLabel}` : ""}. Mohon bantu susun kebutuhan dan opsi produknya.`;
    case "repeat-order":
      return `Halo ${storeName}, saya ingin repeat order untuk ${context?.productName ?? "produk sebelumnya"}. Mohon bantu cek stok, qty yang cocok, dan opsi pengiriman.`;
    case "b2b":
      return `Halo ${storeName}, saya ingin diskusi pembelian partai / B2B${context?.commodityLabel ? ` untuk ${context.commodityLabel}` : ""}${context?.productName ? ` terkait ${context.productName}` : ""}. Mohon info harga grosir, minimum order, dan opsi pickup atau delivery.`;
    case "campaign":
      return `Halo ${storeName}, saya tertarik dengan campaign "${context?.campaignTitle ?? "paket pertanian"}" dan ingin tahu rekomendasi terbaik untuk kebutuhan saya.`;
    case "checkout-followup":
      return `Halo ${storeName}, saya sudah masuk ke checkout${context?.checkoutLabel ? ` untuk ${context.checkoutLabel}` : ""}${context?.productName ? ` (${context.productName})` : ""} dan butuh bantuan memastikan stok, ongkir, atau metode pembayaran sebelum lanjut.`;
    case "consult":
    default:
      return `Halo ${storeName}, saya ingin konsultasi tentang kebutuhan tanaman, solusi, dan produk yang paling cocok.`;
  }
}

export function buildCommerceWhatsAppUrl(
  phone?: string | null,
  storeName = "Wiragro",
  intent: CommerceIntent = "consult",
  context?: {
    bundleTitle?: string;
    productName?: string;
    campaignTitle?: string;
    commodityLabel?: string;
    checkoutLabel?: string;
  },
) {
  const formatted = normalizePhone(phone);

  if (!formatted) {
    return null;
  }

  const message = encodeURIComponent(buildIntentMessage(intent, storeName, context));
  return `https://wa.me/${formatted}?text=${message}`;
}

const GROWTH_BUNDLES: GrowthBundleDefinition[] = [
  {
    sku: "BDL-WRG-PHASE-001",
    slug: BUNDLE_REFERENCE_SLUGS.starter,
    kind: "phase",
    title: "Paket mulai tanam",
    description:
      "Bundle fase awal dengan komposisi tetap untuk user yang ingin menyiapkan benih, nutrisi daun, kalsium cair, dan pupuk dasar tanpa merakit sendiri dari nol.",
    summary:
      "Paket ini difokuskan sebagai penawaran resmi fase awal. User mendapat daftar SKU yang sudah dikunci, ringkasan harga bundle, dan jalur pembelian yang lebih cepat dibanding menyusun keranjang manual.",
    audience: "Pemula, kebun rumah, user yang sedang membuka batch tanam baru, dan pembeli yang ingin start lebih rapi.",
    catalogHref: "/produk?q=benih",
    actionLabel: "Lihat detail & harga bundle",
    href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.starter),
    supportingLinks: [
      {
        href: `/belajar/tujuan/${LEARN_GOAL_REFERENCE_SLUGS.basics}`,
        label: "Belajar dasar",
      },
      {
        href: `/solusi/fase/${STAGE_REFERENCE_SLUGS.nursery}`,
        label: "Solusi fase awal",
      },
    ],
    bundleItems: [
      {
        lineId: "seed",
        productSlug: "benih-cabai-prima-f1",
        qty: 1,
        roleLabel: "Benih inti",
        notes: "Dasar batch tanam awal.",
        fallback: {
          sku: "PRD-BNH-001",
          productName: "Benih Cabai Prima F1",
          categoryName: "Benih",
          unit: "pack",
          weightGrams: "250",
          summary: "Benih cabai untuk fase semai dan awal tanam.",
          priceAmount: "39000.00",
          compareAtAmount: "42000.00",
        },
      },
      {
        lineId: "grow",
        productSlug: "extra-grow-liquid-500-ml",
        qty: 1,
        roleLabel: "Nutrisi vegetatif",
        notes: "Membantu fase daun dan awal pertumbuhan.",
        fallback: {
          sku: "PRD-NTR-001",
          productName: "Extra Grow Liquid 500 ml",
          categoryName: "Nutrisi",
          unit: "botol",
          weightGrams: "500",
          summary: "Nutrisi cair fase awal untuk pertumbuhan merata.",
          priceAmount: "46000.00",
          compareAtAmount: "49000.00",
        },
      },
      {
        lineId: "calcium",
        productSlug: "super-calsium-liquid-500-ml",
        qty: 1,
        roleLabel: "Penguat fase awal",
        notes: "Dipakai untuk menjaga fondasi pertumbuhan dan pembentukan jaringan.",
        fallback: {
          sku: "PRD-NTR-002",
          productName: "Super Calsium Liquid 500 ml",
          categoryName: "Nutrisi",
          unit: "botol",
          weightGrams: "500",
          summary: "Kalsium cair untuk membantu fase awal dan transisi vegetatif.",
          priceAmount: "49000.00",
          compareAtAmount: "52000.00",
        },
      },
      {
        lineId: "organic",
        productSlug: "pupuk-organik-25-kg",
        qty: 1,
        roleLabel: "Pupuk dasar",
        notes: "Fondasi nutrisi awal di lahan atau media.",
        fallback: {
          sku: "PRD-001",
          productName: "Pupuk Organik 25 Kg",
          categoryName: "Pupuk",
          unit: "sak",
          weightGrams: "25000",
          summary: "Pupuk organik granul untuk fondasi pemupukan awal.",
          priceAmount: "79000.00",
          compareAtAmount: "85000.00",
        },
      },
    ],
    pricing: {
      bundlePriceAmount: "198000.00",
      priceStatus: "mock",
      note:
        "Harga bundle pilot untuk uji monetisasi. Tim komersial perlu mengonfirmasi harga final, diskon, dan masa aktif promo sebelum rollout penuh.",
    },
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.seedGuide,
      ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.dampingOff,
      SOLUTION_REFERENCE_SLUGS.slowGrowth,
    ],
    relatedCommoditySlugs: [
      COMMODITY_REFERENCE_SLUGS.homeGarden,
      COMMODITY_REFERENCE_SLUGS.leafyGreens,
      COMMODITY_REFERENCE_SLUGS.chili,
    ],
    outcomes: [
      "Mempercepat keputusan beli untuk fase awal tanpa terasa membabi buta.",
      "Membuat bundle punya komposisi SKU tetap dan mudah diulang pembeliannya.",
      "Cocok dijadikan entry offer untuk user baru dan repeat order fase awal.",
    ],
    proofSignals: [
      {
        title: "Komposisi bundle sudah dikunci",
        body: "User tidak lagi diarahkan ke kumpulan hasil pencarian yang berubah-ubah. Paket ini punya daftar SKU, qty, dan harga bundle yang lebih konsisten.",
      },
      {
        title: "Masih nyambung ke artikel dan solusi",
        body: "Bundle resmi tetap mempertahankan layer edukasi dan problem-solving agar keputusan beli terasa meyakinkan, bukan sekadar hard sell.",
      },
      {
        title: "Cocok untuk starter offer",
        body: "Paket ini paling aman dipakai untuk user fase awal yang butuh jalur belanja lebih sederhana daripada katalog umum.",
      },
    ],
  },
  {
    sku: "BDL-WRG-PROB-001",
    slug: BUNDLE_REFERENCE_SLUGS.protection,
    kind: "problem",
    title: "Paket proteksi dasar",
    description:
      "Bundle problem-first dengan rangkaian proteksi dan alat aplikasi yang sudah dikunci untuk user yang datang dari gejala hama atau penyakit ringan.",
    summary:
      "Alih-alih hanya memberi landing edukatif, paket proteksi dasar sekarang berfungsi sebagai offer yang bisa langsung dibeli: ada SKU tetap, harga bundle, dan jalur add-to-cart yang jelas.",
    audience: "User yang datang dari gejala lapangan, admin toko yang butuh template rekomendasi, dan pembeli yang ingin paket proteksi siap pakai.",
    catalogHref: "/produk?q=pestisida",
    actionLabel: "Lihat detail & harga bundle",
    href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.protection),
    supportingLinks: [
      { href: "/solusi/gejala/daun-berlubang", label: "Gejala daun berlubang" },
      { href: "/belajar/topik/hama-penyakit", label: "Belajar hama & penyakit" },
    ],
    bundleItems: [
      {
        lineId: "insecticide",
        productSlug: "gamectin-30-ec-500-ml",
        qty: 1,
        roleLabel: "Proteksi hama awal",
        notes: "Masuk akal untuk gejala serangga ringan sampai menengah.",
        fallback: {
          sku: "PRD-PST-001",
          productName: "Gamectin 30 EC 500 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "500",
          summary: "Proteksi hama awal untuk serangan daun dan serangga umum.",
          priceAmount: "63000.00",
          compareAtAmount: "68000.00",
        },
      },
      {
        lineId: "fungicide",
        productSlug: "fostin-610-ec-400-ml",
        qty: 1,
        roleLabel: "Proteksi jamur",
        notes: "Menjadi cadangan saat gejala mulai mengarah ke bercak atau kelembapan tinggi.",
        fallback: {
          sku: "PRD-PST-002",
          productName: "Fostin 610 EC 400 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "400",
          summary: "Proteksi jamur ringan untuk fase awal respons lapangan.",
          priceAmount: "68000.00",
          compareAtAmount: "72000.00",
        },
      },
      {
        lineId: "support",
        productSlug: "v-protect-100-ml",
        qty: 1,
        roleLabel: "Proteksi pendukung",
        notes: "Tambahan untuk paket proteksi dasar agar tidak hanya bertumpu pada satu bahan aktif.",
        fallback: {
          sku: "PRD-PST-003",
          productName: "V-Protect 100 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "100",
          summary: "Produk pendamping proteksi untuk respons awal.",
          priceAmount: "36000.00",
          compareAtAmount: "39000.00",
        },
      },
      {
        lineId: "sprayer",
        productSlug: "sprayer-punggung-16l",
        qty: 1,
        roleLabel: "Alat aplikasi",
        notes: "Masuk akal untuk pembeli yang belum punya alat semprot sendiri.",
        fallback: {
          sku: "KS-ALT-001",
          productName: "Sprayer Punggung 16L",
          categoryName: "Alat Pertanian",
          unit: "unit",
          weightGrams: "3500",
          summary: "Sprayer ringan untuk aplikasi proteksi dan nutrisi.",
          priceAmount: "355000.00",
          compareAtAmount: null,
        },
      },
    ],
    pricing: {
      bundlePriceAmount: "489000.00",
      priceStatus: "mock",
      note:
        "Harga bundle masih status pilot. Tim komersial perlu menetapkan apakah alat aplikasi selalu ikut paket atau dijadikan upsell optional.",
    },
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.earlyPestGuide,
      ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.leafPests,
      SOLUTION_REFERENCE_SLUGS.leafSpot,
    ],
    relatedCommoditySlugs: [
      COMMODITY_REFERENCE_SLUGS.chili,
      COMMODITY_REFERENCE_SLUGS.fruitHorti,
      COMMODITY_REFERENCE_SLUGS.leafyGreens,
    ],
    outcomes: [
      "Menjaga conversion saat user datang dari problem nyata, bukan dari listing produk.",
      "Menjadikan proteksi dasar sebagai offer yang bisa langsung dibeli atau diangkat ke WA.",
      "Mendorong attach rate lewat alat aplikasi dan proteksi pendukung yang relevan.",
    ],
    proofSignals: [
      {
        title: "Problem-first tetapi tetap jualan",
        body: "Bundle ini masih berangkat dari gejala, tetapi ujungnya bukan lagi query produk acak. User mendapat paket resmi yang bisa dipertimbangkan dengan lebih cepat.",
      },
      {
        title: "Masih cocok untuk assisted sales",
        body: "Admin toko dapat memakai paket ini sebagai template rekomendasi, lalu menyesuaikan hanya bila ada kontraindikasi lapangan.",
      },
      {
        title: "Attach rate lebih jelas",
        body: "Sprayer dan proteksi pendukung dimasukkan ke dalam satu penawaran yang lebih utuh sehingga AOV lebih mudah naik.",
      },
    ],
  },
  {
    sku: "BDL-WRG-COM-001",
    slug: BUNDLE_REFERENCE_SLUGS.kioskRestock,
    kind: "commodity",
    title: "Paket belanja kios",
    description:
      "Bundle komersial untuk kios, reseller, dan pembeli rutin yang ingin mengisi ulang stok inti dengan penawaran yang lebih rapi daripada belanja satu-satu.",
    summary:
      "Paket ini dirancang sebagai offer repeatable. SKU, qty, dan harga bundle sudah dikunci supaya admin toko maupun buyer bisa mengulang pembelian dengan lebih cepat.",
    audience: "Kios, reseller, pembeli rutin, dan user yang ingin membuat repeat order terasa lebih pendek jalurnya.",
    catalogHref: "/produk?q=kebutuhan kios",
    actionLabel: "Lihat detail & harga bundle",
    href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.kioskRestock),
    supportingLinks: [
      { href: "/b2b", label: "B2B inquiry" },
      { href: "/akun", label: "Cek repeat order" },
    ],
    bundleItems: [
      {
        lineId: "organic",
        productSlug: "pupuk-organik-25-kg",
        qty: 2,
        roleLabel: "Stok pupuk dasar",
        notes: "Dikunci 2 sak agar lebih dekat dengan pola restock kios kecil-menengah.",
        fallback: {
          sku: "PRD-001",
          productName: "Pupuk Organik 25 Kg",
          categoryName: "Pupuk",
          unit: "sak",
          weightGrams: "25000",
          summary: "Pupuk organik granul untuk fondasi pemupukan rutin.",
          priceAmount: "79000.00",
          compareAtAmount: "85000.00",
        },
      },
      {
        lineId: "insecticide",
        productSlug: "gamectin-30-ec-500-ml",
        qty: 1,
        roleLabel: "Proteksi laris",
        notes: "Produk pelengkap yang mudah dibawa ke repeat order atau penjualan retail ulang.",
        fallback: {
          sku: "PRD-PST-001",
          productName: "Gamectin 30 EC 500 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "500",
          summary: "Proteksi hama awal untuk serangan daun dan serangga umum.",
          priceAmount: "63000.00",
          compareAtAmount: "68000.00",
        },
      },
      {
        lineId: "booster",
        productSlug: "extra-grow-liquid-500-ml",
        qty: 1,
        roleLabel: "Nutrisi cepat jual",
        notes: "Masuk sebagai item attach rate yang masih masuk akal untuk kios.",
        fallback: {
          sku: "PRD-NTR-001",
          productName: "Extra Grow Liquid 500 ml",
          categoryName: "Nutrisi",
          unit: "botol",
          weightGrams: "500",
          summary: "Nutrisi cair fase awal untuk pertumbuhan merata.",
          priceAmount: "46000.00",
          compareAtAmount: "49000.00",
        },
      },
      {
        lineId: "sprayer",
        productSlug: "sprayer-punggung-16l",
        qty: 1,
        roleLabel: "Alat pendukung toko",
        notes: "Bisa dibeli untuk kebutuhan display, operasional, atau dijual ulang.",
        fallback: {
          sku: "KS-ALT-001",
          productName: "Sprayer Punggung 16L",
          categoryName: "Alat Pertanian",
          unit: "unit",
          weightGrams: "3500",
          summary: "Sprayer ringan untuk aplikasi proteksi dan nutrisi.",
          priceAmount: "355000.00",
          compareAtAmount: null,
        },
      },
    ],
    pricing: {
      bundlePriceAmount: "579000.00",
      priceStatus: "mock",
      note:
        "Harga bundle ini masih mock. Tim komersial perlu menetapkan apakah paket kios memakai harga retail, reseller, atau harga khusus bundle untuk pelanggan rutin.",
    },
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.fertilizerGuide,
      ARTICLE_REFERENCE_SLUGS.seedGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.slowGrowth,
      SOLUTION_REFERENCE_SLUGS.leafPests,
    ],
    relatedCommoditySlugs: [
      COMMODITY_REFERENCE_SLUGS.rice,
      COMMODITY_REFERENCE_SLUGS.chili,
      COMMODITY_REFERENCE_SLUGS.corn,
    ],
    outcomes: [
      "Mengangkat AOV dan membuat pembelian rutin terasa lebih rapi.",
      "Menjadi offer yang lebih mudah diulang daripada pencarian katalog manual.",
      "Membuka jalur B2B ringan tanpa harus menunggu engine grosir penuh.",
    ],
    proofSignals: [
      {
        title: "Dirancang untuk repeatability",
        body: "Qty bundle dikunci pada pola restock yang masuk akal agar pembelian berikutnya bisa diproses lebih cepat.",
      },
      {
        title: "Lebih konkret untuk admin toko",
        body: "Tim toko tidak lagi perlu mengutip daftar barang satu-satu. Paket kios ini sudah punya SKU bundle dan komposisi yang konsisten.",
      },
      {
        title: "Mudah dibawa ke B2B",
        body: "Kalau buyer butuh volume lebih besar, paket yang sama dapat menjadi titik awal percakapan B2B dan quotation ringan.",
      },
    ],
  },
  {
    sku: "BDL-WRG-COM-002",
    slug: BUNDLE_REFERENCE_SLUGS.riceStarter,
    kind: "commodity",
    title: "Bundle awal tanam padi",
    description:
      "Bundle komoditas padi dengan SKU tetap untuk fase awal, sehingga user padi tidak berhenti di halaman edukasi tanpa tawaran yang konkret.",
    summary:
      "Offer ini menutup jarak dari komoditas ke pembelian. Ada benih inti, pupuk dasar, dan penguat fase awal yang sudah dikunci sebagai paket resmi.",
    audience: "Petani padi, kios area sawah, dan user yang ingin memulai fase awal padi dengan komposisi yang lebih jelas.",
    catalogHref: "/produk?q=benih padi",
    actionLabel: "Lihat detail & harga bundle",
    href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.riceStarter),
    supportingLinks: [
      {
        href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.rice}`,
        label: "Hub komoditas padi",
      },
      { href: "/solusi/komoditas/padi", label: "Solusi padi" },
    ],
    bundleItems: [
      {
        lineId: "seed",
        productSlug: "benih-padi-inpari-32-5kg",
        qty: 1,
        roleLabel: "Benih komoditas",
        notes: "Menjadi anchor utama bundle padi.",
        fallback: {
          sku: "PRD-BNH-002",
          productName: "Benih Padi Inpari 32 5 Kg",
          categoryName: "Benih",
          unit: "sak",
          weightGrams: "5000",
          summary: "Benih padi awal tanam untuk kebutuhan sawah skala kecil-menengah.",
          priceAmount: "92000.00",
          compareAtAmount: "98000.00",
        },
      },
      {
        lineId: "organic",
        productSlug: "pupuk-organik-25-kg",
        qty: 1,
        roleLabel: "Pupuk dasar sawah",
        notes: "Komponen pemupukan awal yang mudah dipahami buyer padi.",
        fallback: {
          sku: "PRD-001",
          productName: "Pupuk Organik 25 Kg",
          categoryName: "Pupuk",
          unit: "sak",
          weightGrams: "25000",
          summary: "Pupuk organik granul untuk fondasi pemupukan rutin.",
          priceAmount: "79000.00",
          compareAtAmount: "85000.00",
        },
      },
      {
        lineId: "support",
        productSlug: "super-calsium-liquid-500-ml",
        qty: 1,
        roleLabel: "Pendukung fase awal",
        notes: "Dipakai sebagai penguat agar offer tidak berhenti di benih + pupuk saja.",
        fallback: {
          sku: "PRD-NTR-002",
          productName: "Super Calsium Liquid 500 ml",
          categoryName: "Nutrisi",
          unit: "botol",
          weightGrams: "500",
          summary: "Kalsium cair untuk membantu fase awal dan transisi vegetatif.",
          priceAmount: "49000.00",
          compareAtAmount: "52000.00",
        },
      },
    ],
    pricing: {
      bundlePriceAmount: "205000.00",
      priceStatus: "mock",
      note:
        "Tim komersial perlu memastikan apakah bundle padi final memakai SKU benih ini atau varian lain per area. Struktur kode sudah siap untuk diganti tanpa mengubah UI.",
    },
    relatedArticleSlugs: [ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    relatedSolutionSlugs: [SOLUTION_REFERENCE_SLUGS.slowGrowth],
    relatedCommoditySlugs: [COMMODITY_REFERENCE_SLUGS.rice],
    outcomes: [
      "Menyederhanakan pembelian awal untuk komoditas padi.",
      "Menjadikan halaman komoditas punya offer resmi, bukan hanya jalur navigasi.",
      "Lebih siap dipakai sebagai landing musiman atau assisted sale komoditas.",
    ],
    proofSignals: [
      {
        title: "Komoditas punya penawaran resmi",
        body: "User padi sering datang dari konteks budidaya, bukan dari nama produk. Bundle ini menutup jarak itu dengan offer yang lebih konkret.",
      },
      {
        title: "Harga bundle membantu keputusan",
        body: "Begitu user melihat total normal versus harga bundle, keputusan beli terasa lebih cepat dibanding membaca banyak PDP satu per satu.",
      },
      {
        title: "Aman untuk rollout bertahap",
        body: "Kalau SKU final untuk padi berubah per area, tim tinggal mengganti mapping item tanpa membongkar seluruh halaman bundle.",
      },
    ],
  },
  {
    sku: "BDL-WRG-COM-003",
    slug: BUNDLE_REFERENCE_SLUGS.chiliTrack,
    kind: "commodity",
    title: "Bundle jalur cabai",
    description:
      "Bundle komoditas cabai dengan kombinasi benih, proteksi, dan booster generatif yang dikunci sebagai penawaran resmi untuk intent cabai.",
    summary:
      "Cabai punya banyak cabang intent. Paket ini merapikannya menjadi satu offer yang lebih mudah dipahami: ada SKU tetap, harga bundle, dan opsi add-to-cart langsung.",
    audience: "Petani cabai, user hortikultura intensif, dan pembeli yang datang dari gejala atau kebutuhan generatif.",
    catalogHref: "/produk?q=benih cabai",
    actionLabel: "Lihat detail & harga bundle",
    href: buildBundleHref(BUNDLE_REFERENCE_SLUGS.chiliTrack),
    supportingLinks: [
      {
        href: `/komoditas/${COMMODITY_REFERENCE_SLUGS.chili}`,
        label: "Hub komoditas cabai",
      },
      { href: "/solusi/komoditas/cabai", label: "Solusi cabai" },
    ],
    bundleItems: [
      {
        lineId: "seed",
        productSlug: "benih-cabai-prima-f1",
        qty: 1,
        roleLabel: "Benih komoditas",
        notes: "Anchor utama untuk user yang benar-benar mulai dari cabai.",
        fallback: {
          sku: "PRD-BNH-001",
          productName: "Benih Cabai Prima F1",
          categoryName: "Benih",
          unit: "pack",
          weightGrams: "250",
          summary: "Benih cabai untuk fase semai dan awal tanam.",
          priceAmount: "39000.00",
          compareAtAmount: "42000.00",
        },
      },
      {
        lineId: "insecticide",
        productSlug: "gamectin-30-ec-500-ml",
        qty: 1,
        roleLabel: "Proteksi hama",
        notes: "Masuk untuk menjaga jalur cabai tidak berhenti di benih saja.",
        fallback: {
          sku: "PRD-PST-001",
          productName: "Gamectin 30 EC 500 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "500",
          summary: "Proteksi hama awal untuk serangan daun dan serangga umum.",
          priceAmount: "63000.00",
          compareAtAmount: "68000.00",
        },
      },
      {
        lineId: "fungicide",
        productSlug: "fostin-610-ec-400-ml",
        qty: 1,
        roleLabel: "Proteksi jamur",
        notes: "Penting untuk intent cabai di musim lembap atau saat gejala mulai muncul.",
        fallback: {
          sku: "PRD-PST-002",
          productName: "Fostin 610 EC 400 ml",
          categoryName: "Pestisida",
          unit: "botol",
          weightGrams: "400",
          summary: "Proteksi jamur ringan untuk fase awal respons lapangan.",
          priceAmount: "68000.00",
          compareAtAmount: "72000.00",
        },
      },
      {
        lineId: "booster",
        productSlug: "super-kalium",
        qty: 1,
        roleLabel: "Booster generatif",
        notes: "Mendorong attach rate dengan item yang relevan untuk fase lanjut cabai.",
        fallback: {
          sku: "PRD-NTR-003",
          productName: "Super Kalium",
          categoryName: "Nutrisi",
          unit: "botol",
          weightGrams: "500",
          summary: "Booster generatif untuk kebutuhan bunga dan buah.",
          priceAmount: "54000.00",
          compareAtAmount: "57000.00",
        },
      },
    ],
    pricing: {
      bundlePriceAmount: "209000.00",
      priceStatus: "mock",
      note:
        "Harga bundle jalur cabai masih butuh finalisasi tim. Komposisi SKU sudah dibuat stabil supaya keputusan harga bisa dilakukan tanpa refactor tambahan.",
    },
    relatedArticleSlugs: [
      ARTICLE_REFERENCE_SLUGS.seedGuide,
      ARTICLE_REFERENCE_SLUGS.earlyPestGuide,
      ARTICLE_REFERENCE_SLUGS.chiliStageGuide,
    ],
    relatedSolutionSlugs: [
      SOLUTION_REFERENCE_SLUGS.yellowLeaves,
      SOLUTION_REFERENCE_SLUGS.leafPests,
      SOLUTION_REFERENCE_SLUGS.blossomDrop,
    ],
    relatedCommoditySlugs: [COMMODITY_REFERENCE_SLUGS.chili],
    outcomes: [
      "Menyatukan intent cabai yang biasanya tercecer di artikel, solusi, dan katalog.",
      "Membuat bundle cabai punya CTA pembelian yang lebih eksplisit dan mudah dihitung nilainya.",
      "Membantu admin toko menjual dengan bahasa komoditas sekaligus menjaga attach rate.",
    ],
    proofSignals: [
      {
        title: "Cabai sekarang punya offer konkret",
        body: "Paket ini memberi bentuk yang lebih jelas pada intent cabai: bukan cuma edukasi, tetapi penawaran yang siap dibeli atau dibawa ke WA.",
      },
      {
        title: "Masih terhubung ke jalur solusi",
        body: "User tetap bisa validasi gejala dan fase, tetapi saat sudah siap membeli mereka tidak perlu merakit keranjang panjang lagi.",
      },
      {
        title: "Cocok untuk seasonality",
        body: "Bundle komoditas seperti ini lebih mudah dipakai untuk campaign musiman, WA follow-up, atau dorongan AOV di PDP cabai.",
      },
    ],
  },
];

assertKnownReferenceSlugs(
  "growth-commerce",
  "article",
  GROWTH_BUNDLES.flatMap((bundle) => bundle.relatedArticleSlugs),
  Object.values(ARTICLE_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "growth-commerce",
  "solution",
  GROWTH_BUNDLES.flatMap((bundle) => bundle.relatedSolutionSlugs),
  Object.values(SOLUTION_REFERENCE_SLUGS),
);
assertKnownReferenceSlugs(
  "growth-commerce",
  "commodity",
  GROWTH_BUNDLES.flatMap((bundle) => bundle.relatedCommoditySlugs),
  Object.values(COMMODITY_REFERENCE_SLUGS),
);

export const B2B_OFFERS: B2BOffer[] = [
  {
    title: "Pembelian partai untuk kebun atau proyek",
    description:
      "Cocok untuk tim yang butuh suplai lebih besar, diskusi kebutuhan per fase, atau kombinasi beberapa komoditas.",
    bullets: ["Diskusi qty dan ritme pengiriman", "Pilihan pickup atau delivery", "Rekomendasi bundle awal untuk briefing cepat"],
  },
  {
    title: "Inquiry untuk kios atau reseller",
    description:
      "Jalur ringan untuk toko yang ingin menanyakan ketersediaan produk inti, pelengkap, dan kemungkinan pola repeat order.",
    bullets: ["Produk inti dan pelengkap", "Alur repeat order yang lebih cepat", "Percakapan harga grosir via WhatsApp"],
  },
  {
    title: "Assisted commerce untuk kebutuhan rutin",
    description:
      "Bila katalog terlalu ramai untuk tim lapangan, jalur B2B membantu menyederhanakan belanja menjadi daftar prioritas yang lebih bisa diproses.",
    bullets: ["Kurasi SKU yang sering dibutuhkan", "Masuk dari bundle atau komoditas", "Mudah dibawa ke follow-up manual"],
  },
];

export function getGrowthBundlePricingPreview(
  bundle: Pick<GrowthBundleDefinition, "bundleItems" | "pricing">,
): GrowthBundlePricingPreview {
  const itemCount = bundle.bundleItems.reduce((total, item) => total + item.qty, 0);
  const normalTotal = bundle.bundleItems.reduce(
    (total, item) => total + parseAmount(item.fallback.priceAmount) * item.qty,
    0,
  );
  const bundlePrice = parseAmount(bundle.pricing.bundlePriceAmount);
  const savings = Math.max(normalTotal - bundlePrice, 0);
  const savingsPercent = normalTotal > 0 ? Math.round((savings / normalTotal) * 100) : 0;

  return {
    itemCount,
    skuCount: bundle.bundleItems.length,
    normalTotalAmount: formatAmount(normalTotal),
    bundlePriceAmount: formatAmount(bundlePrice),
    savingsAmount: formatAmount(savings),
    savingsPercent,
  };
}

export function getAllGrowthBundles() {
  return GROWTH_BUNDLES;
}

export function getGrowthBundle(slug: string) {
  return GROWTH_BUNDLES.find((bundle) => bundle.slug === slug) ?? null;
}

export function getFeaturedGrowthBundles(limit = 6) {
  return GROWTH_BUNDLES.slice(0, limit);
}

export function getRelatedGrowthBundles(
  current: GrowthBundleDefinition,
  limit = 3,
) {
  return GROWTH_BUNDLES.filter((bundle) => bundle.slug !== current.slug)
    .sort((left, right) => {
      const leftScore = left.kind === current.kind ? 1 : 0;
      const rightScore = right.kind === current.kind ? 1 : 0;
      return rightScore - leftScore;
    })
    .slice(0, limit);
}

export function getGrowthBundleKindLabel(kind: GrowthBundleDefinition["kind"]) {
  switch (kind) {
    case "phase":
      return "Bundle fase";
    case "problem":
      return "Bundle problem";
    case "commodity":
    default:
      return "Bundle komoditas";
  }
}

export function buildCommerceIntentCards(input: {
  phone?: string | null;
  storeName?: string | null;
  bundleTitle?: string;
  productName?: string;
  commodityLabel?: string;
  includeCampaign?: boolean;
  includeCheckoutFollowUp?: boolean;
  checkoutLabel?: string;
}): CommerceIntentCard[] {
  const storeName = input.storeName ?? "Wiragro";
  const cards: CommerceIntentCard[] = [];

  const consultHref = buildCommerceWhatsAppUrl(input.phone, storeName, "consult", {
    commodityLabel: input.commodityLabel,
    productName: input.productName,
  });
  if (consultHref) {
    cards.push({
      eyebrow: "WhatsApp commerce",
      title: "Konsultasi cepat",
      description:
        "Untuk user yang butuh validasi cepat sebelum memilih produk, bundle, atau langkah berikutnya.",
      href: consultHref,
      actionLabel: "Konsultasi sekarang",
    });
  }

  const bundleHref = buildCommerceWhatsAppUrl(input.phone, storeName, "bundle", {
    bundleTitle: input.bundleTitle,
    commodityLabel: input.commodityLabel,
  });
  if (bundleHref) {
    cards.push({
      eyebrow: "WhatsApp commerce",
      title: "Minta rekomendasi bundle",
      description:
        "Arahkan user ke jalur bundle yang lebih terstruktur bila kebutuhan mereka belum mau dirakit sendiri.",
      href: bundleHref,
      actionLabel: "Minta bundle",
    });
  }

  const repeatHref = buildCommerceWhatsAppUrl(input.phone, storeName, "repeat-order", {
    productName: input.productName,
    commodityLabel: input.commodityLabel,
  });
  if (repeatHref) {
    cards.push({
      eyebrow: "Retention",
      title: "Repeat order via WA",
      description:
        "Buat pembelian ulang terasa lebih ringan ketika user sudah tahu produk atau ritme kebutuhannya.",
      href: repeatHref,
      actionLabel: "Repeat order",
    });
  }

  const b2bHref = buildCommerceWhatsAppUrl(input.phone, storeName, "b2b", {
    bundleTitle: input.bundleTitle,
    productName: input.productName,
    commodityLabel: input.commodityLabel,
  });
  if (b2bHref) {
    cards.push({
      eyebrow: "B2B",
      title: "Diskusi pembelian partai",
      description:
        "Masuk dari kebutuhan grosir, pasokan rutin, atau inquiry kios tanpa harus menunggu sistem grosir penuh.",
      href: b2bHref,
      actionLabel: "Minta penawaran",
    });
  }

  if (input.includeCampaign) {
    const campaignHref = buildCommerceWhatsAppUrl(input.phone, storeName, "campaign", {
      campaignTitle: input.bundleTitle,
    });
    if (campaignHref) {
      cards.push({
        eyebrow: "Campaign",
        title: "Minta campaign landing",
        description:
          "Cocok untuk eksperimen campaign lokal atau musiman yang butuh assisted selling lebih dulu.",
        href: campaignHref,
        actionLabel: "Diskusikan campaign",
      });
    }
  }

  if (input.includeCheckoutFollowUp) {
    const checkoutHref = buildCommerceWhatsAppUrl(
      input.phone,
      storeName,
      "checkout-followup",
      {
        bundleTitle: input.bundleTitle,
        productName: input.productName,
        commodityLabel: input.commodityLabel,
        checkoutLabel: input.checkoutLabel,
      },
    );
    if (checkoutHref) {
      cards.push({
        eyebrow: "Checkout assist",
        title: "Follow-up checkout",
        description:
          "Untuk user yang sudah serius membeli tetapi masih perlu bantuan soal stok, ongkir, pembayaran, atau langkah terakhir sebelum order masuk.",
        href: checkoutHref,
        actionLabel: "Minta bantuan checkout",
      });
    }
  }

  return cards;
}

type GrowthBundleContextInput = {
  commoditySlug?: string | null;
  solutionSlug?: string | null;
};

export function getGrowthBundlesForContext(
  input: GrowthBundleContextInput,
  limit = 3,
) {
  const commoditySlug = input.commoditySlug ?? null;
  const solutionSlug = input.solutionSlug ?? null;

  return GROWTH_BUNDLES.map((bundle) => {
    let score = 0;

    if (commoditySlug && bundle.relatedCommoditySlugs.includes(commoditySlug)) {
      score += 2;
    }

    if (solutionSlug && bundle.relatedSolutionSlugs.includes(solutionSlug)) {
      score += 3;
    }

    return {
      bundle,
      score,
    };
  })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.bundle);
}
