export type PillarTone = "learn" | "solve" | "shop";

export type NavLink = {
  href: string;
  label: string;
  description?: string;
};

export type PathwaySupportLink = {
  href: string;
  label: string;
};

export type PathwayCard = {
  pillar: PillarTone;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  bullets?: string[];
  supportingLinks?: PathwaySupportLink[];
};

type FooterLinkGroup = {
  title: string;
  links: NavLink[];
};

const PILLAR_ROUTE_ALIASES: Record<string, string[]> = {
  "/belajar": ["/artikel"],
  "/belanja": ["/produk"],
};

export const PRIMARY_PILLAR_LINKS: NavLink[] = [
  {
    href: "/belajar",
    label: "Belajar",
    description: "Masuk dari panduan dasar, konteks budidaya, dan cara memilih input.",
  },
  {
    href: "/solusi",
    label: "Cari Solusi",
    description: "Mulai dari gejala lapangan, tindakan awal, lalu keputusan yang lebih tepat.",
  },
  {
    href: "/belanja",
    label: "Belanja",
    description: "Masuk ke katalog, kategori, promo, dan produk aktif saat siap membeli.",
  },
];

export const UTILITY_NAV_LINKS: NavLink[] = [
  { href: "/lacak-pesanan", label: "Lacak Pesanan" },
  { href: "/kontak", label: "Kontak" },
  { href: "/faq", label: "FAQ" },
  { href: "/tentang-kami", label: "Tentang Kami" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Belajar",
    links: [
      { href: "/belajar", label: "Hub Belajar" },
      { href: "/komoditas", label: "Komoditas" },
      { href: "/artikel", label: "Semua Artikel" },
      { href: "/faq", label: "FAQ Dasar" },
    ],
  },
  {
    title: "Cari Solusi",
    links: [
      { href: "/solusi", label: "Hub Solusi" },
      { href: "/artikel", label: "Panduan Lapangan" },
      { href: "/kontak", label: "Butuh Bantuan" },
    ],
  },
  {
    title: "Belanja",
    links: [
      { href: "/belanja", label: "Hub Belanja" },
      { href: "/belanja/paket", label: "Paket & Bundle" },
      { href: "/kampanye", label: "Campaign Landing" },
      { href: "/produk", label: "Semua Produk" },
      { href: "/b2b", label: "B2B Inquiry" },
      { href: "/lacak-pesanan", label: "Status Pesanan" },
    ],
  },
  {
    title: "Informasi",
    links: [
      { href: "/tentang-kami", label: "Tentang Kami" },
      { href: "/pengiriman-pembayaran", label: "Pengiriman & Pembayaran" },
      { href: "/garansi-retur", label: "Garansi & Retur" },
      { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
      { href: "/syarat-dan-ketentuan", label: "Syarat dan Ketentuan" },
    ],
  },
];

export const HOMEPAGE_ENTRY_CARDS: PathwayCard[] = [
  {
    pillar: "learn",
    eyebrow: "Belajar",
    title: "Mulai dari pemahaman, bukan tebakan.",
    description:
      "Pelajari dasar budidaya, input utama, dan konteks pembelian sebelum masuk ke katalog.",
    href: "/belajar",
    actionLabel: "Masuk ke Belajar",
    bullets: ["Panduan dasar", "Input pertanian", "Artikel yang siap dibaca"],
    supportingLinks: [
      { href: "/artikel", label: "Semua artikel" },
      { href: "/faq", label: "FAQ lapangan" },
    ],
  },
  {
    pillar: "solve",
    eyebrow: "Cari Solusi",
    title: "Mulai dari gejala yang terjadi di lapangan.",
    description:
      "Gunakan layer solusi untuk menyaring masalah, menemukan tindakan awal, lalu menuju produk yang relevan.",
    href: "/solusi",
    actionLabel: "Buka Cari Solusi",
    bullets: ["Daun menguning", "Hama dan penyakit", "Tindakan awal yang aman"],
    supportingLinks: [
      { href: "/artikel", label: "Lihat panduan" },
      { href: "/kontak", label: "Hubungi toko" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Belanja",
    title: "Masuk ke katalog saat kebutuhan sudah jelas.",
    description:
      "Jelajahi kategori, promo, dan produk aktif tanpa kehilangan konteks belajar atau solusi yang dibutuhkan.",
    href: "/belanja",
    actionLabel: "Masuk ke Belanja",
    bullets: ["Kategori utama", "Promo aktif", "Produk pilihan toko"],
    supportingLinks: [
      { href: "/produk", label: "Semua produk" },
      { href: "/lacak-pesanan", label: "Lacak pesanan" },
    ],
  },
];

const LEARNING_HUB_CARDS: PathwayCard[] = [
  {
    pillar: "learn",
    eyebrow: "Jalur belajar",
    title: "Mulai dari dasar input dan ritme budidaya.",
    description:
      "Gunakan halaman ini untuk memahami pupuk, benih, proteksi tanaman, dan ritme belanja yang lebih terarah.",
    href: "/artikel",
    actionLabel: "Lihat semua artikel",
    bullets: ["Dasar pemupukan", "Benih dan persemaian", "Cara menyusun pembelian"],
  },
  {
    pillar: "solve",
    eyebrow: "Lanjut ke solusi",
    title: "Saat teori sudah cukup, pindah ke gejala nyata.",
    description:
      "Masuk ke layer solusi untuk mencocokkan gejala lapangan dengan tindakan awal yang lebih praktis.",
    href: "/solusi",
    actionLabel: "Masuk ke Cari Solusi",
    supportingLinks: [
      { href: "/solusi", label: "Gejala umum" },
      { href: "/kontak", label: "Butuh bantuan" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Belanja terarah",
    title: "Bawa wawasan tadi ke katalog aktif.",
    description:
      "Setelah tahu kebutuhan utama, lanjutkan ke kategori dan produk aktif agar keputusan belanja lebih percaya diri.",
    href: "/belanja",
    actionLabel: "Buka hub Belanja",
    supportingLinks: [
      { href: "/produk", label: "Semua produk" },
      { href: "/produk?sort=promo", label: "Promo aktif" },
    ],
  },
];

const SOLUTION_HUB_CARDS: PathwayCard[] = [
  {
    pillar: "solve",
    eyebrow: "Gejala umum",
    title: "Daun menguning dan pertumbuhan melambat.",
    description:
      "Mulai dari pemeriksaan nutrisi, media, dan ritme penyiraman sebelum memilih produk yang dibutuhkan.",
    href: "/artikel",
    actionLabel: "Buka panduan terkait",
    bullets: ["Cek akar dan media", "Nilai kebutuhan nutrisi", "Bandingkan produk pendukung"],
    supportingLinks: [
      { href: "/produk?q=pupuk", label: "Cari pupuk" },
      { href: "/produk?q=nutrisi", label: "Cari nutrisi" },
    ],
  },
  {
    pillar: "solve",
    eyebrow: "Hama dan penyakit",
    title: "Saat serangan mulai terlihat, jangan langsung acak beli.",
    description:
      "Gunakan jalur solusi untuk mengenali gejala, tindakan awal, dan produk yang lebih masuk akal dipertimbangkan.",
    href: "/artikel",
    actionLabel: "Pelajari tindakan awal",
    bullets: ["Identifikasi gejala", "Pisahkan hama vs penyakit", "Cari proteksi yang relevan"],
    supportingLinks: [
      { href: "/produk?q=pestisida", label: "Cari pestisida" },
      { href: "/produk?q=herbisida", label: "Cari proteksi" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Lanjut ke produk",
    title: "Masuk ke katalog setelah masalahnya lebih jelas.",
    description:
      "Hub solusi ini sengaja tetap terhubung ke katalog lama agar tim bisa transisi tanpa rebuild total.",
    href: "/belanja",
    actionLabel: "Masuk ke hub Belanja",
    supportingLinks: [
      { href: "/produk", label: "Semua produk" },
      { href: "/lacak-pesanan", label: "Pesanan berjalan" },
    ],
  },
];

const SHOPPING_HUB_CARDS: PathwayCard[] = [
  {
    pillar: "shop",
    eyebrow: "Masuk dari kategori",
    title: "Jelajahi kebutuhan utama tanpa tenggelam di listing panjang.",
    description:
      "Hub belanja dipakai sebagai pintu masuk sebelum user turun ke katalog lama yang sudah aktif.",
    href: "/produk",
    actionLabel: "Buka semua produk",
    bullets: ["Kategori utama", "Produk baru", "Promo aktif"],
  },
  {
    pillar: "learn",
    eyebrow: "Belajar sebelum beli",
    title: "Butuh konteks lebih dulu sebelum checkout?",
    description:
      "Kembali ke jalur belajar untuk memahami input, istilah produk, dan perbedaan pilihan sebelum membeli.",
    href: "/belajar",
    actionLabel: "Masuk ke Belajar",
    supportingLinks: [{ href: "/artikel", label: "Baca artikel" }],
  },
  {
    pillar: "solve",
    eyebrow: "Belanja dari masalah",
    title: "Kalau kebutuhan belum jelas, pindah dulu ke layer solusi.",
    description:
      "Cari dari gejala lapangan lebih dulu supaya katalog tidak terasa seperti toko yang memaksa jualan.",
    href: "/solusi",
    actionLabel: "Cari solusi dulu",
    supportingLinks: [{ href: "/kontak", label: "Butuh bantuan toko" }],
  },
];

export function getLearningHubCards() {
  return LEARNING_HUB_CARDS;
}

export function getSolutionHubCards() {
  return SOLUTION_HUB_CARDS;
}

export function getShoppingHubCards() {
  return SHOPPING_HUB_CARDS;
}

export function getArticleRelationCards(articleTitle?: string): PathwayCard[] {
  return [
    {
      pillar: "learn",
      eyebrow: "Belajar",
      title: "Lanjutkan pemahaman dari jalur belajar.",
      description: articleTitle
        ? `Setelah membaca "${articleTitle}", Anda bisa melanjutkan ke hub belajar untuk topik yang lebih luas.`
        : "Masuk ke hub belajar untuk menyusun pemahaman yang lebih runtut sebelum mengambil keputusan berikutnya.",
      href: "/belajar",
      actionLabel: "Masuk ke Belajar",
      supportingLinks: [{ href: "/artikel", label: "Artikel lain" }],
    },
    {
      pillar: "solve",
      eyebrow: "Cari Solusi",
      title: "Pindah dari insight ke gejala lapangan.",
      description:
        "Kalau user sudah paham teorinya, arahkan ke jalur solusi untuk memetakan masalah yang benar-benar sedang terjadi.",
      href: "/solusi",
      actionLabel: "Buka Cari Solusi",
      supportingLinks: [{ href: "/kontak", label: "Konsultasi cepat" }],
    },
    {
      pillar: "shop",
      eyebrow: "Belanja",
      title: "Bawa konteks ini ke katalog aktif.",
      description:
        "Belanja tetap menjadi ujung flow, tetapi datang setelah user merasa lebih yakin dengan kebutuhannya.",
      href: "/belanja",
      actionLabel: "Masuk ke Belanja",
      supportingLinks: [{ href: "/produk", label: "Semua produk" }],
    },
  ];
}

export function getProductRelationCards(
  productName?: string,
  category?: { name?: string | null; slug?: string | null },
): PathwayCard[] {
  const categoryHref = category?.slug ? `/produk?kategori=${category.slug}` : "/produk";

  return [
    {
      pillar: "learn",
      eyebrow: "Belajar",
      title: "Pelajari konteks pemakaian sebelum checkout.",
      description: productName
        ? `Gunakan jalur belajar untuk memahami kapan "${productName}" lebih relevan dipakai dan apa alternatif pertimbangannya.`
        : "Masuk ke hub belajar untuk memahami cara pakai, peran input, dan konteks pembelian yang lebih sehat.",
      href: "/belajar",
      actionLabel: "Masuk ke Belajar",
      supportingLinks: [{ href: "/artikel", label: "Baca panduan" }],
    },
    {
      pillar: "solve",
      eyebrow: "Cari Solusi",
      title: "Pastikan produk ini cocok dengan masalah yang dihadapi.",
      description:
        "Arahkan user ke jalur solusi jika kebutuhan masih dipicu gejala lapangan, bukan daftar belanja yang sudah pasti.",
      href: "/solusi",
      actionLabel: "Cari solusi dulu",
      supportingLinks: [{ href: "/kontak", label: "Butuh bantuan toko" }],
    },
    {
      pillar: "shop",
      eyebrow: "Belanja",
      title: "Bandingkan opsi lain dalam alur belanja yang sama.",
      description:
        "Jaga conversion tetap sehat dengan memberi jalur kembali ke kategori dan hub belanja, bukan membuat user buntu di satu PDP.",
      href: "/belanja",
      actionLabel: "Buka hub Belanja",
      supportingLinks: [
        { href: categoryHref, label: category?.name ? `Kategori ${category.name}` : "Lihat kategori" },
        { href: "/produk?sort=promo", label: "Promo aktif" },
      ],
    },
  ];
}

export function getStaticRelationCards(pageTitle?: string): PathwayCard[] {
  return [
    {
      pillar: "learn",
      eyebrow: "Belajar",
      title: "Masuk ke jalur belajar yang lebih terstruktur.",
      description: pageTitle
        ? `Setelah membaca ${pageTitle.toLowerCase()}, user bisa masuk ke hub belajar untuk memperdalam konteks.`
        : "Masuk ke hub belajar untuk memperdalam konteks sebelum mengambil langkah berikutnya.",
      href: "/belajar",
      actionLabel: "Buka Belajar",
      supportingLinks: [{ href: "/artikel", label: "Artikel terbaru" }],
    },
    {
      pillar: "solve",
      eyebrow: "Cari Solusi",
      title: "Pakai jalur solusi saat kebutuhan sudah spesifik.",
      description:
        "Layer solusi membantu user yang datang dengan masalah nyata, bukan hanya ingin membaca informasi umum.",
      href: "/solusi",
      actionLabel: "Masuk ke Cari Solusi",
      supportingLinks: [{ href: "/kontak", label: "Hubungi toko" }],
    },
    {
      pillar: "shop",
      eyebrow: "Belanja",
      title: "Lanjutkan ke produk saat kebutuhan sudah jelas.",
      description:
        "Hub belanja menjaga jalur komersial tetap kuat tanpa membingungkan user yang sedang berada di halaman informasi.",
      href: "/belanja",
      actionLabel: "Masuk ke Belanja",
      supportingLinks: [{ href: "/produk", label: "Buka katalog" }],
    },
  ];
}

export function isHybridNavActive(pathname: string, href: string) {
  if (pathname === href || pathname.startsWith(`${href}/`)) {
    return true;
  }

  return (PILLAR_ROUTE_ALIASES[href] ?? []).some(
    (alias) => pathname === alias || pathname.startsWith(`${alias}/`),
  );
}
