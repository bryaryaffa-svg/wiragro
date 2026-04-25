export type ArticleTaxonomyAssignments = {
  commodities: string[];
  topics: string[];
  symptoms: string[];
  stages: string[];
  goals: string[];
};

export type ArticleFilterState = {
  q?: string;
  komoditas?: string;
  topik?: string;
  gejala?: string;
  fase?: string;
  tujuan?: string;
};

export type ArticleTaxonomyTerm = {
  slug: string;
  label: string;
  description: string;
};

export type ArticleTaxonomySection = {
  key: keyof ArticleTaxonomyAssignments;
  queryKey: Exclude<keyof ArticleFilterState, "q">;
  title: string;
  description: string;
  items: ArticleTaxonomyTerm[];
};

export type ArticleEnrichmentFields = {
  reading_time_minutes?: number;
  taxonomy?: ArticleTaxonomyAssignments;
  taxonomy_labels?: string[];
  key_takeaways?: string[];
  related_product_queries?: string[];
  related_solution?: {
    href: string;
    label: string;
    description: string;
  };
  related_commodity?: {
    slug: string;
    label: string;
    description: string;
  };
  user_goal_summary?: string;
};

type ArticleSeed = {
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  published_at: string;
  updated_at: string;
  taxonomy: ArticleTaxonomyAssignments;
  key_takeaways: string[];
  related_product_queries: string[];
  related_solution: {
    href: string;
    label: string;
    description: string;
  };
  related_commodity: {
    slug: string;
    label: string;
    description: string;
  };
  user_goal_summary: string;
};

type MinimalArticleRecord = {
  slug: string;
  title: string;
  excerpt?: string | null;
  body_html?: string;
  published_at?: string | null;
  updated_at?: string | null;
};

const COMMODITY_TERMS: ArticleTaxonomyTerm[] = [
  { slug: "padi", label: "Padi", description: "Konten untuk sawah dan tanaman pangan." },
  { slug: "cabai", label: "Cabai", description: "Konten hortikultura intensif dan problem fase." },
  { slug: "jagung", label: "Jagung", description: "Panduan benih, nutrisi, dan ritme tanam jagung." },
  { slug: "sayuran-daun", label: "Sayuran Daun", description: "Konten media, daun, dan pertumbuhan cepat." },
  { slug: "horti-buah", label: "Horti & Buah", description: "Konten pembungaan, pembuahan, dan pemulihan." },
  { slug: "kebun-rumah", label: "Kebun Rumah", description: "Untuk pembaca yang baru memulai dari skala kecil." },
];

const TOPIC_TERMS: ArticleTaxonomyTerm[] = [
  { slug: "pupuk-nutrisi", label: "Pupuk & Nutrisi", description: "Dasar nutrisi dan input utama." },
  { slug: "benih-bibit", label: "Benih & Bibit", description: "Pemilihan benih, bibit, dan fase awal." },
  { slug: "hama-penyakit", label: "Hama & Penyakit", description: "Gejala, tekanan serangan, dan proteksi." },
  { slug: "media-persemaian", label: "Media & Persemaian", description: "Media tanam dan fondasi awal tumbuh." },
  { slug: "fase-budidaya", label: "Fase Budidaya", description: "Tahapan dari semai sampai generatif." },
  { slug: "manajemen-belanja", label: "Manajemen Belanja", description: "Edukasi yang terhubung ke pola belanja." },
];

const SYMPTOM_TERMS: ArticleTaxonomyTerm[] = [
  { slug: "daun-menguning", label: "Daun Menguning", description: "Gejala nutrisi, akar, atau stres." },
  { slug: "hama-daun", label: "Hama Daun", description: "Daun rusak, berlubang, atau keriting." },
  { slug: "pertumbuhan-lambat", label: "Pertumbuhan Lambat", description: "Tanaman tertahan atau stagnan." },
  { slug: "bunga-rontok", label: "Bunga / Buah Rontok", description: "Masalah fase generatif." },
  { slug: "akar-lemah", label: "Akar Lemah", description: "Akar tidak stabil atau media bermasalah." },
];

