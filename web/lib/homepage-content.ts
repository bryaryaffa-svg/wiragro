export type HomeTrustBadge = {
  icon: "distributor" | "education" | "product" | "solution";
  label: string;
  tone?: "accent" | "default" | "success";
};

export type HomeIconCard = {
  actionLabel: string;
  description: string;
  href: string;
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
  title: string;
};

export type HomeVideoCard = {
  category: string;
  description: string;
  href: string;
  thumbnail: string;
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
    icon: "yellow-leaf",
    title: "Daun kuning",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Pisahkan gejala hama dan penyakit agar tindakan awal lebih tepat.",
    href: "/solusi?masalah=hama",
    icon: "pest",
    title: "Hama menyerang",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cek fase tanam, kondisi akar, dan dukungan nutrisi dasarnya.",
    href: "/solusi?masalah=tanaman-kerdil",
    icon: "stunted",
    title: "Tanaman kerdil",
  },
  {
    actionLabel: "Lihat langkah",
    description: "Evaluasi stres fase generatif sebelum buru-buru menambah booster.",
    href: "/solusi?masalah=buah-rontok",
    icon: "fruit-drop",
    title: "Buah rontok",
  },
  {
    actionLabel: "Cari solusi",
    description: "Bantu bedakan pola penyakit daun dan kebutuhan proteksi awal.",
    href: "/solusi?masalah=bercak-daun",
    icon: "fungus",
    title: "Jamur / bercak daun",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Masuk dari masalah lapang yang mengganggu pertumbuhan utama tanaman.",
    href: "/solusi?masalah=gulma",
    icon: "weed",
    title: "Gulma",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cocokkan kondisi media, drainase, dan tanda busuk akar.",
    href: "/solusi?masalah=akar-busuk",
    icon: "root",
    title: "Akar busuk",
  },
  {
    actionLabel: "Cari solusi",
    description: "Pelajari fondasi pemupukan dan ritme aplikasi sebelum belanja.",
    href: "/solusi?masalah=pertumbuhan-lambat",
    icon: "nutrition",
    title: "Nutrisi kurang maksimal",
  },
];

export const HOME_CROP_CARDS: HomeIconCard[] = [
  {
    actionLabel: "Pilih padi",
    description: "Solusi sawah dan tanaman pangan dari fase awal sampai panen.",
    href: "/solusi?tanaman=padi",
    icon: "rice",
    title: "Padi",
  },
  {
    actionLabel: "Pilih cabai",
    description: "Komoditas intensif dengan kebutuhan solusi dan edukasi yang berjalan beriringan.",
    href: "/solusi?tanaman=cabai",
    icon: "chili",
    title: "Cabai",
  },
  {
    actionLabel: "Pilih jagung",
    description: "Mulai dari benih, nutrisi awal, sampai ritme fase vegetatif.",
    href: "/solusi?tanaman=jagung",
    icon: "corn",
    title: "Jagung",
  },
  {
    actionLabel: "Pilih tomat",
    description: "Arahan awal untuk hortikultura yang sensitif pada daun dan fase generatif.",
    href: "/solusi?tanaman=tomat",
    icon: "tomato",
    title: "Tomat",
  },
  {
    actionLabel: "Pilih bawang",
    description: "Masuk dari gejala umum dan keputusan input yang lebih terarah.",
    href: "/solusi?tanaman=bawang",
    icon: "onion",
    title: "Bawang",
  },
  {
    actionLabel: "Pilih sawit",
    description: "Buka jalur problem-solving untuk komoditas skala kebun dan kebutuhan mitra.",
    href: "/solusi?tanaman=sawit",
    icon: "palm",
    title: "Sawit",
  },
  {
    actionLabel: "Pilih horti",
    description: "Fokus pada fase daun, bunga, buah, dan kualitas hasil.",
    href: "/solusi?tanaman=hortikultura",
    icon: "horti",
    title: "Hortikultura",
  },
  {
    actionLabel: "Lihat semua",
    description: "Kalau komoditas Anda belum ada, mulai dari pencarian gejala atau kebutuhan.",
    href: "/solusi",
    icon: "grid",
    title: "Lainnya",
  },
];

export const HOME_VIDEO_CARDS: HomeVideoCard[] = [
  {
    category: "Studi kasus lapangan",
    description: "Masuk dari gejala, cek akar dan pola air, lalu pilih tindakan yang lebih masuk akal.",
    href: "/artikel/daun-menguning-dan-nutrisi-awal",
    thumbnail: "/illustrations/agri-field-sunrise.svg",
    title: "Membaca daun kuning sebelum memilih input koreksi",
  },
  {
    category: "Review produk",
    description: "Ringkasan praktis agar pembelian booster tidak terasa terlalu cepat.",
    href: "/artikel/panduan-memilih-pupuk",
    thumbnail: "/category-photos/nutrisi-perangsang.png",
    title: "Kapan nutrisi generatif benar-benar dibutuhkan tanaman",
  },
  {
    category: "Edukasi umum",
    description: "Panduan fase tanam yang membantu user paham sebelum turun ke katalog.",
    href: "/artikel/fase-tanam-cabai-dari-semai-sampai-berbuah",
    thumbnail: "/illustrations/agri-seedling-lab.svg",
    title: "Ritme budidaya cabai dari semai sampai fase berbuah",
  },
];

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
