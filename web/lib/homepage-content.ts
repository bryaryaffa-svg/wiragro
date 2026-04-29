import { WIRAGRO_CATEGORY_ASSETS, WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

export type HomeTrustBadge = {
  icon: "distributor" | "education" | "product" | "solution";
  label: string;
  tone?: "accent" | "default" | "success";
};

export type HomeIconCard = {
  actionLabel: string;
  description: string;
  href: string;
  imageFit?: "contain" | "cover";
  icon:
    | "chili"
    | "corn"
    | "fruit-drop"
    | "fungus"
    | "grid"
    | "horti"
    | "nutrition"
    | "onion"
    | "palm"
    | "pest"
    | "rice"
    | "root"
    | "stunted"
    | "tomato"
    | "weed"
    | "yellow-leaf";
  thumbnail?: string;
  title: string;
};

export type HomeVideoCard = {
  category: string;
  description: string;
  duration?: string;
  href: string;
  thumbnail: string;
  title: string;
};

export type HomeSeadanceVideoSlot = {
  category: string;
  ctaLabel: string;
  description: string;
  href: string;
  poster: string;
  title: string;
  videoSrc: string | null;
};

export type HomeHeroMetric = {
  description: string;
  icon:
    | "ai"
    | "article"
    | "distributor"
    | "education"
    | "product"
    | "solution"
    | "track";
  title: string;
};

export type HomePartnerBenefit = {
  description: string;
  icon: "article" | "distributor" | "education" | "product" | "solution" | "track";
  title: string;
};

export type HomeTrustStripItem = {
  description: string;
  icon: "ai" | "article" | "distributor" | "education" | "product" | "solution" | "track";
  title: string;
};

export const HOME_HERO_BADGES: HomeTrustBadge[] = [
  { icon: "product", label: "Produk pertanian lengkap", tone: "success" },
  { icon: "education", label: "Edukasi praktis" },
  { icon: "solution", label: "Belanja langsung" },
  { icon: "distributor", label: "Untuk petani, toko, dan distributor", tone: "accent" },
];

export const HOME_PROBLEM_CARDS: HomeIconCard[] = [
  {
    actionLabel: "Cari solusi",
    description: "Periksa nutrisi, akar, dan pola air sebelum memilih produk.",
    href: "/solusi?masalah=daun-kuning",
    imageFit: "contain",
    icon: "yellow-leaf",
    thumbnail: WIRAGRO_ICON_ASSETS.yellowLeaf,
    title: "Daun kuning",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Bedakan hama dan penyakit sebelum memilih proteksi.",
    href: "/solusi?masalah=hama",
    imageFit: "contain",
    icon: "pest",
    thumbnail: WIRAGRO_ICON_ASSETS.pest,
    title: "Hama",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cek fase tanam, kondisi akar, dan dukungan nutrisi dasarnya.",
    href: "/solusi?masalah=tanaman-kerdil",
    imageFit: "contain",
    icon: "stunted",
    thumbnail: WIRAGRO_ICON_ASSETS.stunted,
    title: "Tanaman kerdil",
  },
  {
    actionLabel: "Lihat langkah",
    description: "Evaluasi stres fase generatif sebelum buru-buru menambah booster.",
    href: "/solusi?masalah=buah-rontok",
    imageFit: "contain",
    icon: "fruit-drop",
    thumbnail: WIRAGRO_ICON_ASSETS.fruitDrop,
    title: "Buah rontok",
  },
  {
    actionLabel: "Cari solusi",
    description: "Kenali pola bercak sebelum masuk ke produk proteksi.",
    href: "/solusi?masalah=bercak-daun",
    imageFit: "contain",
    icon: "fungus",
    thumbnail: WIRAGRO_ICON_ASSETS.fungus,
    title: "Jamur daun",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Masuk dari masalah lapang yang mengganggu pertumbuhan utama tanaman.",
    href: "/solusi?masalah=gulma",
    imageFit: "contain",
    icon: "weed",
    thumbnail: WIRAGRO_ICON_ASSETS.weed,
    title: "Gulma",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cocokkan kondisi media, drainase, dan tanda busuk akar.",
    href: "/solusi?masalah=akar-busuk",
    imageFit: "contain",
    icon: "root",
    thumbnail: WIRAGRO_ICON_ASSETS.root,
    title: "Akar busuk",
  },
  {
    actionLabel: "Cari solusi",
    description: "Pelajari fondasi pemupukan dan ritme aplikasi sebelum belanja.",
    href: "/solusi?masalah=pertumbuhan-lambat",
    imageFit: "contain",
    icon: "nutrition",
    thumbnail: WIRAGRO_ICON_ASSETS.nutrition,
    title: "Nutrisi kurang maksimal",
  },
];

export const HOME_CROP_CARDS: HomeIconCard[] = [
  {
    actionLabel: "Pilih padi",
    description: "Solusi sawah dan tanaman pangan dari fase awal sampai panen.",
    href: "/solusi?tanaman=padi",
    imageFit: "contain",
    icon: "rice",
    thumbnail: WIRAGRO_ICON_ASSETS.rice,
    title: "Padi",
  },
  {
    actionLabel: "Pilih cabai",
    description: "Komoditas intensif dengan kebutuhan solusi dan edukasi yang berjalan beriringan.",
    href: "/solusi?tanaman=cabai",
    imageFit: "contain",
    icon: "chili",
    thumbnail: WIRAGRO_ICON_ASSETS.chili,
    title: "Cabai",
  },
  {
    actionLabel: "Pilih jagung",
    description: "Mulai dari benih, nutrisi awal, sampai ritme fase vegetatif.",
    href: "/solusi?tanaman=jagung",
    imageFit: "contain",
    icon: "corn",
    thumbnail: WIRAGRO_ICON_ASSETS.corn,
    title: "Jagung",
  },
  {
    actionLabel: "Pilih tomat",
    description: "Arahan awal untuk hortikultura yang sensitif pada daun dan fase generatif.",
    href: "/solusi?tanaman=tomat",
    imageFit: "contain",
    icon: "tomato",
    thumbnail: WIRAGRO_ICON_ASSETS.tomato,
    title: "Tomat",
  },
  {
    actionLabel: "Pilih bawang",
    description: "Masuk dari gejala umum dan keputusan input yang lebih terarah.",
    href: "/solusi?tanaman=bawang",
    imageFit: "contain",
    icon: "onion",
    thumbnail: WIRAGRO_ICON_ASSETS.onion,
    title: "Bawang",
  },
  {
    actionLabel: "Pilih sawit",
    description: "Buka jalur problem-solving untuk komoditas skala kebun dan kebutuhan mitra.",
    href: "/solusi?tanaman=sawit",
    imageFit: "contain",
    icon: "palm",
    thumbnail: WIRAGRO_ICON_ASSETS.palm,
    title: "Sawit",
  },
  {
    actionLabel: "Pilih horti",
    description: "Fokus pada fase daun, bunga, buah, dan kualitas hasil.",
    href: "/solusi?tanaman=hortikultura",
    imageFit: "contain",
    icon: "horti",
    thumbnail: WIRAGRO_ICON_ASSETS.horti,
    title: "Hortikultura",
  },
  {
    actionLabel: "Lihat semua",
    description: "Kalau komoditas Anda belum ada, mulai dari pencarian gejala atau kebutuhan.",
    href: "/solusi",
    imageFit: "contain",
    icon: "grid",
    thumbnail: WIRAGRO_ICON_ASSETS.grid,
    title: "Lainnya",
  },
];

export const HOME_VIDEO_CARDS: HomeVideoCard[] = [
  {
    category: "Studi kasus lapangan",
    description: "Masuk dari gejala, cek akar dan pola air, lalu pilih tindakan yang lebih masuk akal.",
    duration: "05:24",
    href: "/artikel/daun-menguning-dan-nutrisi-awal",
    thumbnail: WIRAGRO_CATEGORY_ASSETS.aiDiagnosis,
    title: "Membaca daun kuning sebelum memilih input koreksi",
  },
  {
    category: "Review produk",
    description: "Ringkasan praktis agar pembelian booster tidak terasa terlalu cepat.",
    duration: "06:31",
    href: "/artikel/panduan-memilih-pupuk",
    thumbnail: WIRAGRO_CATEGORY_ASSETS.nutritionBooster,
    title: "Kapan nutrisi generatif benar-benar dibutuhkan tanaman",
  },
  {
    category: "Edukasi umum",
    description: "Panduan fase tanam yang membantu user paham sebelum turun ke katalog.",
    duration: "07:12",
    href: "/artikel/fase-tanam-cabai-dari-semai-sampai-berbuah",
    thumbnail: WIRAGRO_CATEGORY_ASSETS.education,
    title: "Ritme budidaya cabai dari semai sampai fase berbuah",
  },
];

export const HOME_SEADANCE_VIDEO_SLOT: HomeSeadanceVideoSlot = {
  category: "Video Seadance",
  ctaLabel: "Lihat panduan sementara",
  description:
    "Materi visual berikutnya akan menampilkan rangkuman lapangan yang lebih hidup. Sementara itu, panduan artikel tetap bisa dipakai untuk membaca konteks tanaman.",
  href: "/artikel",
  poster: WIRAGRO_CATEGORY_ASSETS.educationAlt,
  title: "Video lapangan Wiragro segera hadir",
  videoSrc: null,
};

export const HOME_PRODUCT_TOPIC_CHIPS = [
  "Nutrisi tanaman",
  "Pestisida",
  "Benih",
  "Alat pertanian",
];

export const HOME_AI_CHAT_PROMPTS = [
  "Daun padi saya menguning, mulai dari mana?",
  "Pupuk apa yang cocok untuk fase generatif cabai?",
  "Apa beda gejala hama dan penyakit daun?",
];

export const HOME_HERO_METRICS: HomeHeroMetric[] = [
  {
    description: "Petani terbantu",
    icon: "solution",
    title: "50.000+",
  },
  {
    description: "Produk original berkualitas",
    icon: "product",
    title: "Produk original",
  },
  {
    description: "Ahli & AI siap membantu",
    icon: "ai",
    title: "Ahli & AI",
  },
  {
    description: "Data dan transaksi terlindungi",
    icon: "track",
    title: "Aman & terpercaya",
  },
];

export const HOME_PARTNER_BENEFITS: HomePartnerBenefit[] = [
  {
    description: "Untuk toko, mitra, dan belanja rutin",
    icon: "product",
    title: "Harga akun usaha",
  },
  {
    description: "Panduan kampanye dan solusi lapangan",
    icon: "article",
    title: "Materi edukasi",
  },
  {
    description: "Bisa lanjut ke tim saat kebutuhan membesar",
    icon: "education",
    title: "Pelatihan & bantuan",
  },
  {
    description: "Pantau order dan koordinasi lebih rapi",
    icon: "track",
    title: "Sistem order mudah",
  },
];

export const HOME_TRUST_STRIP: HomeTrustStripItem[] = [
  {
    description: "Dipakai di berbagai kebutuhan lapangan",
    icon: "solution",
    title: "Terpercaya oleh petani Indonesia",
  },
  {
    description: "Panduan dan rekomendasi lebih mudah dipahami",
    icon: "education",
    title: "Konten dibuat oleh ahli pertanian",
  },
  {
    description: "Solusi, produk, dan edukasi terus disesuaikan",
    icon: "track",
    title: "Update setiap hari",
  },
  {
    description: "Akses akun dan data lebih terjaga",
    icon: "distributor",
    title: "Aman & terlindungi",
  },
];

export function buildWhatsAppConsultationUrl(
  phone?: string | null,
  storeName = "Wiragro",
) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  const formatted = normalized.startsWith("0")
    ? `62${normalized.slice(1)}`
    : normalized;

  const message = encodeURIComponent(
    `Halo ${storeName}, saya ingin konsultasi tentang kebutuhan tanaman dan produk yang cocok.`,
  );

  return `https://wa.me/${formatted}?text=${message}`;
}