const STAGE_TERMS: ArticleTaxonomyTerm[] = [
  { slug: "persiapan-lahan", label: "Persiapan Lahan", description: "Tahap awal lahan dan input dasar." },
  { slug: "persemaian", label: "Persemaian", description: "Tahap semai, tray, dan media." },
  { slug: "vegetatif", label: "Vegetatif", description: "Fase daun, batang, dan akar aktif." },
  { slug: "generatif", label: "Generatif", description: "Fase berbunga dan berbuah." },
  { slug: "panen-pascapanen", label: "Panen & Pascapanen", description: "Fase hasil dan operasional lanjut." },
];

const GOAL_TERMS: ArticleTaxonomyTerm[] = [
  { slug: "belajar-dasar", label: "Belajar Dasar", description: "Untuk pembaca yang masih butuh konteks awal." },
  { slug: "atasi-masalah", label: "Atasi Masalah", description: "Untuk pembaca yang datang dengan gejala." },
  { slug: "pilih-produk", label: "Pilih Produk", description: "Untuk pembaca yang ingin mempersempit opsi." },
  { slug: "susun-belanja", label: "Susun Belanja", description: "Untuk pembaca yang ingin pola belanja lebih rapi." },
  { slug: "optimasi-hasil", label: "Optimasi Hasil", description: "Untuk pembaca yang mengejar performa tanam." },
];

export const ARTICLE_TAXONOMY_SECTIONS: ArticleTaxonomySection[] = [
  { key: "commodities", queryKey: "komoditas", title: "Berdasarkan komoditas", description: "Masuk dari tanaman atau usaha tani.", items: COMMODITY_TERMS },
  { key: "topics", queryKey: "topik", title: "Berdasarkan topik", description: "Masuk dari area belajar yang dicari.", items: TOPIC_TERMS },
  { key: "symptoms", queryKey: "gejala", title: "Berdasarkan gejala", description: "Masuk dari masalah lapangan.", items: SYMPTOM_TERMS },
  { key: "stages", queryKey: "fase", title: "Berdasarkan fase tanam", description: "Masuk dari posisi budidaya saat ini.", items: STAGE_TERMS },
  { key: "goals", queryKey: "tujuan", title: "Berdasarkan tujuan", description: "Masuk dari kebutuhan hari ini.", items: GOAL_TERMS },
];

export const ARTICLE_TAXONOMY_SEGMENTS = {
  komoditas: "komoditas",
  topik: "topik",
  gejala: "gejala",
  fase: "fase-tanam",
  tujuan: "tujuan",
} satisfies Record<Exclude<keyof ArticleFilterState, "q">, string>;

