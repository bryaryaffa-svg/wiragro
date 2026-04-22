export type CategoryClusterKey = "budidaya" | "peralatan" | "operasional";

export type CategoryMascotKind =
  | "pupuk"
  | "nutrisi"
  | "benih"
  | "bibit"
  | "pestisida"
  | "tanah"
  | "media"
  | "persemaian"
  | "wadah"
  | "alat"
  | "sprayer"
  | "irigasi"
  | "mulsa"
  | "panen"
  | "kemasan"
  | "peternakan"
  | "kios"
  | "layanan";

export type SubcategoryIconKind =
  | "bag"
  | "spark"
  | "seed"
  | "sprout"
  | "shield"
  | "soil"
  | "tray"
  | "pot"
  | "tool"
  | "spray"
  | "water"
  | "cover"
  | "harvest"
  | "box"
  | "feed"
  | "store"
  | "service";

export type StorefrontSubcategory = {
  label: string;
  icon: SubcategoryIconKind;
  query: string;
  matchers: string[];
  href?: string;
};

export type StorefrontMainCategory = {
  key: string;
  cluster: CategoryClusterKey;
  label: string;
  description: string;
  query: string;
  matchers: string[];
  mascot: CategoryMascotKind;
  accent: string;
  accentSoft: string;
  accentWarm: string;
  subcategories: StorefrontSubcategory[];
  href?: string;
};

export const STOREFRONT_CATEGORY_CLUSTERS: Record<
  CategoryClusterKey,
  { label: string; description: string }
> = {
  budidaya: {
    label: "Budidaya Tanaman",
    description: "Fondasi nutrisi, proteksi, media, dan kebutuhan tanam dari awal sampai siap tumbuh.",
  },
  peralatan: {
    label: "Peralatan & Penunjang",
    description: "Perangkat lapangan, pengairan, pelindung tanam, hingga perlengkapan panen dan kemasan.",
  },
  operasional: {
    label: "Operasional & Dukungan",
    description: "Kebutuhan peternakan, operasional kios, dan layanan yang membantu transaksi tetap lancar.",
  },
};

