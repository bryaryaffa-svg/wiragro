import type { PathwayCard, PathwaySupportLink } from "@/lib/hybrid-navigation";

export type HomeCommodityCard = {
  theme: "rice" | "chili" | "corn" | "leafy" | "fruit" | "homegarden";
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  supportingLinks?: PathwaySupportLink[];
};

export type HomeTrustPoint = {
  title: string;
  body: string;
  icon: string;
};

export const HOMEPAGE_PROBLEM_CARDS: PathwayCard[] = [
  {
    pillar: "solve",
    eyebrow: "Masalah populer",
    title: "Daun menguning dan tanaman terlihat lemah.",
    description:
      "Mulai dari pemeriksaan nutrisi, akar, dan pola air sebelum buru-buru membeli produk yang belum tentu tepat.",
    href: "/solusi/masalah/daun-menguning",
    actionLabel: "Cari alur solusi",
    bullets: ["Cek nutrisi dasar", "Baca gejala akar", "Bandingkan solusi awal"],
    supportingLinks: [
      { href: "/produk?q=pupuk", label: "Lihat pupuk" },
      { href: "/belajar", label: "Masuk ke Edukasi" },
    ],
  },
  {
    pillar: "solve",
    eyebrow: "Masalah populer",
    title: "Hama mulai menyerang dan daun rusak.",
    description:
      "Arahkan pengunjung untuk mengenali gejala lebih dulu, lalu baru pertimbangkan proteksi yang paling relevan untuk kondisi lapangan.",
    href: "/solusi/masalah/hama-daun",
    actionLabel: "Lihat langkah awal",
    bullets: ["Kenali jenis serangan", "Pisahkan hama vs penyakit", "Pilih proteksi yang masuk akal"],
    supportingLinks: [
      { href: "/produk?q=pestisida", label: "Produk proteksi" },
      { href: "/kontak", label: "Tanya tim" },
    ],
  },
  {
    pillar: "solve",
    eyebrow: "Masalah populer",
    title: "Pertumbuhan lambat, bunga rontok, atau buah tidak jadi.",
    description:
      "Masalah fase pertumbuhan sering butuh kombinasi edukasi, evaluasi lapangan, dan produk pendukung yang berbeda.",
    href: "/solusi/masalah/bunga-rontok-dan-buah-tidak-jadi",
    actionLabel: "Buka Cari Solusi",
    bullets: ["Cek fase tanam", "Nilai kebutuhan booster", "Masuk ke rekomendasi produk"],
    supportingLinks: [
      { href: "/produk?q=nutrisi", label: "Cari nutrisi" },
      { href: "/artikel", label: "Baca insight" },
    ],
  },
];

export const HOMEPAGE_COMMODITY_CARDS: HomeCommodityCard[] = [
  {
    theme: "rice",
    eyebrow: "Komoditas populer",
    title: "Padi",
    description: "Benih, pupuk dasar, dan proteksi fase awal untuk kebutuhan sawah.",
    href: "/komoditas/padi",
    actionLabel: "Mulai dari solusi padi",
    supportingLinks: [
      { href: "/produk?q=benih padi", label: "Benih padi" },
      { href: "/produk?q=pupuk", label: "Pupuk dasar" },
    ],
  },
  {
    theme: "chili",
    eyebrow: "Komoditas populer",
    title: "Cabai",
    description: "Komoditas intensif yang sering butuh learning dan problem-solving berjalan beriringan.",
    href: "/komoditas/cabai",
    actionLabel: "Cari solusi cabai",
    supportingLinks: [
      { href: "/produk?q=benih cabai", label: "Benih cabai" },
      { href: "/produk?q=pestisida", label: "Proteksi" },
    ],
  },
  {
    theme: "corn",
    eyebrow: "Komoditas populer",
    title: "Jagung",
    description: "Masuk dari kebutuhan benih, nutrisi awal, dan ritme aplikasi yang lebih terarah.",
    href: "/komoditas/jagung",
    actionLabel: "Edukasi untuk jagung",
    supportingLinks: [
      { href: "/produk?q=benih jagung", label: "Benih jagung" },
      { href: "/produk?q=nutrisi", label: "Nutrisi" },
    ],
  },
  {
    theme: "leafy",
    eyebrow: "Komoditas populer",
    title: "Sayuran daun",
    description: "Cepat panen, sensitif masalah daun, dan butuh keputusan input yang efisien.",
    href: "/komoditas/sayuran-daun",
    actionLabel: "Mulai belajar",
    supportingLinks: [
      { href: "/produk?q=benih sayur", label: "Benih sayur" },
      { href: "/produk?q=media tanam", label: "Media tanam" },
    ],
  },
  {
    theme: "fruit",
    eyebrow: "Komoditas populer",
    title: "Buah dan horti",
    description: "Masalah pembungaan, pembuahan, dan pemulihan tanaman perlu jalur yang lebih jelas.",
    href: "/komoditas/horti-buah",
    actionLabel: "Cari solusi horti",
    supportingLinks: [
      { href: "/produk?q=booster buah", label: "Booster buah" },
      { href: "/produk?q=fungisida", label: "Fungisida" },
    ],
  },
  {
    theme: "homegarden",
    eyebrow: "Komoditas populer",
    title: "Kebun rumah",
    description: "Untuk Anda yang ingin mulai sederhana: belajar, pilih input dasar, lalu belanja seperlunya.",
    href: "/komoditas/kebun-rumah",
    actionLabel: "Belanja kebutuhan awal",
    supportingLinks: [
      { href: "/produk?q=polybag", label: "Polybag" },
      { href: "/produk?q=benih", label: "Benih" },
    ],
  },
];