const ARTICLE_SEEDS: ArticleSeed[] = [
  {
    slug: "panduan-memilih-pupuk",
    title: "Panduan memilih pupuk sesuai kebutuhan tanaman",
    excerpt: "Mulai dari pemupukan dasar sampai penguatan akar, artikel ini membantu pembeli memilih produk dengan lebih tepat.",
    published_at: "2026-04-02T08:00:00.000Z",
    updated_at: "2026-04-12T08:00:00.000Z",
    body_html:
      "<p>Memilih pupuk yang tepat dimulai dari tujuan aplikasi: membangun akar, mendorong daun, memperbaiki tanah, atau menyiapkan fase generatif.</p><h2>Apa yang perlu dicek</h2><ul><li>Lihat fase tanam dan tujuan aplikasi.</li><li>Periksa kebutuhan lahan dan pola aplikasi.</li><li>Bandingkan bentuk pupuk, dosis, dan kemudahan penggunaan.</li></ul><p>Setelah konteksnya jelas, pembeli baru turun ke katalog untuk membandingkan produk yang masuk akal.</p>",
    taxonomy: {
      commodities: ["padi", "jagung", "sayuran-daun", "horti-buah"],
      topics: ["pupuk-nutrisi"],
      symptoms: ["daun-menguning", "pertumbuhan-lambat", "akar-lemah"],
      stages: ["persiapan-lahan", "vegetatif"],
      goals: ["belajar-dasar", "pilih-produk", "optimasi-hasil"],
    },
    key_takeaways: [
      "Pilih pupuk berdasarkan tujuan aplikasi dan fase tanam.",
      "Jangan langsung membeli hanya karena nama produk familiar.",
      "Masalah nutrisi dasar dan penguatan akar sering butuh pendekatan berbeda.",
    ],
    related_product_queries: ["pupuk", "nutrisi tanaman", "pembenah tanah"],
    related_solution: {
      href: "/solusi/masalah/daun-menguning",
      label: "Cari solusi untuk gejala nutrisi",
      description: "Masuk ke jalur solusi bila masalah tanaman sudah terlihat nyata.",
    },
    related_commodity: {
      slug: "padi",
      label: "Padi dan tanaman pangan",
      description: "Komoditas yang paling sering membutuhkan pemupukan dasar terstruktur.",
    },
    user_goal_summary: "Membantu pembaca memahami dasar pemupukan sebelum membandingkan produk.",
  },
  {
    slug: "dasar-memilih-benih",
    title: "Cara membaca kualitas benih sebelum membeli",
    excerpt: "Panduan cepat untuk menilai benih, varietas, dan hal-hal yang perlu dicek sebelum checkout.",
    published_at: "2026-04-05T08:00:00.000Z",
    updated_at: "2026-04-14T08:00:00.000Z",
    body_html:
      "<p>Benih yang baik bukan hanya soal merek. Pembeli perlu melihat varietas, tujuan tanam, kondisi lahan, dan kesiapan fase awal.</p><h2>Tiga pemeriksaan penting</h2><ol><li>Pastikan varietas cocok dengan komoditas.</li><li>Cek kebutuhan fase awal seperti persemaian dan media.</li><li>Hubungkan pilihan benih dengan input lanjutan agar alur belanja lebih efisien.</li></ol><p>Pembeli sering masuk ke katalog terlalu cepat, lalu bingung memilih benih karena belum punya gambaran langkah setelahnya.</p>",
    taxonomy: {
      commodities: ["cabai", "jagung", "sayuran-daun", "kebun-rumah"],
      topics: ["benih-bibit", "fase-budidaya"],
      symptoms: [],
      stages: ["persemaian", "vegetatif"],
      goals: ["belajar-dasar", "pilih-produk"],
    },
    key_takeaways: [
      "Varietas harus dibaca bersama tujuan tanam dan kondisi lahan.",
      "Benih dan fase awal tidak bisa dipisahkan dari media atau persemaian.",
      "Keputusan beli lebih sehat jika langkah setelah benih dibeli sudah dipahami.",
    ],
    related_product_queries: ["benih", "tray semai", "media tanam"],
    related_solution: {
      href: "/solusi/masalah/semai-rebah",
      label: "Cari solusi fase awal tanaman",
      description: "Gunakan jalur solusi bila masalah muncul sejak semai atau awal tanam.",
    },
    related_commodity: {
      slug: "cabai",
      label: "Cabai",
      description: "Komoditas intensif yang sensitif pada kualitas benih dan fase awal.",
    },
    user_goal_summary: "Mengarahkan pembaca agar lebih paham sebelum membeli benih dan input awal.",
  },
  {
    slug: "daun-menguning-dan-nutrisi-awal",
    title: "Daun menguning: mulai dari cek nutrisi, akar, dan pola air",
    excerpt: "Gejala daun menguning sering membuat pembeli buru-buru beli produk. Artikel ini membantu memeriksa penyebab umum lebih dulu.",
    published_at: "2026-04-10T08:00:00.000Z",
    updated_at: "2026-04-18T08:00:00.000Z",
    body_html:
      "<p>Daun menguning adalah gejala, bukan diagnosis akhir. Penyebabnya bisa datang dari nutrisi, akar, media, pola air, atau stres lingkungan.</p><h2>Urutan pemeriksaan yang aman</h2><ol><li>Cek media dan kelembapan akar.</li><li>Nilai kebutuhan nutrisi dasar.</li><li>Baru bandingkan apakah perlu pupuk, pembenah tanah, atau nutrisi tambahan.</li></ol><p>Produk baru masuk akal dipertimbangkan setelah dugaan penyebabnya cukup kuat.</p>",
    taxonomy: {
      commodities: ["cabai", "sayuran-daun", "horti-buah"],
      topics: ["pupuk-nutrisi", "hama-penyakit"],
      symptoms: ["daun-menguning", "akar-lemah", "pertumbuhan-lambat"],
      stages: ["vegetatif"],
      goals: ["atasi-masalah", "pilih-produk"],
    },
    key_takeaways: [
      "Daun menguning perlu dibaca sebagai gejala, bukan keputusan beli instan.",
      "Akar, media, dan pola air perlu dicek sebelum memilih input baru.",
      "Solusi yang tepat sering merupakan kombinasi diagnosis dan produk.",
    ],
    related_product_queries: ["pupuk", "nutrisi daun", "pembenah tanah"],
    related_solution: {
      href: "/solusi/masalah/daun-menguning",
      label: "Cari solusi daun menguning",
      description: "Masuk ke jalur solusi untuk memetakan gejala sebelum turun ke katalog.",
    },
    related_commodity: {
      slug: "sayuran-daun",
      label: "Sayuran daun",
      description: "Komoditas yang cepat menunjukkan gejala nutrisi dan stres media.",
    },
    user_goal_summary: "Membantu pembaca yang datang dengan masalah nyata agar tidak langsung salah beli.",
  },
  {
    slug: "pengendalian-hama-awal-yang-lebih-tenang",
    title: "Pengendalian hama awal yang lebih tenang dan tidak reaktif",
    excerpt: "Saat daun mulai rusak atau serangga terlihat, pembeli butuh langkah awal yang jelas sebelum memilih proteksi.",
    published_at: "2026-04-12T08:00:00.000Z",
    updated_at: "2026-04-19T08:00:00.000Z",
    body_html:
      "<p>Masalah hama sering mendorong pembeli membeli proteksi terlalu cepat. Langkah awal terbaik dimulai dari identifikasi gejala dan tingkat serangan.</p><h2>Prinsip awal</h2><ul><li>Pastikan gejala benar-benar serangan hama.</li><li>Catat bagian tanaman yang terdampak paling dulu.</li><li>Sesuaikan pilihan proteksi dengan intensitas masalah dan alat aplikasi.</li></ul><p>Artikel edukasi seperti ini membantu memilih proteksi dengan lebih masuk akal dan mencegah pembelian berlebihan.</p>",
    taxonomy: {
      commodities: ["cabai", "horti-buah", "sayuran-daun"],
      topics: ["hama-penyakit"],
      symptoms: ["hama-daun", "pertumbuhan-lambat"],
      stages: ["vegetatif", "generatif"],
      goals: ["atasi-masalah", "pilih-produk"],
    },
    key_takeaways: [
      "Identifikasi gejala harus didahulukan sebelum memilih proteksi.",
      "Tingkat serangan memengaruhi keputusan produk dan alat aplikasi.",
      "Konten solusi membantu mengurangi pembelian yang reaktif.",
    ],
    related_product_queries: ["pestisida", "sprayer", "fungisida"],
    related_solution: {
      href: "/solusi/masalah/hama-daun",
      label: "Masuk ke jalur solusi hama",
      description: "Gunakan layer solusi untuk menyaring tindakan awal sebelum memilih proteksi.",
    },
    related_commodity: {
      slug: "cabai",
      label: "Cabai",
      description: "Komoditas dengan tekanan hama dan penyakit yang sering tinggi di lapangan.",
    },
    user_goal_summary: "Memandu pembaca dari gejala hama ke pilihan proteksi yang lebih terukur.",
  },
  {
    slug: "fase-tanam-cabai-dari-semai-sampai-berbuah",
    title: "Fase tanam cabai: dari semai sampai berbuah dengan ritme input yang lebih jelas",
    excerpt: "Cabai sering membuat pembeli bingung kapan fokus ke media, nutrisi, proteksi, atau booster. Artikel ini menyusun alurnya.",
    published_at: "2026-04-14T08:00:00.000Z",
    updated_at: "2026-04-20T08:00:00.000Z",
    body_html:
      "<p>Cabai adalah komoditas yang menuntut ritme keputusan yang lebih tertib. Input di fase semai sangat berbeda dari kebutuhan saat generatif.</p><h2>Pembacaan per fase</h2><ul><li>Persemaian: fokus kestabilan media, tray, dan kelembapan.</li><li>Vegetatif: perhatikan daun, akar, dan pertumbuhan batang.</li><li>Generatif: jaga pembungaan, pembuahan, dan kestabilan nutrisi.</li></ul><p>Dengan struktur fase, pembeli lebih mudah memahami kenapa satu produk cocok sekarang tetapi belum tentu cocok di fase berikutnya.</p>",
    taxonomy: {
      commodities: ["cabai"],
      topics: ["fase-budidaya", "benih-bibit", "pupuk-nutrisi"],
      symptoms: ["pertumbuhan-lambat", "bunga-rontok"],
      stages: ["persemaian", "vegetatif", "generatif"],
      goals: ["belajar-dasar", "optimasi-hasil", "pilih-produk"],
    },
    key_takeaways: [
      "Cabai perlu dibaca per fase, bukan hanya per masalah.",
      "Kebutuhan di persemaian, vegetatif, dan generatif tidak sama.",
      "Pembeli akan lebih siap memilih produk jika ritme fase sudah dipahami.",
    ],
    related_product_queries: ["benih cabai", "media tanam", "booster buah", "pestisida"],
    related_solution: {
      href: "/solusi/masalah/bunga-rontok-dan-buah-tidak-jadi",
      label: "Cari solusi untuk cabai",
      description: "Masuk ke jalur solusi jika fase tanam cabai sudah terganggu oleh gejala tertentu.",
    },
    related_commodity: {
      slug: "cabai",
      label: "Cabai",
      description: "Komoditas populer yang paling cocok dibaca dengan pendekatan fase.",
    },
    user_goal_summary: "Membantu pembaca melihat komoditas dan fase sebagai konteks keputusan.",
  },
];

