export type SolutionTaxonomyAssignments = {
  symptoms: string[];
  pests: string[];
  diseases: string[];
  stages: string[];
  commodities: string[];
};

export type SolutionFilterState = {
  q?: string;
  gejala?: string;
  hama?: string;
  penyakit?: string;
  fase?: string;
  komoditas?: string;
};

export type SolutionTaxonomyTerm = {
  slug: string;
  label: string;
  description: string;
};

export type SolutionTaxonomySection = {
  key: keyof SolutionTaxonomyAssignments;
  queryKey: Exclude<keyof SolutionFilterState, "q">;
  title: string;
  description: string;
  items: SolutionTaxonomyTerm[];
};

export type SolutionRecord = {
  slug: string;
  title: string;
  excerpt: string;
  symptom_summary: string;
  probable_causes: string[];
  verification_steps: string[];
  action_steps: string[];
  caution_note: string;
  related_article_slugs: string[];
  related_product_queries: string[];
  taxonomy: SolutionTaxonomyAssignments;
  published_at: string;
  updated_at: string;
};

export type SolutionSummary = SolutionRecord & {
  taxonomy_labels: string[];
};

const SYMPTOM_TERMS: SolutionTaxonomyTerm[] = [
  { slug: "daun-menguning", label: "Daun Menguning", description: "Masalah warna daun dan tanaman melemah." },
  { slug: "daun-berlubang", label: "Daun Berlubang", description: "Serangan daun yang terlihat cepat." },
  { slug: "pertumbuhan-lambat", label: "Pertumbuhan Lambat", description: "Tanaman stagnan pada fase awal atau vegetatif." },
  { slug: "bunga-rontok", label: "Bunga atau Buah Rontok", description: "Masalah fase generatif dan pembentukan hasil." },
  { slug: "bercak-daun", label: "Bercak Daun", description: "Permukaan daun menunjukkan noda atau lesi." },
  { slug: "layu-mendadak", label: "Layu Mendadak", description: "Tanaman tiba-tiba lemas atau roboh." },
  { slug: "semai-rebah", label: "Semai Rebah", description: "Bibit muda rubuh pada fase persemaian." },
  { slug: "akar-lemah", label: "Akar Lemah", description: "Masalah media, akar, dan penyerapan." },
];

const PEST_TERMS: SolutionTaxonomyTerm[] = [
  { slug: "kutu-daun", label: "Kutu Daun", description: "Serangan kecil yang cepat menyebar." },
  { slug: "ulat", label: "Ulat", description: "Kerusakan daun dan jaringan tanaman." },
  { slug: "thrips", label: "Thrips", description: "Sering muncul pada horti dan fase sensitif." },
  { slug: "lalat-buah", label: "Lalat Buah", description: "Mengganggu pembentukan hasil pada fase generatif." },
];

const DISEASE_TERMS: SolutionTaxonomyTerm[] = [
  { slug: "jamur-daun", label: "Jamur Daun", description: "Gejala bercak dan lapisan penyakit pada daun." },
  { slug: "busuk-akar", label: "Busuk Akar", description: "Akar lembek, media jenuh, dan tanaman cepat turun." },
  { slug: "rebah-semai", label: "Rebah Semai", description: "Penyakit umum pada persemaian dan bibit muda." },
  { slug: "layu-bakteri", label: "Layu Bakteri", description: "Layu cepat yang perlu dibedakan dari kekurangan air." },
];

const STAGE_TERMS: SolutionTaxonomyTerm[] = [
  { slug: "persemaian", label: "Persemaian", description: "Fase bibit dan awal pertumbuhan." },
  { slug: "awal-tanam", label: "Awal Tanam", description: "Transisi tanam dan adaptasi awal." },
  { slug: "vegetatif", label: "Vegetatif", description: "Fase pertumbuhan daun dan batang." },
  { slug: "generatif", label: "Generatif", description: "Fase bunga, buah, dan pembentukan hasil." },
];