export const HOMEPAGE_BUNDLE_CARDS: PathwayCard[] = [
  {
    pillar: "shop",
    eyebrow: "Bundling",
    title: "Paket mulai tanam",
    description:
      "Jalur cepat untuk pengguna yang baru mulai dan ingin menyiapkan kebutuhan awal tanpa menyusun item satu per satu.",
    href: "/belanja/paket/mulai-tanam",
    actionLabel: "Lihat kebutuhan awal",
    bullets: ["Benih", "Media tanam", "Nutrisi tahap awal"],
    supportingLinks: [
      { href: "/belajar", label: "Pelajari dulu" },
      { href: "/belanja", label: "Masuk ke Belanja" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Bundling",
    title: "Paket proteksi dasar",
    description:
      "Untuk pengguna yang sudah melihat gejala dan ingin membandingkan proteksi serta alat aplikasi yang relevan.",
    href: "/belanja/paket/proteksi-dasar",
    actionLabel: "Lihat produk proteksi",
    bullets: ["Proteksi hama", "Proteksi penyakit", "Sprayer dan alat aplikasi"],
    supportingLinks: [
      { href: "/solusi", label: "Mulai dari gejala" },
      { href: "/kontak", label: "Konsultasi tim" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Bundling",
    title: "Paket belanja kios",
    description:
      "Untuk kios atau pembeli rutin yang ingin belanja lebih efisien, dari input utama sampai pelengkap operasional.",
    href: "/belanja/paket/belanja-kios",
    actionLabel: "Lihat kebutuhan kios",
    bullets: ["Produk inti", "Pelengkap operasional", "Belanja lebih tertata"],
    supportingLinks: [
      { href: "/produk", label: "Jelajahi produk" },
      { href: "/b2b", label: "B2B inquiry" },
    ],
  },
];

export const HOMEPAGE_TRUST_POINTS: HomeTrustPoint[] = [
  {
    title: "Produk aktif lebih mudah dipindai",
    body: "Katalog, harga, dan status stok tampil lebih jelas agar pembeli tidak menebak-nebak sebelum checkout.",
    icon: "/wiragro-illustrations/wiragro_feature_produk_berkualitas_transparent.png",
  },
  {
    title: "Masalah lapangan punya jalur tersendiri",
    body: "Homepage tidak lagi memaksa semua pengunjung langsung belanja ketika sebenarnya mereka datang dengan masalah tertentu.",
    icon: "/wiragro-illustrations/wiragro_feature_layanan_terpercaya_transparent.png",
  },
  {
    title: "Edukasi dan produk tetap tersambung",
    body: "Artikel, solusi, dan produk sekarang dibingkai sebagai satu alur, bukan tiga ruang yang terputus.",
    icon: "/wiragro-illustrations/wiragro_feature_petani_indonesia_transparent.png",
  },
  {
    title: "Konsultasi dan pelacakan tetap dekat",
    body: "Ada jalur cepat untuk konsultasi WhatsApp, cek jam operasional, dan melacak pesanan tanpa keluar dari alur utama.",
    icon: "/wiragro-illustrations/wiragro_feature_harga_bersahabat_transparent.png",
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