const TAXONOMY_LOOKUP = new Map(
  ARTICLE_TAXONOMY_SECTIONS.flatMap((section) =>
    section.items.map((item) => [`${section.key}:${item.slug}`, item.label] as const),
  ),
);

function stripHtml(input?: string | null) {
  return (input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncateText(input: string, maxLength = 180) {
  if (input.length <= maxLength) {
    return input;
  }

  return `${input.slice(0, maxLength - 3).trimEnd()}...`;
}

function readingTimeFor(bodyHtml?: string) {
  const words = stripHtml(bodyHtml).split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.ceil(words / 180));
}

function orderByNewest<T extends { published_at?: string | null; updated_at?: string | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftDate = new Date(left.updated_at ?? left.published_at ?? 0).getTime();
    const rightDate = new Date(right.updated_at ?? right.published_at ?? 0).getTime();
    return rightDate - leftDate;
  });
}

function labelForTerm(key: keyof ArticleTaxonomyAssignments, slug: string) {
  return TAXONOMY_LOOKUP.get(`${key}:${slug}`) ?? slug;
}

function inferTaxonomy(record: MinimalArticleRecord): ArticleTaxonomyAssignments {
  const haystack = `${record.slug} ${record.title} ${record.excerpt ?? ""} ${stripHtml(record.body_html)}`.toLowerCase();
  const inferTerms = (terms: ArticleTaxonomyTerm[]) =>
    terms
      .filter((term) => haystack.includes(term.slug.replace(/-/g, " ")) || haystack.includes(term.label.toLowerCase()))
      .map((term) => term.slug);

  return {
    commodities: inferTerms(COMMODITY_TERMS),
    topics: inferTerms(TOPIC_TERMS),
    symptoms: inferTerms(SYMPTOM_TERMS),
    stages: inferTerms(STAGE_TERMS),
    goals: inferTerms(GOAL_TERMS),
  };
}