export const STOREFRONT_MAIN_CATEGORIES: StorefrontMainCategory[] = [
  {
    key: "pupuk",
    cluster: "budidaya",
    label: "Pupuk",
    description: "Dasar nutrisi untuk sawah, kebun, dan hortikultura.",
    query: "pupuk",
    matchers: ["pupuk", "fertilizer"],
    mascot: "pupuk",
    accent: "#4d8f49",
    accentSoft: "#eef7d8",
    accentWarm: "#f8efe0",
    subcategories: [
      { label: "Pupuk Organik", icon: "bag", query: "pupuk organik", matchers: ["pupuk organik", "organik"] },
      { label: "NPK & Granul", icon: "bag", query: "npk granul", matchers: ["npk", "granul"] },
      { label: "Dolomit", icon: "soil", query: "dolomit", matchers: ["dolomit", "kapur"] },
    ],
  },
  {
    key: "nutrisi-perangsang",
    cluster: "budidaya",
    label: "Nutrisi & Perangsang",
    description: "Booster pertumbuhan, pembungaan, dan pemulihan tanaman.",
    query: "nutrisi tanaman",
    matchers: ["nutrisi", "pupuk cair", "perangsang", "zpt", "booster"],
    mascot: "nutrisi",
    accent: "#2a8c76",
    accentSoft: "#ddf6ef",
    accentWarm: "#edf6e6",
    subcategories: [
      { label: "ZPT Tanaman", icon: "spark", query: "zpt tanaman", matchers: ["zpt", "perangsang"] },
      { label: "Nutrisi Daun", icon: "spark", query: "nutrisi daun", matchers: ["nutrisi daun", "daun"] },
      { label: "Booster Buah", icon: "sprout", query: "booster buah", matchers: ["booster buah", "pembungaan"] },
    ],
  },
  {
    key: "benih",
    cluster: "budidaya",
    label: "Benih",
    description: "Benih sayur, padi, jagung, dan komoditas unggulan.",
    query: "benih",
    matchers: ["benih", "seed", "bibit benih"],
    mascot: "benih",
    accent: "#8ab23b",
    accentSoft: "#f1f8d7",
    accentWarm: "#fbf4e2",
    subcategories: [
      { label: "Benih Sayur", icon: "seed", query: "benih sayur", matchers: ["benih sayur", "sayur"] },
      { label: "Benih Padi", icon: "seed", query: "benih padi", matchers: ["benih padi", "padi"] },
      { label: "Benih Jagung", icon: "seed", query: "benih jagung", matchers: ["benih jagung", "jagung"] },
    ],
  },
  {
    key: "bibit",
    cluster: "budidaya",
    label: "Bibit",
    description: "Bibit siap tanam untuk kebun, horti, dan pekarangan.",
    query: "bibit tanaman",
    matchers: ["bibit", "seedling", "bibit tanaman"],
    mascot: "bibit",
    accent: "#5ba257",
    accentSoft: "#e6f6df",
    accentWarm: "#f7f0e0",
    subcategories: [
      { label: "Bibit Horti", icon: "sprout", query: "bibit hortikultura", matchers: ["bibit horti", "hortikultura"] },
      { label: "Bibit Buah", icon: "sprout", query: "bibit buah", matchers: ["bibit buah", "buah"] },
      { label: "Bibit Siap Tanam", icon: "pot", query: "bibit siap tanam", matchers: ["siap tanam"] },
    ],
  },
  {
    key: "pestisida",
    cluster: "budidaya",
    label: "Pestisida",
    description: "Proteksi hama, gulma, dan penyakit tanaman.",
    query: "pestisida",
    matchers: ["pestisida", "herbisida", "insektisida", "fungisida"],
    mascot: "pestisida",
    accent: "#e06d41",
    accentSoft: "#ffe8db",
    accentWarm: "#f8efe5",
    subcategories: [
      { label: "Insektisida", icon: "shield", query: "insektisida", matchers: ["insektisida"] },
      { label: "Fungisida", icon: "shield", query: "fungisida", matchers: ["fungisida"] },
      { label: "Herbisida", icon: "shield", query: "herbisida", matchers: ["herbisida"] },
    ],
  },
  {
    key: "pembenah-tanah",
    cluster: "budidaya",
    label: "Pembenah Tanah",
    description: "Perbaiki struktur tanah dan serap nutrisi lebih optimal.",
    query: "pembenah tanah",
    matchers: ["pembenah tanah", "tanah", "humic", "zeolit", "dolomit"],
    mascot: "tanah",
    accent: "#8d6a3d",
    accentSoft: "#f7ead8",
    accentWarm: "#f8f0e5",
    subcategories: [
      { label: "Humic Acid", icon: "soil", query: "humic acid", matchers: ["humic", "asam humat"] },
      { label: "Zeolit", icon: "soil", query: "zeolit", matchers: ["zeolit"] },
      { label: "Kapur Dolomit", icon: "soil", query: "kapur dolomit", matchers: ["kapur dolomit", "dolomit"] },
    ],
  },
  {
    key: "media-tanam",
    cluster: "budidaya",
    label: "Media Tanam",
    description: "Campuran media siap pakai untuk semai dan pot.",
    query: "media tanam",
    matchers: ["media tanam", "cocopeat", "sekam", "rockwool"],
    mascot: "media",
    accent: "#719251",
    accentSoft: "#eef5df",
    accentWarm: "#f8f1e2",
    subcategories: [
      { label: "Cocopeat", icon: "soil", query: "cocopeat", matchers: ["cocopeat"] },
      { label: "Sekam Bakar", icon: "soil", query: "sekam bakar", matchers: ["sekam"] },
      { label: "Rockwool", icon: "tray", query: "rockwool", matchers: ["rockwool"] },
    ],
  },
  {
    key: "persemaian",
    cluster: "budidaya",
    label: "Persemaian",
    description: "Kebutuhan semai dari tray sampai label dan dome.",
    query: "persemaian",
    matchers: ["persemaian", "tray semai", "semai"],
    mascot: "persemaian",
    accent: "#54917f",
    accentSoft: "#e2f5ee",
    accentWarm: "#f5efe3",
    subcategories: [
      { label: "Tray Semai", icon: "tray", query: "tray semai", matchers: ["tray semai", "tray"] },
      { label: "Dome Semai", icon: "tray", query: "dome semai", matchers: ["dome semai", "dome"] },
      { label: "Label Tanam", icon: "sprout", query: "label tanam", matchers: ["label tanam"] },
    ],
  },
  {
    key: "polybag-wadah",
    cluster: "budidaya",
    label: "Polybag & Wadah Tanam",
    description: "Wadah budidaya yang rapi untuk lahan atau pekarangan.",
    query: "polybag",
    matchers: ["polybag", "pot", "wadah tanam", "grow bag"],
    mascot: "wadah",
    accent: "#4f7aab",
    accentSoft: "#e2eefb",
    accentWarm: "#f6eee0",
    subcategories: [
      { label: "Polybag Hitam", icon: "pot", query: "polybag hitam", matchers: ["polybag"] },
      { label: "Pot Tanam", icon: "pot", query: "pot tanam", matchers: ["pot tanam", "pot"] },
      { label: "Grow Bag", icon: "pot", query: "grow bag", matchers: ["grow bag"] },
    ],
  },
  {
    key: "alat-pertanian",
    cluster: "peralatan",
    label: "Alat Pertanian",
    description: "Perkakas dasar untuk olah lahan dan perawatan.",
    query: "alat pertanian",
    matchers: ["alat pertanian", "sekop", "garpu", "gunting kebun"],
    mascot: "alat",
    accent: "#4c7f59",
    accentSoft: "#e5f3e8",
    accentWarm: "#f7efe0",
    subcategories: [
      { label: "Sekop Tangan", icon: "tool", query: "sekop tangan", matchers: ["sekop"] },
      { label: "Garpu Tanah", icon: "tool", query: "garpu tanah", matchers: ["garpu"] },
      { label: "Gunting Kebun", icon: "tool", query: "gunting kebun", matchers: ["gunting kebun"] },
    ],
  },
  {
    key: "sprayer",
    cluster: "peralatan",
    label: "Sprayer & Alat Semprot",
    description: "Alat aplikasi pupuk cair dan pestisida.",
    query: "sprayer",
    matchers: ["sprayer", "alat semprot", "nozzle"],
    mascot: "sprayer",
    accent: "#2f7c8a",
    accentSoft: "#dff5f7",
    accentWarm: "#f5efe2",
    subcategories: [
      { label: "Hand Sprayer", icon: "spray", query: "hand sprayer", matchers: ["hand sprayer"] },
      { label: "Knapsack", icon: "spray", query: "sprayer knapsack", matchers: ["knapsack", "sprayer gendong"] },
      { label: "Nozzle", icon: "spray", query: "nozzle sprayer", matchers: ["nozzle"] },
    ],
  },
  {
    key: "irigasi",
    cluster: "peralatan",
    label: "Irigasi & Pengairan",
    description: "Distribusi air yang lebih hemat dan stabil.",
    query: "irigasi",
    matchers: ["irigasi", "pengairan", "drip", "selang"],
    mascot: "irigasi",
    accent: "#3279b6",
    accentSoft: "#dfeeff",
    accentWarm: "#f4efe5",
    subcategories: [
      { label: "Selang Air", icon: "water", query: "selang air", matchers: ["selang"] },
      { label: "Drip Line", icon: "water", query: "drip line", matchers: ["drip"] },
      { label: "Konektor", icon: "water", query: "konektor irigasi", matchers: ["konektor"] },
    ],
  },
  {
    key: "mulsa",
    cluster: "peralatan",
    label: "Mulsa & Pelindung Tanam",
    description: "Pelindung mikroklimat dan kontrol gulma.",
    query: "mulsa",
    matchers: ["mulsa", "pelindung tanam", "shade net", "insect net"],
    mascot: "mulsa",
    accent: "#6e8c45",
    accentSoft: "#edf5dd",
    accentWarm: "#f7efe0",
    subcategories: [
      { label: "Mulsa Plastik", icon: "cover", query: "mulsa plastik", matchers: ["mulsa plastik"] },
      { label: "Shade Net", icon: "cover", query: "shade net", matchers: ["shade net"] },
      { label: "Insect Net", icon: "cover", query: "insect net", matchers: ["insect net"] },
    ],
  },
  {
    key: "peralatan-panen",
    cluster: "peralatan",
    label: "Peralatan Panen",
    description: "Alat potong, angkut, dan sortasi hasil panen.",
    query: "alat panen",
    matchers: ["panen", "alat panen", "keranjang panen"],
    mascot: "panen",
    accent: "#b77237",
    accentSoft: "#fdecd9",
    accentWarm: "#f7efe2",
    subcategories: [
      { label: "Keranjang Panen", icon: "harvest", query: "keranjang panen", matchers: ["keranjang panen"] },
      { label: "Gunting Panen", icon: "harvest", query: "gunting panen", matchers: ["gunting panen"] },
      { label: "Pisau Panen", icon: "harvest", query: "pisau panen", matchers: ["pisau panen"] },
    ],
  },
  {
    key: "pascapanen",
    cluster: "peralatan",
    label: "Pascapanen & Kemasan",
    description: "Kemasan dan perlengkapan setelah panen.",
    query: "kemasan hasil panen",
    matchers: ["pascapanen", "kemasan", "karung", "standing pouch"],
    mascot: "kemasan",
    accent: "#7d6a59",
    accentSoft: "#f2ebe4",
    accentWarm: "#fbf4e8",
    subcategories: [
      { label: "Karung Panen", icon: "box", query: "karung panen", matchers: ["karung"] },
      { label: "Standing Pouch", icon: "box", query: "standing pouch", matchers: ["standing pouch", "pouch"] },
      { label: "Timbangan", icon: "box", query: "timbangan", matchers: ["timbangan"] },
    ],
  },
  {
    key: "peternakan",
    cluster: "operasional",
    label: "Peternakan",
    description: "Kebutuhan pendukung usaha ternak dan sanitasi.",
    query: "peternakan",
    matchers: ["peternakan", "pakan ternak", "vitamin ternak"],
    mascot: "peternakan",
    accent: "#7f7d4c",
    accentSoft: "#f3f1d8",
    accentWarm: "#f8f0df",
    subcategories: [
      { label: "Pakan Ternak", icon: "feed", query: "pakan ternak", matchers: ["pakan ternak"] },
      { label: "Vitamin Ternak", icon: "feed", query: "vitamin ternak", matchers: ["vitamin ternak"] },
      { label: "Disinfektan", icon: "shield", query: "disinfektan", matchers: ["disinfektan"] },
    ],
  },
  {
    key: "kebutuhan-kios",
    cluster: "operasional",
    label: "Kebutuhan Kios",
    description: "Pelengkap operasional toko dan kebutuhan harian kios.",
    query: "kebutuhan kios",
    matchers: ["kios", "sembako", "plastik belanja", "nota"],
    mascot: "kios",
    accent: "#5b6f94",
    accentSoft: "#e7eef9",
    accentWarm: "#f7f0e5",
    subcategories: [
      { label: "Plastik Belanja", icon: "store", query: "plastik belanja", matchers: ["plastik belanja"] },
      { label: "Nota & Label", icon: "store", query: "nota label", matchers: ["nota", "label harga"] },
      { label: "Rak Display", icon: "store", query: "rak display", matchers: ["rak display", "rak"] },
    ],
  },
  {
    key: "layanan",
    cluster: "operasional",
    label: "Layanan",
    description: "Konsultasi, pengiriman, dan dukungan transaksi.",
    query: "layanan wiragro",
    matchers: ["layanan", "pengiriman", "tracking"],
    mascot: "layanan",
    accent: "#4d7a6c",
    accentSoft: "#e2f3ed",
    accentWarm: "#f7efe2",
    href: "/kontak",
    subcategories: [
      { label: "Konsultasi Produk", icon: "service", query: "konsultasi produk", matchers: ["konsultasi"], href: "/kontak" },
      { label: "Pengiriman Lokal", icon: "service", query: "pengiriman lokal", matchers: ["pengiriman"], href: "/kontak" },
      { label: "Lacak Pesanan", icon: "service", query: "lacak pesanan", matchers: ["lacak"], href: "/lacak-pesanan" },
    ],
  },
];

function findMatchingCategorySlug(
  categories: Array<{ name: string; slug: string }>,
  matchers: string[],
) {
  return categories.find((category) => {
    const name = category.name.toLowerCase();
    const slug = category.slug.toLowerCase();

    return matchers.some((matcher) => name.includes(matcher) || slug.includes(matcher));
  })?.slug;
}

export function buildStorefrontCategoryHref(
  item: Pick<StorefrontMainCategory, "href" | "query" | "matchers">,
  categories: Array<{ name: string; slug: string }>,
) {
  if (item.href) {
    return item.href;
  }

  const match = findMatchingCategorySlug(categories, item.matchers);
  return match ? `/produk?kategori=${match}` : `/produk?q=${encodeURIComponent(item.query)}`;
}

export function buildStorefrontSubcategoryHref(
  item: StorefrontSubcategory,
  categories: Array<{ name: string; slug: string }>,
) {
  if (item.href) {
    return item.href;
  }

  const match = findMatchingCategorySlug(categories, item.matchers);
  return match ? `/produk?kategori=${match}` : `/produk?q=${encodeURIComponent(item.query)}`;
}
