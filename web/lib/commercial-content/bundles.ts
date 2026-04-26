import {
  ARTICLE_REFERENCE_SLUGS,
  BUNDLE_REFERENCE_SLUGS,
  COMMODITY_REFERENCE_SLUGS,
  LEARN_GOAL_REFERENCE_SLUGS,
  SOLUTION_REFERENCE_SLUGS,
  STAGE_REFERENCE_SLUGS,
} from "@/lib/content-reference-catalog";
import type { GrowthBundleSourceDefinition } from "@/lib/growth-commerce";

export const GROWTH_BUNDLE_SOURCES = [
  {
    ops: {
      status: "active",
      priority: 100,
    },
    sku: "BDL-WRG-PHASE-001",
    slug: BUNDLE_REFERENCE_SLUGS.starter,
    kind: "phase",
    title: "Paket mulai tanam",
    description:
      "Paket fase awal dengan komposisi tetap untuk pengunjung yang ingin menyiapkan benih, nutrisi daun, kalsium cair, dan pupuk dasar tanpa merakit sendiri dari nol.",
    summary:
      "Paket ini difokuskan sebagai penawaran resmi fase awal. Pengunjung mendapat daftar SKU yang sudah dikunci, ringkasan harga paket, dan jalur pembelian yang lebih cepat dibanding menyusun keranjang manual.",
    audience:
      "Pemula, kebun rumah, pengunjung yang sedang membuka batch tanam baru, dan pembeli yang ingin memulai lebih rapi.",
    catalogHref: "/produk?q=benih",
    actionLabel: "Lihat detail & harga bundle",
    supportingLinks: [
      {
        href: "/artikel",
        label: "Edukasi dasar",
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
        "Harga paket ini masih estimasi awal. Tim Wiragro masih menetapkan harga final, potongan, dan masa aktif penawaran sebelum dipakai penuh.",
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
      "Cocok dijadikan penawaran awal untuk pengunjung baru dan repeat order fase awal.",
    ],
    proofSignals: [
      {
        title: "Komposisi bundle sudah dikunci",
        body: "Pengunjung tidak lagi diarahkan ke kumpulan hasil pencarian yang berubah-ubah. Paket ini punya daftar SKU, jumlah, dan harga paket yang lebih konsisten.",
      },
      {
        title: "Masih nyambung ke artikel dan solusi",
        body: "Paket resmi tetap mempertahankan lapisan edukasi dan solusi agar keputusan beli terasa meyakinkan, bukan sekadar dorongan untuk langsung membeli.",
      },
      {
        title: "Cocok untuk starter offer",
        body: "Paket ini paling aman dipakai untuk pengunjung fase awal yang butuh jalur belanja lebih sederhana daripada katalog umum.",
      },
    ],
  },
  {
    ops: {
      status: "active",
      priority: 95,
    },
    sku: "BDL-WRG-PROB-001",
    slug: BUNDLE_REFERENCE_SLUGS.protection,
    kind: "problem",
    title: "Paket proteksi dasar",
    description:
      "Paket solusi awal dengan rangkaian proteksi dan alat aplikasi yang sudah disusun untuk pengunjung yang datang dari gejala hama atau penyakit ringan.",
    summary:
      "Paket proteksi dasar ini tidak berhenti di edukasi saja. Komposisinya sudah jelas, harganya mudah dibaca, dan jalur belinya langsung tersedia.",
    audience:
      "Pengunjung yang datang dari gejala lapangan dan pembeli yang ingin paket proteksi siap pakai.",
    catalogHref: "/produk?q=pestisida",
    actionLabel: "Lihat detail & harga bundle",
    supportingLinks: [
      { href: "/solusi/gejala/daun-berlubang", label: "Gejala daun berlubang" },
      { href: "/artikel?topik=hama-penyakit", label: "Edukasi hama & penyakit" },
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
        "Harga paket ini masih estimasi awal. Komposisi alat aplikasi masih bisa disesuaikan saat penawaran final disiapkan.",
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
      "Menjaga momentum saat pengunjung datang dari masalah nyata, bukan dari daftar produk.",
      "Menjadikan proteksi dasar sebagai paket yang bisa langsung dibeli atau dibahas lewat WhatsApp.",
      "Membantu kebutuhan lapangan terasa lebih lengkap lewat alat aplikasi dan proteksi pendukung yang relevan.",
    ],
    proofSignals: [
      {
        title: "Berangkat dari kebutuhan lapangan",
        body: "Bundle ini dimulai dari gejala yang sering muncul di lapangan, lalu dirapikan menjadi paket resmi yang lebih mudah dipertimbangkan.",
      },
      {
        title: "Mudah dibahas bersama toko",
        body: "Tim toko dapat memakai paket ini sebagai titik awal rekomendasi, lalu menyesuaikannya bila ada kondisi lapangan yang perlu diperhatikan.",
      },
      {
        title: "Paket terasa lebih lengkap",
        body: "Sprayer dan proteksi pendukung dimasukkan ke dalam satu penawaran agar kebutuhan dasar tidak tercecer saat pembeli mulai memilih.",
      },
    ],
  },
  {
    ops: {
      status: "active",
      priority: 90,
    },
    sku: "BDL-WRG-COM-001",
    slug: BUNDLE_REFERENCE_SLUGS.kioskRestock,
    kind: "commodity",
    title: "Paket kebutuhan toko",
    description:
      "Paket terarah untuk toko pertanian dan pembeli rutin yang ingin mengisi ulang stok inti dengan penawaran yang lebih rapi daripada belanja satu-satu.",
    summary:
      "Paket ini dirancang agar mudah diulang. SKU, jumlah, dan harga paket sudah disusun rapi supaya pembelian berikutnya lebih cepat.",
    audience:
      "Toko pertanian, pembeli rutin, dan pengunjung yang ingin membuat repeat order terasa lebih singkat.",
    catalogHref: "/produk?q=kebutuhan toko",
    actionLabel: "Lihat detail & harga bundle",
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
        notes: "Dikunci 2 sak agar lebih dekat dengan pola restock toko kecil-menengah.",
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
        notes: "Masuk sebagai item pelengkap yang masih masuk akal untuk toko.",
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
        "Harga paket ini masih estimasi awal. Tim Wiragro masih menyesuaikan skema harga publik dan harga paket untuk pembelian rutin.",
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
      "Membuat pembelian rutin terasa lebih rapi dan mudah direncanakan.",
      "Menjadi paket yang lebih mudah diulang daripada pencarian katalog manual.",
      "Membuka jalur B2B ringan untuk kebutuhan volume lebih besar atau pembelian rutin.",
    ],
    proofSignals: [
      {
        title: "Dirancang untuk repeatability",
        body: "Qty bundle dikunci pada pola restock yang masuk akal agar pembelian berikutnya bisa diproses lebih cepat.",
      },
      {
        title: "Lebih konkret untuk kebutuhan toko",
        body: "Daftar kebutuhan tidak perlu disusun dari nol setiap kali. Paket ini sudah punya SKU bundle dan komposisi yang konsisten.",
      },
      {
        title: "Mudah dibawa ke B2B",
        body: "Jika kebutuhan volumenya lebih besar, paket yang sama dapat menjadi titik awal percakapan B2B dan penawaran awal.",
      },
    ],
  },
  {
    ops: {
      status: "active",
      priority: 85,
    },
    sku: "BDL-WRG-COM-002",
    slug: BUNDLE_REFERENCE_SLUGS.riceStarter,
    kind: "commodity",
    title: "Bundle awal tanam padi",
    description:
      "Paket komoditas padi dengan SKU tetap untuk fase awal, sehingga kebutuhan padi tidak berhenti di halaman edukasi tanpa penawaran yang jelas.",
    summary:
      "Paket ini menutup jarak dari komoditas ke pembelian. Ada benih inti, pupuk dasar, dan penguat fase awal yang sudah disusun sebagai paket resmi.",
    audience:
      "Petani padi, toko pertanian area sawah, dan pengunjung yang ingin memulai fase awal padi dengan komposisi yang lebih jelas.",
    catalogHref: "/produk?q=benih padi",
    actionLabel: "Lihat detail & harga bundle",
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
        notes: "Komponen pemupukan awal yang mudah dipahami pembeli padi.",
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
        "Komposisi akhir paket padi ini masih bisa disesuaikan per area. Harga dan SKU final akan mengikuti paket yang sudah dikonfirmasi tim Wiragro.",
    },
    relatedArticleSlugs: [ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    relatedSolutionSlugs: [SOLUTION_REFERENCE_SLUGS.slowGrowth],
    relatedCommoditySlugs: [COMMODITY_REFERENCE_SLUGS.rice],
    outcomes: [
      "Menyederhanakan pembelian awal untuk komoditas padi.",
      "Menjadikan halaman komoditas punya offer resmi, bukan hanya jalur navigasi.",
      "Mudah dipakai untuk kebutuhan musiman atau pembelian komoditas yang lebih terarah.",
    ],
    proofSignals: [
      {
        title: "Komoditas punya penawaran resmi",
        body: "Pembeli padi sering datang dari konteks budidaya, bukan dari nama produk. Bundle ini menutup jarak itu dengan penawaran yang lebih konkret.",
      },
      {
        title: "Harga bundle membantu keputusan",
        body: "Saat pembeli melihat total normal versus harga bundle, keputusan beli terasa lebih cepat dibanding membaca banyak PDP satu per satu.",
      },
      {
        title: "Masih fleksibel untuk penyesuaian area",
        body: "Jika SKU final untuk padi berbeda antar area, paket ini masih bisa disesuaikan tanpa mengubah alur halaman untuk pembeli.",
      },
    ],
  },
  {
    ops: {
      status: "active",
      priority: 80,
    },
    sku: "BDL-WRG-COM-003",
    slug: BUNDLE_REFERENCE_SLUGS.chiliTrack,
    kind: "commodity",
    title: "Bundle jalur cabai",
    description:
      "Paket komoditas cabai dengan kombinasi benih, proteksi, dan booster generatif yang disusun sebagai penawaran resmi untuk kebutuhan cabai.",
    summary:
      "Kebutuhan cabai sering datang dari banyak arah. Paket ini merapikannya menjadi satu penawaran yang lebih mudah dipahami dengan SKU tetap, harga paket, dan opsi beli langsung.",
    audience:
      "Petani cabai, pelaku hortikultura intensif, dan pembeli yang datang dari gejala atau kebutuhan generatif.",
    catalogHref: "/produk?q=benih cabai",
    actionLabel: "Lihat detail & harga bundle",
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
        notes: "Titik awal utama untuk pengunjung yang benar-benar mulai dari cabai.",
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
        notes: "Penting untuk kebutuhan cabai di musim lembap atau saat gejala mulai muncul.",
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
        "Harga paket cabai ini masih estimasi awal sambil menunggu finalisasi tim Wiragro. Komposisi utamanya sudah disusun stabil agar mudah diajukan atau direvisi.",
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
      "Menyatukan kebutuhan cabai yang biasanya tercecer di artikel, solusi, dan katalog.",
      "Membuat bundle cabai punya CTA pembelian yang lebih eksplisit dan mudah dihitung nilainya.",
      "Membantu kebutuhan cabai dijelaskan dengan bahasa komoditas yang lebih dekat dengan pembeli.",
    ],
    proofSignals: [
      {
        title: "Cabai sekarang punya offer konkret",
        body: "Paket ini memberi bentuk yang lebih jelas pada kebutuhan cabai: bukan cuma edukasi, tetapi penawaran yang siap dibeli atau dibawa ke WhatsApp.",
      },
      {
        title: "Masih terhubung ke jalur solusi",
        body: "Pengunjung tetap bisa memeriksa gejala dan fase, tetapi saat sudah siap membeli mereka tidak perlu merakit keranjang panjang lagi.",
      },
      {
        title: "Cocok untuk seasonality",
        body: "Paket komoditas seperti ini lebih mudah dipakai untuk program musiman, tindak lanjut WhatsApp, atau kebutuhan cabai yang sedang meningkat.",
      },
    ],
  },
] satisfies GrowthBundleSourceDefinition[];
