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
  "/artikel": ["/belajar", "/edukasi"],
  "/belajar": ["/artikel", "/edukasi"],
  "/produk": ["/belanja", "/belanja/paket", "/kampanye", "/b2b", "/cari"],
};

export const GLOBAL_SEARCH_HREF = "/cari";

export const PLATFORM_ENTRY_LINKS: NavLink[] = [
  {
    href: "/solusi",
    label: "Solusi",
    description: "Mulai dari gejala lapangan, kebutuhan tanaman, dan tindakan awal yang lebih tepat.",
  },
  {
    href: "/produk",
    label: "Produk",
    description: "Jelajahi produk pertanian, paket pilihan, dan kebutuhan budidaya dari satu katalog yang rapi.",
  },
  {
    href: "/artikel",
    label: "Edukasi",
    description:
      "Pelajari budidaya, input pertanian, dan keputusan lapangan dengan bahasa yang lebih mudah dipahami.",
  },
  {
    href: "/ai-chat",
    label: "AI Chat",
    description:
      "Akses pendamping AI pertanian premium untuk mempercepat tanya jawab, rangkuman, dan arahan awal.",
  },
];

export const HEADER_NAV_LINKS: NavLink[] = [
  ...PLATFORM_ENTRY_LINKS,
  {
    href: "/lacak-pesanan",
    label: "Lacak Pesanan",
    description: "Pantau status pesanan dengan cepat tanpa harus menebak progresnya.",
  },
];

export const COMMERCIAL_ENTRY_LINKS: NavLink[] = [
  {
    href: "/belanja/paket",
    label: "Bundle",
    description: "Paket pilihan untuk kebutuhan tanam, proteksi, atau belanja rutin.",
  },
  {
    href: "/kampanye",
    label: "Campaign",
    description: "Halaman tematik musiman agar kebutuhan yang paling mendesak lebih cepat ditemukan.",
  },
  {
    href: "/b2b",
    label: "B2B",
    description: "Jalur kebutuhan bisnis untuk toko pertanian, usaha tani, proyek, dan pembelian rutin dalam volume lebih besar.",
  },
];

export const UTILITY_NAV_LINKS: NavLink[] = [
  { href: "/kontak", label: "Kontak" },
  { href: "/faq", label: "FAQ" },
  { href: "/tentang-kami", label: "Tentang Kami" },
];

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Platform",
    links: [
      { href: "/solusi", label: "Solusi Tanaman" },
      { href: "/produk", label: "Produk Pertanian" },
      { href: "/artikel", label: "Edukasi" },
      { href: "/ai-chat", label: "AI Chat Premium" },
      { href: "/lacak-pesanan", label: "Lacak Pesanan" },
    ],
  },
  {
    title: "Tentang",
    links: [
      { href: "/tentang-kami", label: "Tentang Wiragro" },
      { href: "/kontak", label: "Kontak" },
      { href: "/faq", label: "FAQ" },
      { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
      { href: "/syarat-dan-ketentuan", label: "Syarat & Ketentuan" },
    ],
  },
  {
    title: "Belanja & Akun",
    links: [
      { href: "/belanja/paket", label: "Bundle" },
      { href: "/b2b", label: "Kebutuhan Volume Besar" },
      { href: "/keranjang", label: "Keranjang" },
      { href: "/masuk", label: "Masuk / Akun" },
    ],
  },
  {
    title: "Kanal Resmi",
    links: [
      { href: "/kontak", label: "WhatsApp Resmi" },
      { href: "/kontak", label: "Sosial Media" },
      { href: "/pengiriman-pembayaran", label: "Pengiriman & Pembayaran" },
      { href: "/garansi-retur", label: "Garansi & Retur" },
    ],
  },
];

