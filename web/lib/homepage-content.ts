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
    imageFit: "cover",
    icon: "yellow-leaf",
    thumbnail: "/category-photos/nutrisi-perangsang.png",
    title: "Daun kuning",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Bedakan hama dan penyakit sebelum memilih proteksi.",
    href: "/solusi?masalah=hama",
    imageFit: "cover",
    icon: "pest",
    thumbnail: "/category-photos/pestisida.png",
    title: "Hama",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cek fase tanam, kondisi akar, dan dukungan nutrisi dasarnya.",
    href: "/solusi?masalah=tanaman-kerdil",
    imageFit: "cover",
    icon: "stunted",
    thumbnail: "/category-photos/persemaian.png",
    title: "Tanaman kerdil",
  },
  {
    actionLabel: "Lihat langkah",
    description: "Evaluasi stres fase generatif sebelum buru-buru menambah booster.",
    href: "/solusi?masalah=buah-rontok",
    icon: "fruit-drop",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    title: "Buah rontok",
  },
  {
    actionLabel: "Cari solusi",
    description: "Kenali pola bercak sebelum masuk ke produk proteksi.",
    href: "/solusi?masalah=bercak-daun",
    imageFit: "cover",
    icon: "fungus",
    thumbnail: "/category-photos/pestisida.png",
    title: "Jamur daun",
  },
  {
    actionLabel: "Lihat arahan",
    description: "Masuk dari masalah lapang yang mengganggu pertumbuhan utama tanaman.",
    href: "/solusi?masalah=gulma",
    icon: "weed",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    title: "Gulma",
  },
  {
    actionLabel: "Buka solusi",
    description: "Cocokkan kondisi media, drainase, dan tanda busuk akar.",
    href: "/solusi?masalah=akar-busuk",
    imageFit: "cover",
    icon: "root",
    thumbnail: "/category-photos/media-tanam.png",
    title: "Akar busuk",
  },
  {
    actionLabel: "Cari solusi",
    description: "Pelajari fondasi pemupukan dan ritme aplikasi sebelum belanja.",
    href: "/solusi?masalah=pertumbuhan-lambat",
    imageFit: "cover",
    icon: "nutrition",
    thumbnail: "/category-photos/pupuk.png",
    title: "Nutrisi kurang maksimal",
  },
];

export const HOME_CROP_CARDS: HomeIconCard[] = [
  {
    actionLabel: "Pilih padi",
    description: "Solusi sawah dan tanaman pangan dari fase awal sampai panen.",
    href: "/solusi?tanaman=padi",
    icon: "rice",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    title: "Padi",
  },
  {
    actionLabel: "Pilih cabai",
    description: "Komoditas intensif dengan kebutuhan solusi dan edukasi yang berjalan beriringan.",
    href: "/solusi?tanaman=cabai",
    icon: "chili",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    title: "Cabai",
  },
  {
    actionLabel: "Pilih jagung",
    description: "Mulai dari benih, nutrisi awal, sampai ritme fase vegetatif.",
    href: "/solusi?tanaman=jagung",
    icon: "corn",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    title: "Jagung",
  },
  {
    actionLabel: "Pilih tomat",
    description: "Arahan awal untuk hortikultura yang sensitif pada daun dan fase generatif.",
    href: "/solusi?tanaman=tomat",
    icon: "tomato",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_semak_transparent.png",
    title: "Tomat",
  },
  {
    actionLabel: "Pilih bawang",
    description: "Masuk dari gejala umum dan keputusan input yang lebih terarah.",
    href: "/solusi?tanaman=bawang",
    icon: "onion",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_tunas_kecil_transparent.png",
    title: "Bawang",
  },
  {
    actionLabel: "Pilih sawit",
    description: "Buka jalur problem-solving untuk komoditas skala kebun dan kebutuhan mitra.",
    href: "/solusi?tanaman=sawit",
    icon: "palm",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_tanaman_tinggi_transparent.png",
    title: "Sawit",
  },
  {
    actionLabel: "Pilih horti",
    description: "Fokus pada fase daun, bunga, buah, dan kualitas hasil.",
    href: "/solusi?tanaman=hortikultura",
    icon: "horti",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_gerobak_tanam_transparent.png",
    title: "Hortikultura",
  },
  {
    actionLabel: "Lihat semua",
    description: "Kalau komoditas Anda belum ada, mulai dari pencarian gejala atau kebutuhan.",
    href: "/solusi",
    icon: "grid",
    thumbnail: "/wiragro-illustrations/wiragro_dekor_bukit_transparent.png",
    title: "Lainnya",
  },
];

export const HOME_VIDEO_CARDS: HomeVideoCard[] = [
  {
    category: "Studi kasus lapangan",
    description: "Masuk dari gejala, cek akar dan pola air, lalu pilih tindakan yang lebih masuk akal.",
    duration: "05:24",
    href: "/artikel/daun-menguning-dan-nutrisi-awal",
    thumbnail: "/illustrations/agri-field-sunrise.svg",
    title: "Membaca daun kuning sebelum memilih input koreksi",
  },
  {
    category: "Review produk",
    description: "Ringkasan praktis agar pembelian booster tidak terasa terlalu cepat.",
    duration: "06:31",
    href: "/artikel/panduan-memilih-pupuk",
    thumbnail: "/category-photos/nutrisi-perangsang.png",
    title: "Kapan nutrisi generatif benar-benar dibutuhkan tanaman",
  },
  {
    category: "Edukasi umum",
    description: "Panduan fase tanam yang membantu user paham sebelum turun ke katalog.",
    duration: "07:12",
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