function defaultSolutionFor(record: MinimalArticleRecord) {
  return {
    href: "/solusi",
    label: "Buka jalur solusi",
    description: `Pindahkan pembaca dari insight "${record.title}" ke langkah problem-solving yang lebih praktis.`,
  };
}

function defaultCommodityFor(taxonomy: ArticleTaxonomyAssignments) {
  const primary = taxonomy.commodities[0];
  const term = COMMODITY_TERMS.find((item) => item.slug === primary);
  return {
    slug: primary ?? "kebun-rumah",
    label: term?.label ?? "Kebun Rumah",
    description: term?.description ?? "Komoditas terkait untuk memperdalam konteks pembaca.",
  };
}

function defaultGoalSummary(record: MinimalArticleRecord) {
  return `Membantu pembaca memahami "${record.title.toLowerCase()}" sebelum bergerak ke solusi atau produk.`;
}

function enrichBaseArticle<T extends MinimalArticleRecord>(
  record: T,
  override?: Partial<ArticleSeed>,
): T & ArticleEnrichmentFields {
  const taxonomy = override?.taxonomy ?? inferTaxonomy(record);
  const labels = ARTICLE_TAXONOMY_SECTIONS.flatMap((section) =>
    taxonomy[section.key].slice(0, 1).map((slug) => labelForTerm(section.key, slug)),
  );

  return {
    ...record,
    reading_time_minutes: readingTimeFor(record.body_html),
    taxonomy,
    taxonomy_labels: labels,
    key_takeaways:
      override?.key_takeaways ??
      [
        `Pahami konteks "${record.title.toLowerCase()}" sebelum mengambil keputusan berikutnya.`,
        "Gunakan artikel ini sebagai jembatan ke solusi atau produk yang lebih relevan.",
      ],
    related_product_queries:
      override?.related_product_queries ??
      taxonomy.topics.map((topic) => labelForTerm("topics", topic)).slice(0, 2),
    related_solution: override?.related_solution ?? defaultSolutionFor(record),
    related_commodity: override?.related_commodity ?? defaultCommodityFor(taxonomy),
    user_goal_summary: override?.user_goal_summary ?? defaultGoalSummary(record),
  };
}