const COMMODITY_TERMS: SolutionTaxonomyTerm[] = [
  { slug: "padi", label: "Padi", description: "Masalah umum pada komoditas sawah dan pangan." },
  { slug: "cabai", label: "Cabai", description: "Komoditas intensif dengan banyak gejala spesifik." },
  { slug: "jagung", label: "Jagung", description: "Fokus pada fase awal dan vegetatif." },
  { slug: "sayuran-daun", label: "Sayuran Daun", description: "Sensitif pada media, daun, dan kelembapan." },
  { slug: "horti-buah", label: "Horti & Buah", description: "Masalah generatif dan pembentukan hasil." },
  { slug: "kebun-rumah", label: "Kebun Rumah", description: "Untuk pengunjung yang butuh solusi sederhana dan aman." },
];

export const SOLUTION_TAXONOMY_SECTIONS: SolutionTaxonomySection[] = [
  { key: "symptoms", queryKey: "gejala", title: "Berdasarkan gejala", description: "Mulai dari apa yang terlihat di lapangan.", items: SYMPTOM_TERMS },
  { key: "pests", queryKey: "hama", title: "Berdasarkan hama", description: "Pisahkan serangan organisme pengganggu.", items: PEST_TERMS },
  { key: "diseases", queryKey: "penyakit", title: "Berdasarkan penyakit", description: "Bantu pengunjung membedakan pola penyakit umum.", items: DISEASE_TERMS },
  { key: "stages", queryKey: "fase", title: "Berdasarkan fase tanam", description: "Masalah pada fase berbeda perlu tindakan berbeda.", items: STAGE_TERMS },
  { key: "commodities", queryKey: "komoditas", title: "Berdasarkan komoditas", description: "Masuk dari tanaman yang sedang dibudidayakan.", items: COMMODITY_TERMS },
];

export const SOLUTION_TAXONOMY_SEGMENTS = {
  gejala: "gejala",
  hama: "hama",
  penyakit: "penyakit",
  fase: "fase",
  komoditas: "komoditas",
} satisfies Record<Exclude<keyof SolutionFilterState, "q">, string>;