export const HOMEPAGE_ENTRY_CARDS: PathwayCard[] = [
  {
    pillar: "learn",
    eyebrow: "Edukasi",
    title: "Mulai dari pemahaman, bukan dari tebak-tebakan.",
    description:
      "Pelajari dasar budidaya, pilihan input, dan konteks penggunaan sebelum masuk ke keputusan belanja.",
    href: "/artikel",
    actionLabel: "Buka edukasi",
    bullets: ["Panduan dasar", "Input pertanian", "Artikel yang siap dibaca"],
    supportingLinks: [
      { href: "/artikel", label: "Semua artikel" },
      { href: "/faq", label: "FAQ lapangan" },
    ],
  },
  {
    pillar: "solve",
    eyebrow: "Solusi",
    title: "Mulai dari gejala yang terjadi di lapangan.",
    description:
      "Gunakan layer solusi untuk menyaring masalah, menemukan tindakan awal, lalu menuju produk yang relevan.",
    href: "/solusi",
    actionLabel: "Buka solusi",
    bullets: ["Daun menguning", "Hama dan penyakit", "Tindakan awal yang aman"],
    supportingLinks: [
      { href: "/artikel", label: "Lihat panduan" },
      { href: "/kontak", label: "Hubungi tim" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Produk",
    title: "Masuk ke produk saat kebutuhan Anda sudah lebih jelas.",
    description:
      "Jelajahi katalog, paket pilihan, campaign, dan jalur B2B tanpa kehilangan konteks belajar atau solusi yang dibutuhkan.",
    href: "/produk",
    actionLabel: "Jelajahi produk",
    bullets: ["Kategori utama", "Bundle resmi", "Campaign aktif"],
    supportingLinks: [
      { href: "/belanja/paket", label: "Paket & bundle" },
      { href: "/kampanye", label: "Campaign" },
    ],
  },
];

export const HOMEPAGE_COMMERCIAL_ENTRY_CARDS: PathwayCard[] = [
  {
    pillar: "shop",
    eyebrow: "Bundle",
    title: "Bundle hadir sebagai paket pilihan yang lebih mudah dipahami dan dipilih.",
    description:
      "Bundle membantu kebutuhan fase tanam, komoditas, dan belanja rutin terasa lebih ringkas sejak awal.",
    href: "/belanja/paket",
    actionLabel: "Buka semua bundle",
    bullets: ["Paket fase tanam", "Komoditas prioritas", "Belanja ulang lebih ringkas"],
    supportingLinks: [
      { href: "/produk", label: "Katalog produk" },
      { href: "/produk", label: "Katalog produk" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Campaign",
    title: "Campaign membantu kebutuhan musiman tampil lebih fokus tanpa kehilangan konteks.",
    description:
      "Halaman campaign menghubungkan bundle, solusi, dan bantuan tim saat pengguna datang dari musim, komoditas, atau masalah prioritas.",
    href: "/kampanye",
    actionLabel: "Lihat campaign",
    bullets: ["Musim hujan", "Awal tanam", "Masalah prioritas"],
    supportingLinks: [
      { href: "/solusi", label: "Cari solusi" },
      { href: "/belanja/paket", label: "Bundle terkait" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "B2B",
    title: "B2B menjadi jalur resmi untuk kebutuhan bisnis dan pembelian volume.",
    description:
      "B2B membantu toko pertanian, proyek, dan kebutuhan rutin dibahas lebih rapi bersama tim Wiragro.",
    href: "/b2b",
    actionLabel: "Ajukan inquiry B2B",
    bullets: ["Permintaan lebih rapi", "Status penawaran awal", "Mudah ditindaklanjuti"],
    supportingLinks: [
      { href: "/belanja/paket", label: "Mulai dari bundle" },
      { href: "/kampanye", label: "Masuk dari campaign" },
    ],
  },
];

const LEARNING_HUB_CARDS: PathwayCard[] = [
  {
    pillar: "learn",
    eyebrow: "Jalur edukasi",
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
    actionLabel: "Masuk ke Solusi",
    supportingLinks: [
      { href: "/solusi", label: "Gejala umum" },
      { href: "/kontak", label: "Butuh bantuan" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Produk terarah",
    title: "Bawa wawasan tadi ke katalog aktif.",
    description:
      "Setelah tahu kebutuhan utama, lanjutkan ke kategori dan produk aktif agar keputusan belanja lebih percaya diri.",
    href: "/produk",
    actionLabel: "Buka produk",
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
    eyebrow: "Produk",
    title: "Masuk ke katalog setelah masalahnya lebih jelas.",
    description:
      "Sesudah konteks masalahnya lebih terang, pengguna bisa lanjut ke produk yang paling relevan tanpa kehilangan arah.",
    href: "/produk",
    actionLabel: "Jelajahi produk",
    supportingLinks: [
      { href: "/produk", label: "Semua produk" },
      { href: "/lacak-pesanan", label: "Lacak pesanan" },
    ],
  },
];

const SHOPPING_HUB_CARDS: PathwayCard[] = [
  {
    pillar: "shop",
    eyebrow: "Bundle resmi",
    title: "Paket dan bundle membantu kebutuhan yang sudah jelas terasa lebih ringkas.",
    description:
      "Gunakan bundle saat kebutuhan sudah cukup jelas dan Anda ingin memilih paket yang lebih praktis.",
    href: "/belanja/paket",
    actionLabel: "Buka hub bundle",
    bullets: ["Paket kebutuhan", "Belanja lebih praktis", "Mudah untuk belanja ulang"],
    supportingLinks: [
      { href: "/produk", label: "Katalog produk" },
      { href: "/b2b", label: "Inquiry kebutuhan volume" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "Campaign resmi",
    title: "Campaign membantu kebutuhan musiman atau kebutuhan mendesak tampil lebih jelas.",
    description:
      "Halaman campaign cocok saat Anda datang dari momentum musim, komoditas, atau masalah prioritas yang sudah dekat ke pembelian.",
    href: "/kampanye",
    actionLabel: "Lihat campaign aktif",
    supportingLinks: [
      { href: "/solusi", label: "Cari solusi" },
      { href: "/belanja/paket", label: "Bundle terkait" },
    ],
  },
  {
    pillar: "shop",
    eyebrow: "B2B inquiry",
    title: "Permintaan penawaran membantu kebutuhan volume dibahas lebih rapi.",
    description:
      "B2B membantu toko pertanian, proyek, dan kebutuhan rutin dibahas bersama tim tanpa mengganggu alur belanja utama.",
    href: "/b2b",
    actionLabel: "Masuk ke B2B inquiry",
    supportingLinks: [
      { href: "/artikel", label: "Butuh konteks dulu" },
      { href: "/solusi", label: "Masuk dari gejala" },
    ],
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
      eyebrow: "Edukasi",
      title: "Lanjutkan pemahaman dari jalur edukasi.",
      description: articleTitle
        ? `Setelah membaca "${articleTitle}", Anda bisa melanjutkan ke hub edukasi untuk topik yang lebih luas.`
        : "Masuk ke hub edukasi untuk menyusun pemahaman yang lebih runtut sebelum mengambil keputusan berikutnya.",
      href: "/artikel",
      actionLabel: "Masuk ke Edukasi",
      supportingLinks: [{ href: "/artikel", label: "Artikel lain" }],
    },
    {
      pillar: "solve",
      eyebrow: "Solusi",
      title: "Pindah dari insight ke gejala lapangan.",
      description:
        "Kalau pembaca sudah paham teorinya, arahkan ke jalur solusi untuk memetakan masalah yang benar-benar sedang terjadi.",
      href: "/solusi",
      actionLabel: "Buka Solusi",
      supportingLinks: [{ href: "/kontak", label: "Konsultasi cepat" }],
    },
    {
      pillar: "shop",
      eyebrow: "Produk",
      title: "Bawa konteks ini ke katalog aktif.",
      description:
        "Belanja tetap menjadi langkah lanjut, tetapi datang setelah pengguna merasa lebih yakin dengan kebutuhannya.",
      href: "/produk",
      actionLabel: "Jelajahi produk",
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
      eyebrow: "Edukasi",
      title: "Pelajari konteks pemakaian sebelum checkout.",
      description: productName
        ? `Gunakan jalur edukasi untuk memahami kapan "${productName}" lebih relevan dipakai dan apa alternatif pertimbangannya.`
        : "Masuk ke hub edukasi untuk memahami cara pakai, peran input, dan konteks pembelian yang lebih sehat.",
      href: "/artikel",
      actionLabel: "Masuk ke Edukasi",
      supportingLinks: [{ href: "/artikel", label: "Baca panduan" }],
    },
    {
      pillar: "solve",
      eyebrow: "Solusi",
      title: "Pastikan produk ini cocok dengan masalah yang dihadapi.",
      description:
        "Arahkan pengguna ke jalur solusi jika kebutuhan masih dipicu gejala lapangan, bukan daftar belanja yang sudah pasti.",
      href: "/solusi",
      actionLabel: "Cari solusi dulu",
      supportingLinks: [{ href: "/kontak", label: "Butuh bantuan tim" }],
    },
    {
      pillar: "shop",
      eyebrow: "Produk",
      title: "Bandingkan opsi lain dalam alur belanja yang sama.",
      description:
        "Beri jalur kembali ke kategori dan halaman produk agar pengguna bisa membandingkan dengan lebih tenang.",
      href: "/produk",
      actionLabel: "Buka produk",
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
      eyebrow: "Edukasi",
      title: "Masuk ke jalur edukasi yang lebih terstruktur.",
      description: pageTitle
        ? `Setelah membaca ${pageTitle.toLowerCase()}, pembaca bisa masuk ke hub edukasi untuk memperdalam konteks.`
        : "Masuk ke hub edukasi untuk memperdalam konteks sebelum mengambil langkah berikutnya.",
      href: "/artikel",
      actionLabel: "Buka Edukasi",
      supportingLinks: [{ href: "/artikel", label: "Artikel terbaru" }],
    },
    {
      pillar: "solve",
      eyebrow: "Solusi",
      title: "Pakai jalur solusi saat kebutuhan sudah spesifik.",
      description:
        "Jalur solusi membantu pengguna yang datang dengan masalah nyata, bukan hanya ingin membaca informasi umum.",
      href: "/solusi",
      actionLabel: "Masuk ke Solusi",
      supportingLinks: [{ href: "/kontak", label: "Hubungi tim" }],
    },
    {
      pillar: "shop",
      eyebrow: "Produk",
      title: "Lanjutkan ke produk saat kebutuhan sudah jelas.",
      description:
        "Halaman produk menjaga jalur belanja tetap jelas tanpa membingungkan pembaca yang sedang berada di halaman informasi.",
      href: "/produk",
      actionLabel: "Buka produk",
      supportingLinks: [{ href: "/produk", label: "Lihat semua produk" }],
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