export function getFallbackArticleSummaries() {
  return orderByNewest(
    ARTICLE_SEEDS.map((seed) =>
      enrichBaseArticle(
        {
          slug: seed.slug,
          title: seed.title,
          excerpt: seed.excerpt,
          published_at: seed.published_at,
          updated_at: seed.updated_at,
        },
        seed,
      ),
    ),
  );
}

export function getFallbackArticleBySlug(slug: string) {
  const seed = ARTICLE_SEEDS.find((item) => item.slug === slug);

  if (!seed) {
    return null;
  }

  return enrichBaseArticle(
    {
      slug: seed.slug,
      title: seed.title,
      excerpt: seed.excerpt,
      body_html: seed.body_html,
      published_at: seed.published_at,
      updated_at: seed.updated_at,
    },
    seed,
  );
}

export function enrichArticleSummary<T extends MinimalArticleRecord>(record: T) {
  const seed = ARTICLE_SEEDS.find((item) => item.slug === record.slug);
  return enrichBaseArticle(
    {
      ...record,
      excerpt: record.excerpt ?? seed?.excerpt ?? truncateText(stripHtml(record.body_html)),
      published_at: record.published_at ?? seed?.published_at ?? null,
      updated_at: record.updated_at ?? seed?.updated_at ?? record.published_at ?? null,
    },
    seed,
  );
}