const solutionSeeds: SolutionRecord[] = [
  {
    slug: "daun-menguning",
    title: "Daun menguning dan tanaman mulai melemah",
    excerpt: "Mulai dari gejala, cek akar, nutrisi, dan pola air sebelum buru-buru membeli input tambahan.",
    symptom_summary: "Gejala umum: daun memucat atau menguning, pertumbuhan melambat, dan tanaman tampak stres.",
    probable_causes: [
      "Nutrisi dasar belum seimbang atau ritme aplikasi terlalu jarang.",
      "Media terlalu basah atau terlalu padat sehingga akar tidak sehat.",
      "Transisi fase tanam membuat tanaman sulit menyerap nutrisi secara stabil.",
    ],
    verification_steps: [
      "Bandingkan daun tua dan daun muda untuk melihat pola gejalanya.",
      "Periksa kelembapan media dan kondisi akar pada beberapa titik tanaman.",
      "Lihat kembali ritme pemupukan, jenis input, dan perubahan pola air beberapa hari terakhir.",
    ],
    action_steps: [
      "Stabilkan pengairan dan hindari perubahan pola air yang terlalu ekstrem.",
      "Perbaiki media atau drainase bila akar terlihat terganggu.",
      "Baru arahkan ke nutrisi atau pembenah tanah yang relevan setelah penyebab utama lebih jelas.",
    ],
    caution_note: "Daun menguning adalah gejala, bukan diagnosis final. Hindari membeli produk terlalu cepat tanpa memeriksa akar dan media.",
    related_article_slugs: ["daun-menguning-dan-nutrisi-awal", "panduan-memilih-pupuk"],
    related_product_queries: ["pupuk", "nutrisi tanaman", "pembenah tanah"],
    taxonomy: {
      symptoms: ["daun-menguning", "akar-lemah"],
      pests: [],
      diseases: ["busuk-akar"],
      stages: ["awal-tanam", "vegetatif"],
      commodities: ["cabai", "sayuran-daun", "kebun-rumah"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
  {
    slug: "hama-daun",
    title: "Daun rusak, berlubang, atau ada tanda serangan hama",
    excerpt: "Pisahkan dulu gejala hama dari penyakit, lalu cocokkan tingkat serangan dengan tindakan awal yang masuk akal.",
    symptom_summary: "Gejala umum: daun bolong, bagian pucuk rusak, atau ada hama kecil yang cepat menyebar.",
    probable_causes: [
      "Serangan kutu, ulat, atau thrips pada fase vegetatif hingga generatif.",
      "Kebersihan area tanam dan ritme monitoring lapangan belum konsisten.",
      "Tingkat serangan meningkat karena tanaman sudah stres lebih dulu.",
    ],
    verification_steps: [
      "Amati bagian bawah daun, pucuk, dan area yang paling cepat rusak.",
      "Catat apakah gejala muncul merata atau hanya pada beberapa titik serangan.",
      "Bedakan bekas gigitan, koloni hama, dan gejala yang lebih mirip penyakit daun.",
    ],
    action_steps: [
      "Mulai dari sanitasi ringan dan monitoring area paling terdampak.",
      "Pisahkan tindakan untuk serangan ringan dan serangan yang sudah menyebar.",
      "Jika butuh proteksi, pilih produk dan alat aplikasi yang sesuai dengan skala masalah.",
    ],
    caution_note: "Jangan langsung menyamakan semua daun rusak sebagai masalah yang butuh pestisida. Intensitas dan jenis serangan perlu dicek lebih dulu.",
    related_article_slugs: ["pengendalian-hama-awal-yang-lebih-tenang"],
    related_product_queries: ["pestisida", "insektisida", "sprayer"],
    taxonomy: {
      symptoms: ["daun-berlubang"],
      pests: ["kutu-daun", "ulat", "thrips"],
      diseases: [],
      stages: ["vegetatif", "generatif"],
      commodities: ["cabai", "sayuran-daun", "horti-buah"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
  {
    slug: "semai-rebah",
    title: "Bibit semai rebah atau cepat turun di fase awal",
    excerpt: "Masalah persemaian perlu dibaca dari media, kepadatan, dan kelembapan sebelum fokus ke input tambahan.",
    symptom_summary: "Gejala umum: bibit muda rubuh, pangkal lemah, atau pertumbuhan berhenti sangat dini.",
    probable_causes: [
      "Media terlalu lembap dan sirkulasi udara di area semai kurang baik.",
      "Penyakit rebah semai berkembang pada kepadatan bibit yang terlalu tinggi.",
      "Benih dan media awal belum ditangani dengan disiplin yang cukup.",
    ],
    verification_steps: [
      "Periksa pangkal batang dan permukaan media pada tray atau bedeng semai.",
      "Bandingkan bibit yang rubuh dengan bibit yang masih sehat untuk melihat pola persebaran.",
      "Lihat kembali kepadatan semai, ritme penyiraman, dan kebersihan area persemaian.",
    ],
    action_steps: [
      "Kurangi kelembapan berlebih dan perbaiki sirkulasi area semai.",
      "Rapikan jarak bibit dan singkirkan semai yang sudah terlalu parah.",
      "Bila perlu, pilih media, tray, atau proteksi awal yang lebih sesuai untuk persemaian berikutnya.",
    ],
    caution_note: "Pada fase semai, tindakan yang terlalu keras bisa memperburuk kondisi. Fokus dulu pada lingkungan semai, bukan sekadar menambah input.",
    related_article_slugs: ["dasar-memilih-benih"],
    related_product_queries: ["tray semai", "media tanam", "fungisida"],
    taxonomy: {
      symptoms: ["semai-rebah", "layu-mendadak"],
      pests: [],
      diseases: ["rebah-semai"],
      stages: ["persemaian"],
      commodities: ["cabai", "sayuran-daun", "kebun-rumah"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
  {
    slug: "pertumbuhan-lambat",
    title: "Pertumbuhan lambat pada fase awal sampai vegetatif",
    excerpt: "Gunakan jalur solusi ini untuk memeriksa ritme awal tanam, nutrisi dasar, dan kondisi akar sebelum mengambil keputusan belanja.",
    symptom_summary: "Gejala umum: tanaman stagnan, daun kecil, dan respons pertumbuhan tertahan.",
    probable_causes: [
      "Nutrisi awal belum cukup menopang ritme pertumbuhan tanaman.",
      "Akar belum pulih setelah tanam atau media kurang mendukung.",
      "Fase awal tanam tidak didukung pengairan dan pengamatan yang konsisten.",
    ],
    verification_steps: [
      "Bandingkan ukuran tanaman antar petak atau batch tanam yang berbeda.",
      "Cek akar, media, dan kondisi drainase di titik yang pertumbuhannya paling lambat.",
      "Tinjau ulang jadwal aplikasi dasar dan perubahan kondisi cuaca beberapa hari terakhir.",
    ],
    action_steps: [
      "Stabilkan fase awal dengan pengamatan yang lebih rutin.",
      "Perbaiki fondasi media dan ritme input dasar sebelum menambah booster.",
      "Setelah masalah dasar lebih jelas, pilih nutrisi atau pendamping pertumbuhan yang memang relevan.",
    ],
    caution_note: "Pertumbuhan lambat sering membuat pembeli tergoda membeli booster terlalu cepat. Pastikan faktor dasar fase awal sudah diperiksa.",
    related_article_slugs: ["panduan-memilih-pupuk", "fase-tanam-cabai-dari-semai-sampai-berbuah"],
    related_product_queries: ["pupuk", "nutrisi daun", "benih"],
    taxonomy: {
      symptoms: ["pertumbuhan-lambat"],
      pests: [],
      diseases: [],
      stages: ["awal-tanam", "vegetatif"],
      commodities: ["padi", "jagung", "cabai"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
  {
    slug: "bunga-rontok-dan-buah-tidak-jadi",
    title: "Bunga rontok atau buah tidak jadi pada fase generatif",
    excerpt: "Masuk dari fase generatif agar pengunjung memahami stres tanaman, ritme nutrisi, dan langkah koreksi sebelum memilih produk pendukung.",
    symptom_summary: "Gejala umum: bunga banyak gugur, pembentukan buah lemah, atau hasil tidak berkembang stabil.",
    probable_causes: [
      "Tanaman stres pada fase generatif akibat air, cuaca, atau akar yang belum stabil.",
      "Keseimbangan nutrisi fase generatif belum mendukung pembungaan dan pembentukan buah.",
      "Serangan ringan hama atau penyakit ikut mengganggu hasil tanpa langsung terlihat berat.",
    ],
    verification_steps: [
      "Catat kapan bunga mulai rontok dan pada fase apa gejalanya meningkat.",
      "Periksa kondisi daun, akar, dan tanda serangan ringan yang bisa mengganggu pembentukan hasil.",
      "Bandingkan aplikasi input generatif dengan kondisi cuaca dan kelembapan lapangan.",
    ],
    action_steps: [
      "Stabilkan kondisi air dan hindari perubahan mendadak saat fase generatif.",
      "Pastikan fondasi nutrisi dan kesehatan tanaman cukup sebelum menambah booster hasil.",
      "Jika perlu produk pendukung, pilih yang sesuai fase dan komoditas, bukan sekadar yang paling populer.",
    ],
    caution_note: "Masalah generatif jarang punya satu penyebab tunggal. Fokus pada verifikasi fase dan kestabilan tanaman sebelum menambah input.",
    related_article_slugs: ["fase-tanam-cabai-dari-semai-sampai-berbuah"],
    related_product_queries: ["booster buah", "nutrisi tanaman", "fungisida"],
    taxonomy: {
      symptoms: ["bunga-rontok"],
      pests: ["thrips", "lalat-buah"],
      diseases: ["jamur-daun"],
      stages: ["generatif"],
      commodities: ["cabai", "horti-buah"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
  {
    slug: "bercak-daun-dan-gejala-jamur",
    title: "Bercak daun dan indikasi penyakit daun",
    excerpt: "Gunakan jalur ini untuk membedakan gejala daun karena penyakit, kelembapan, atau masalah lain sebelum memilih proteksi.",
    symptom_summary: "Gejala umum: noda, bercak, perubahan tekstur, atau gejala menyebar pada permukaan daun.",
    probable_causes: [
      "Kelembapan tinggi membuat penyakit daun berkembang lebih cepat.",
      "Pola sirkulasi dan sanitasi lahan belum cukup menahan persebaran.",
      "Gejala daun bercampur dengan stres nutrisi atau kondisi lingkungan lain.",
    ],
    verification_steps: [
      "Foto beberapa sampel daun dari bagian yang paling awal terdampak.",
      "Periksa apakah bercak muncul acak atau mengikuti pola kelembapan area tertentu.",
      "Bandingkan kondisi daun dengan riwayat hujan, embun, dan ritme aplikasi sebelumnya.",
    ],
    action_steps: [
      "Kurangi kondisi yang menjaga kelembapan terlalu lama di area tanaman.",
      "Pisahkan daun yang sudah parah bila sanitasi memungkinkan.",
      "Bila proteksi dibutuhkan, pilih produk yang relevan setelah pola penyakit lebih jelas.",
    ],
    caution_note: "Tidak semua bercak daun butuh tindakan proteksi berat. Verifikasi pola gejala lebih dulu agar tindakan lebih tepat.",
    related_article_slugs: ["pengendalian-hama-awal-yang-lebih-tenang", "daun-menguning-dan-nutrisi-awal"],
    related_product_queries: ["fungisida", "sprayer", "pembenah tanah"],
    taxonomy: {
      symptoms: ["bercak-daun", "layu-mendadak"],
      pests: [],
      diseases: ["jamur-daun", "layu-bakteri"],
      stages: ["vegetatif", "generatif"],
      commodities: ["cabai", "sayuran-daun", "horti-buah"],
    },
    published_at: "2026-04-23T00:00:00.000Z",
    updated_at: "2026-04-23T00:00:00.000Z",
  },
];

function buildTaxonomyLabels(taxonomy: SolutionTaxonomyAssignments) {
  return SOLUTION_TAXONOMY_SECTIONS.flatMap((section) =>
    section.items
      .filter((item) => taxonomy[section.key].includes(item.slug))
      .map((item) => item.label),
  );
}

export function getAllSolutions(): SolutionSummary[] {
  return solutionSeeds.map((solution) => ({
    ...solution,
    taxonomy_labels: buildTaxonomyLabels(solution.taxonomy),
  }));
}

export function getSolutionBySlug(slug: string): SolutionSummary | null {
  return getAllSolutions().find((solution) => solution.slug === slug) ?? null;
}

function findLabel(queryKey: Exclude<keyof SolutionFilterState, "q">, value: string) {
  const section = SOLUTION_TAXONOMY_SECTIONS.find((item) => item.queryKey === queryKey);
  return section?.items.find((item) => item.slug === value)?.label ?? value;
}

function matchesTaxonomy(
  solution: SolutionSummary,
  key: keyof SolutionTaxonomyAssignments,
  value?: string,
) {
  if (!value) {
    return true;
  }

  return solution.taxonomy[key].includes(value);
}

export function filterSolutionsByState(
  solutions: SolutionSummary[],
  state: SolutionFilterState,
) {
  const keyword = state.q?.trim().toLowerCase();

  return solutions.filter((solution) => {
    const searchable = [
      solution.title,
      solution.excerpt,
      solution.symptom_summary,
      solution.caution_note,
      ...solution.probable_causes,
      ...solution.verification_steps,
      ...solution.action_steps,
      ...solution.taxonomy_labels,
    ]
      .join(" ")
      .toLowerCase();

    return (
      (!keyword || searchable.includes(keyword)) &&
      matchesTaxonomy(solution, "symptoms", state.gejala) &&
      matchesTaxonomy(solution, "pests", state.hama) &&
      matchesTaxonomy(solution, "diseases", state.penyakit) &&
      matchesTaxonomy(solution, "stages", state.fase) &&
      matchesTaxonomy(solution, "commodities", state.komoditas)
    );
  });
}

export function getActiveSolutionFilters(state: SolutionFilterState) {
  const items: Array<{ key: keyof SolutionFilterState; label: string }> = [];

  if (state.q?.trim()) {
    items.push({ key: "q", label: `Pencarian: ${state.q.trim()}` });
  }

  for (const filterKey of ["gejala", "hama", "penyakit", "fase", "komoditas"] as const) {
    if (state[filterKey]) {
      items.push({
        key: filterKey,
        label: `${filterKey[0].toUpperCase()}${filterKey.slice(1)}: ${findLabel(filterKey, state[filterKey]!)}`,
      });
    }
  }

  return items;
}

export function buildSolutionFilterHref(
  current: SolutionFilterState,
  key: Exclude<keyof SolutionFilterState, "q">,
  value?: string,
) {
  const params = new URLSearchParams();

  if (current.q?.trim()) {
    params.set("q", current.q.trim());
  }

  for (const queryKey of ["gejala", "hama", "penyakit", "fase", "komoditas"] as const) {
    const currentValue = queryKey === key ? value : current[queryKey];

    if (currentValue) {
      params.set(queryKey, currentValue);
    }
  }

  const query = params.toString();
  return query ? `/solusi?${query}` : "/solusi";
}

export function buildResetSolutionFiltersHref() {
  return "/solusi";
}

export function getSolutionTaxonomySection(
  queryKey: Exclude<keyof SolutionFilterState, "q">,
) {
  return SOLUTION_TAXONOMY_SECTIONS.find((section) => section.queryKey === queryKey) ?? null;
}

export function getSolutionTaxonomySegment(
  queryKey: Exclude<keyof SolutionFilterState, "q">,
) {
  return SOLUTION_TAXONOMY_SEGMENTS[queryKey];
}

export function getSolutionTaxonomySectionBySegment(segment: string) {
  const matched = (
    Object.entries(SOLUTION_TAXONOMY_SEGMENTS) as Array<
      [Exclude<keyof SolutionFilterState, "q">, string]
    >
  ).find(([, value]) => value === segment);

  return matched ? getSolutionTaxonomySection(matched[0]) : null;
}

export function getSolutionTaxonomyTerm(
  queryKey: Exclude<keyof SolutionFilterState, "q">,
  slug: string,
) {
  return getSolutionTaxonomySection(queryKey)?.items.find((item) => item.slug === slug) ?? null;
}

export function getSolutionTaxonomyTermBySegment(segment: string, slug: string) {
  const section = getSolutionTaxonomySectionBySegment(segment);
  return section?.items.find((item) => item.slug === slug) ?? null;
}

export function buildSolutionTaxonomyBrowseHref(
  queryKey: Exclude<keyof SolutionFilterState, "q">,
  slug?: string,
) {
  const segment = getSolutionTaxonomySegment(queryKey);
  return slug ? `/solusi/${segment}/${slug}` : `/solusi/${segment}`;
}

export function getAvailableSolutionTaxonomySlugs(solutions: SolutionSummary[]) {
  const availability = {
    gejala: new Set<string>(),
    hama: new Set<string>(),
    penyakit: new Set<string>(),
    fase: new Set<string>(),
    komoditas: new Set<string>(),
  } satisfies Record<Exclude<keyof SolutionFilterState, "q">, Set<string>>;

  for (const solution of solutions) {
    for (const section of SOLUTION_TAXONOMY_SECTIONS) {
      for (const slug of solution.taxonomy[section.key]) {
        availability[section.queryKey].add(slug);
      }
    }
  }

  return {
    gejala: [...availability.gejala],
    hama: [...availability.hama],
    penyakit: [...availability.penyakit],
    fase: [...availability.fase],
    komoditas: [...availability.komoditas],
  } satisfies Record<Exclude<keyof SolutionFilterState, "q">, string[]>;
}

export function buildSolutionTaxonomyLinks(solution: SolutionSummary) {
  return SOLUTION_TAXONOMY_SECTIONS.flatMap((section) =>
    section.items
      .filter((item) => solution.taxonomy[section.key].includes(item.slug))
      .map((item) => ({
        href: buildSolutionTaxonomyBrowseHref(section.queryKey, item.slug),
        label: item.label,
      })),
  );
}

function countSharedTaxonomy(left: SolutionSummary, right: SolutionSummary) {
  return SOLUTION_TAXONOMY_SECTIONS.reduce((total, section) => {
    const shared = left.taxonomy[section.key].filter((value) =>
      right.taxonomy[section.key].includes(value),
    ).length;

    return total + shared;
  }, 0);
}

export function getRelatedSolutions(
  current: SolutionSummary,
  pool: SolutionSummary[],
  limit = 3,
) {
  return pool
    .filter((candidate) => candidate.slug !== current.slug)
    .map((candidate) => ({
      candidate,
      score: countSharedTaxonomy(current, candidate),
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.candidate);
}
