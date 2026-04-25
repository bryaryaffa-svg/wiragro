export type CommodityTheme =
  | "rice"
  | "chili"
  | "corn"
  | "leafy"
  | "fruit"
  | "homegarden";

export type CommoditySupportLink = {
  href: string;
  label: string;
};

export type CommodityBundle = {
  kind: "commodity" | "phase" | "problem";
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  supportingLinks?: CommoditySupportLink[];
};

export type CommodityHub = {
  slug: string;
  label: string;
  theme: CommodityTheme;
  description: string;
  summary: string;
  heroBullets: string[];
  articleSlugs: string[];
  solutionSlugs: string[];
  productQueries: string[];
  bundles: CommodityBundle[];
};

const COMMODITY_HUBS: CommodityHub[] = [
  {
    slug: "padi",
    label: "Padi",
    theme: "rice",
    description: "Jalur komoditas untuk sawah dan tanaman pangan yang butuh ritme input lebih rapi.",
    summary:
      "Gunakan hub ini untuk menghubungkan kebutuhan padi ke edukasi, solusi, produk, dan konsultasi tanpa membuat pengunjung berpindah ke banyak jalur yang terpisah.",
    heroBullets: ["Mulai dari fase awal dan nutrisi dasar", "Hubungkan ke gejala pertumbuhan", "Bawa konteks ke produk saat sudah siap"],
    articleSlugs: ["panduan-memilih-pupuk"],
    solutionSlugs: ["pertumbuhan-lambat"],
    productQueries: ["benih padi", "pupuk", "nutrisi tanaman"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle mulai tanam padi",
        description: "Jalur belanja dasar untuk pengunjung yang ingin menyiapkan kebutuhan awal padi tanpa menyusun semuanya dari nol.",
        href: "/belanja/paket/padi-awal-tanam",
        actionLabel: "Buka bundle komoditas",
        supportingLinks: [
          { href: "/belajar/komoditas/padi", label: "Artikel padi" },
          { href: "/solusi/komoditas/padi", label: "Solusi padi" },
        ],
      },
      {
        kind: "phase",
        title: "Bundle fase awal tanam",
        description: "Cocok untuk fase awal saat kebutuhan benih, nutrisi dasar, dan kondisi media atau lahan perlu diseimbangkan.",
        href: "/solusi?fase=awal-tanam&komoditas=padi",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle pertumbuhan lambat",
        description: "Untuk pengunjung yang datang karena tanaman terlihat tertahan dan butuh jalur verifikasi sebelum turun ke produk.",
        href: "/solusi/masalah/pertumbuhan-lambat",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
  {
    slug: "cabai",
    label: "Cabai",
    theme: "chili",
    description: "Komoditas intensif yang paling butuh jembatan rapi antara edukasi, solusi, dan belanja.",
    summary:
      "Cabai sering membuat pengunjung bolak-balik antara gejala lapangan, fase tanam, dan kebutuhan produk. Hub ini menyatukan semuanya dalam satu konteks.",
    heroBullets: ["Baca fase semai sampai generatif", "Masuk dari hama, gejala, atau bunga rontok", "Bandingkan input dan bundle yang paling masuk akal"],
    articleSlugs: [
      "dasar-memilih-benih",
      "pengendalian-hama-awal-yang-lebih-tenang",
      "fase-tanam-cabai-dari-semai-sampai-berbuah",
    ],
    solutionSlugs: [
      "daun-menguning",
      "hama-daun",
      "semai-rebah",
      "bunga-rontok-dan-buah-tidak-jadi",
      "bercak-daun-dan-gejala-jamur",
    ],
    productQueries: ["benih cabai", "pestisida", "booster buah", "media tanam"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle jalur cabai",
        description: "Rangkaian kebutuhan inti cabai untuk pengunjung yang ingin bergerak dari belajar ke belanja dengan lebih percaya diri.",
        href: "/belanja/paket/jalur-cabai",
        actionLabel: "Buka bundle komoditas",
        supportingLinks: [
          { href: "/belajar/komoditas/cabai", label: "Artikel cabai" },
          { href: "/solusi/komoditas/cabai", label: "Solusi cabai" },
        ],
      },
      {
        kind: "phase",
        title: "Bundle fase generatif cabai",
        description: "Untuk kebutuhan pembungaan, pembuahan, dan ritme input saat mulai masuk ke fase hasil.",
        href: "/solusi?fase=generatif&komoditas=cabai",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle hama dan penyakit cabai",
        description: "Bantu pengunjung yang datang dari kerusakan daun, bercak, atau gejala serangan di lapangan.",
        href: "/solusi/masalah/hama-daun",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
  {
    slug: "jagung",
    label: "Jagung",
    theme: "corn",
    description: "Komoditas yang cocok dijembatani dari benih, nutrisi dasar, dan pertumbuhan fase awal.",
    summary:
      "Hub jagung membantu pengunjung yang biasanya datang dari kebutuhan benih atau pertumbuhan awal, lalu diarahkan ke artikel, solusi, dan produk pendukung.",
    heroBullets: ["Mulai dari benih dan fase awal", "Cek pertumbuhan vegetatif", "Lanjutkan ke produk saat kebutuhan sudah lebih jelas"],
    articleSlugs: ["panduan-memilih-pupuk", "dasar-memilih-benih"],
    solutionSlugs: ["pertumbuhan-lambat"],
    productQueries: ["benih jagung", "pupuk", "nutrisi tanaman"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle awal tanam jagung",
        description: "Pintu masuk realistis untuk pengunjung yang ingin menyiapkan jalur awal jagung dengan lebih efisien.",
        href: "/belanja/paket/mulai-tanam",
        actionLabel: "Buka bundle komoditas",
      },
      {
        kind: "phase",
        title: "Bundle vegetatif jagung",
        description: "Untuk kebutuhan pertumbuhan awal sampai vegetatif ketika ritme input ingin dibuat lebih rapi.",
        href: "/solusi?fase=vegetatif&komoditas=jagung",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle pertumbuhan tertahan",
        description: "Bantu pengunjung memeriksa faktor dasar sebelum memutuskan pembelian produk tambahan.",
        href: "/solusi/masalah/pertumbuhan-lambat",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
  {
    slug: "sayuran-daun",
    label: "Sayuran Daun",
    theme: "leafy",
    description: "Komoditas cepat panen yang sensitif pada daun, media, dan ritme nutrisi.",
    summary:
      "Hub sayuran daun menyatukan konteks media, pertumbuhan cepat, gejala daun, dan pilihan produk yang relevan agar pengunjung tidak salah langkah.",
    heroBullets: ["Masuk dari gejala daun", "Pahami media dan fase awal", "Bandingkan nutrisi dan proteksi yang relevan"],
    articleSlugs: [
      "panduan-memilih-pupuk",
      "daun-menguning-dan-nutrisi-awal",
      "pengendalian-hama-awal-yang-lebih-tenang",
    ],
    solutionSlugs: ["daun-menguning", "hama-daun", "semai-rebah", "bercak-daun-dan-gejala-jamur"],
    productQueries: ["benih sayur", "media tanam", "pupuk", "pestisida"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle sayuran daun rumahan",
        description: "Cocok untuk pengunjung yang ingin alur belajar, solusi, dan belanja terasa sederhana tetapi tetap nyambung.",
        href: "/belanja/paket/mulai-tanam",
        actionLabel: "Buka bundle komoditas",
      },
      {
        kind: "phase",
        title: "Bundle semai dan media",
        description: "Untuk fase awal yang sering menentukan performa sayuran daun sejak awal tumbuh.",
        href: "/solusi?fase=persemaian&komoditas=sayuran-daun",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle daun menguning",
        description: "Jalur aman untuk pengunjung yang datang dari gejala daun sebelum membeli input tambahan.",
        href: "/solusi/masalah/daun-menguning",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
  {
    slug: "horti-buah",
    label: "Horti & Buah",
    theme: "fruit",
    description: "Komoditas yang sering menuntut jembatan kuat antara fase generatif, problem lapangan, dan produk pendukung.",
    summary:
      "Gunakan hub ini ketika pengunjung datang dengan masalah pembungaan, pembuahan, atau gejala daun pada tanaman buah dan hortikultura.",
    heroBullets: ["Masuk dari bunga rontok atau buah tidak jadi", "Hubungkan ke nutrisi dan proteksi yang relevan", "Naikkan trust dengan edukasi sebelum jualan"],
    articleSlugs: [
      "pengendalian-hama-awal-yang-lebih-tenang",
      "fase-tanam-cabai-dari-semai-sampai-berbuah",
    ],
    solutionSlugs: ["bunga-rontok-dan-buah-tidak-jadi", "hama-daun", "bercak-daun-dan-gejala-jamur"],
    productQueries: ["booster buah", "fungisida", "pestisida", "nutrisi tanaman"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle horti generatif",
        description: "Rangkaian awal untuk pengunjung yang ingin fokus ke pembungaan, pembuahan, dan kestabilan fase generatif.",
        href: "/belanja/paket/jalur-cabai",
        actionLabel: "Buka bundle komoditas",
      },
      {
        kind: "phase",
        title: "Bundle fase buah",
        description: "Bantu pengunjung menghubungkan kebutuhan fase generatif ke solusi dan produk yang lebih tepat.",
        href: "/solusi?fase=generatif&komoditas=horti-buah",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle bunga rontok",
        description: "Untuk pengunjung yang ingin membaca masalah generatif lebih dulu sebelum membeli booster atau proteksi.",
        href: "/solusi/masalah/bunga-rontok-dan-buah-tidak-jadi",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
  {
    slug: "kebun-rumah",
    label: "Kebun Rumah",
    theme: "homegarden",
    description: "Jalur yang lebih sederhana untuk pengunjung rumahan yang butuh belajar, solusi, dan belanja seperlunya.",
    summary:
      "Hub ini menyederhanakan keputusan untuk pengunjung rumahan: mulai dari fase awal, gejala ringan, sampai pembelian dasar yang tidak berlebihan.",
    heroBullets: ["Belajar tanpa jargon berlebihan", "Masuk dari gejala ringan", "Belanja seperlunya lalu konsultasi bila ragu"],
    articleSlugs: ["dasar-memilih-benih", "daun-menguning-dan-nutrisi-awal"],
    solutionSlugs: ["semai-rebah", "daun-menguning"],
    productQueries: ["polybag", "benih", "media tanam", "pupuk"],
    bundles: [
      {
        kind: "commodity",
        title: "Bundle kebun rumah",
        description: "Cocok untuk pengunjung yang ingin mulai kecil dengan alur yang tetap terasa aman dan mudah dipahami.",
        href: "/belanja/paket/mulai-tanam",
        actionLabel: "Buka bundle komoditas",
      },
      {
        kind: "phase",
        title: "Bundle fase semai rumahan",
        description: "Fokus pada bibit, media, dan ritme awal yang lebih ramah untuk pemula.",
        href: "/solusi?fase=persemaian&komoditas=kebun-rumah",
        actionLabel: "Lihat bundle fase",
      },
      {
        kind: "problem",
        title: "Bundle gejala awal di kebun rumah",
        description: "Bantu pengunjung rumahan memetakan gejala tanpa langsung belanja terlalu banyak produk.",
        href: "/solusi/masalah/daun-menguning",
        actionLabel: "Lihat bundle problem",
      },
    ],
  },
];

export function getAllCommodityHubs() {
  return COMMODITY_HUBS;
}

export function getCommodityHub(slug: string) {
  return COMMODITY_HUBS.find((item) => item.slug === slug) ?? null;
}