export function enrichArticleDetail<T extends MinimalArticleRecord & { body_html: string }>(record: T) {
  const seed = ARTICLE_SEEDS.find((item) => item.slug === record.slug);
  return enrichBaseArticle(
    {
      ...record,
      excerpt: record.excerpt ?? seed?.excerpt ?? truncateText(stripHtml(record.body_html)),
      body_html: record.body_html || seed?.body_html || "<p>Konten artikel sedang diperbarui.</p>",
      published_at: record.published_at ?? seed?.published_at ?? null,
      updated_at: record.updated_at ?? seed?.updated_at ?? record.published_at ?? null,
    },
    seed,
  );
}

export function mergeArticleSummaries<T extends MinimalArticleRecord>(remoteItems: T[]) {
  const merged = new Map<string, MinimalArticleRecord>();

  for (const item of getFallbackArticleSummaries()) {
    merged.set(item.slug, item);
  }

  for (const item of remoteItems) {
    const current = merged.get(item.slug);
    merged.set(item.slug, {
      ...current,
      ...item,
      excerpt: item.excerpt ?? current?.excerpt,
      published_at: item.published_at ?? current?.published_at,
      updated_at: item.updated_at ?? current?.updated_at,
    });
  }

  return orderByNewest([...merged.values()].map((item) => enrichArticleSummary(item)));
}

function matchesTaxonomy(
  article: ArticleEnrichmentFields,
  key: keyof ArticleTaxonomyAssignments,
  value?: string,
) {
  if (!value) {
    return true;
  }

  return article.taxonomy?.[key].includes(value) ?? false;
}

export function filterArticlesByState<T extends MinimalArticleRecord & ArticleEnrichmentFields>(
  articles: T[],
  state: ArticleFilterState,
) {
  const query = state.q?.trim().toLowerCase();

  return articles.filter((article) => {
    const haystack = [
      article.title,
      article.excerpt ?? "",
      ...(article.taxonomy_labels ?? []),
      article.user_goal_summary ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!query || haystack.includes(query)) &&
      matchesTaxonomy(article, "commodities", state.komoditas) &&
      matchesTaxonomy(article, "topics", state.topik) &&
      matchesTaxonomy(article, "symptoms", state.gejala) &&
      matchesTaxonomy(article, "stages", state.fase) &&
      matchesTaxonomy(article, "goals", state.tujuan)
    );
  });
}

export function getRelatedArticles<T extends MinimalArticleRecord & ArticleEnrichmentFields>(
  current: T,
  pool: T[],
  limit = 3,
) {
  const axes: Array<keyof ArticleTaxonomyAssignments> = [
    "commodities",
    "topics",
    "symptoms",
    "stages",
    "goals",
  ];

  return pool
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({
      candidate,
      score: axes.reduce((score, key) => {
        const currentTerms = current.taxonomy?.[key] ?? [];
        const candidateTerms = candidate.taxonomy?.[key] ?? [];
        return score + currentTerms.filter((term) => candidateTerms.includes(term)).length;
      }, 0),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}

export function buildArticleFilterHref(
  current: ArticleFilterState,
  key: Exclude<keyof ArticleFilterState, "q">,
  value?: string,
) {
  const params = new URLSearchParams();

  if (current.q) {
    params.set("q", current.q);
  }

  for (const filterKey of ["komoditas", "topik", "gejala", "fase", "tujuan"] as const) {
    const nextValue = filterKey === key ? value : current[filterKey];
    if (nextValue) {
      params.set(filterKey, nextValue);
    }
  }

  const query = params.toString();
  return query ? `/artikel?${query}` : "/artikel";
}

export function buildResetArticleFiltersHref(current: ArticleFilterState) {
  const params = new URLSearchParams();
  if (current.q) {
    params.set("q", current.q);
  }
  const query = params.toString();
  return query ? `/artikel?${query}` : "/artikel";
}

export function getArticleTaxonomySection(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
) {
  return ARTICLE_TAXONOMY_SECTIONS.find((section) => section.queryKey === queryKey) ?? null;
}

export function getArticleTaxonomySegment(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
) {
  return ARTICLE_TAXONOMY_SEGMENTS[queryKey];
}

export function getArticleTaxonomySectionBySegment(segment: string) {
  const matched = (
    Object.entries(ARTICLE_TAXONOMY_SEGMENTS) as Array<
      [Exclude<keyof ArticleFilterState, "q">, string]
    >
  ).find(([, value]) => value === segment);

  return matched ? getArticleTaxonomySection(matched[0]) : null;
}

export function getArticleTaxonomyTerm(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
  slug: string,
) {
  return getArticleTaxonomySection(queryKey)?.items.find((item) => item.slug === slug) ?? null;
}

export function getArticleTaxonomyTermBySegment(segment: string, slug: string) {
  const section = getArticleTaxonomySectionBySegment(segment);
  return section?.items.find((item) => item.slug === slug) ?? null;
}

export function buildArticleTaxonomyBrowseHref(
  queryKey: Exclude<keyof ArticleFilterState, "q">,
  slug?: string,
) {
  const segment = getArticleTaxonomySegment(queryKey);
  return slug ? `/belajar/${segment}/${slug}` : `/belajar/${segment}`;
}

export function getAvailableArticleTaxonomySlugs<
  T extends MinimalArticleRecord & ArticleEnrichmentFields,
>(articles: T[]) {
  const availability = {
    komoditas: new Set<string>(),
    topik: new Set<string>(),
    gejala: new Set<string>(),
    fase: new Set<string>(),
    tujuan: new Set<string>(),
  } satisfies Record<Exclude<keyof ArticleFilterState, "q">, Set<string>>;

  for (const article of articles) {
    for (const section of ARTICLE_TAXONOMY_SECTIONS) {
      for (const slug of article.taxonomy?.[section.key] ?? []) {
        availability[section.queryKey].add(slug);
      }
    }
  }

  return {
    komoditas: [...availability.komoditas],
    topik: [...availability.topik],
    gejala: [...availability.gejala],
    fase: [...availability.fase],
    tujuan: [...availability.tujuan],
  } satisfies Record<Exclude<keyof ArticleFilterState, "q">, string[]>;
}

export function getActiveArticleFilters(state: ArticleFilterState) {
  return ARTICLE_TAXONOMY_SECTIONS.flatMap((section) => {
    const activeSlug = state[section.queryKey];
    if (!activeSlug) {
      return [];
    }

    const term = section.items.find((item) => item.slug === activeSlug);
    return term
      ? [
          {
            key: section.queryKey,
            label: term.label,
          },
        ]
      : [];
  });
}

export function buildArticleTaxonomyLinks(article: ArticleEnrichmentFields) {
  return ARTICLE_TAXONOMY_SECTIONS.flatMap((section) =>
    (article.taxonomy?.[section.key] ?? []).slice(0, 2).map((slug) => {
      const term = section.items.find((item) => item.slug === slug);
      return {
        label: term?.label ?? slug,
        href: buildArticleTaxonomyBrowseHref(section.queryKey, slug),
      };
    }),
  );
}
