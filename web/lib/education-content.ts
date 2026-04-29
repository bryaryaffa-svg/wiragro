import type { ArticleEnrichmentFields } from "@/lib/article-content";
import type { ArticleSummaryPayload, ProductSummary } from "@/lib/api";
import { getProductCatalogContext } from "@/lib/solution-experience";

export type EducationFormat = "all" | "article" | "video";

export type EducationTopicId =
  | "benih"
  | "edukasi-umum"
  | "efisiensi-biaya"
  | "hama-penyakit"
  | "nutrisi-tanaman"
  | "pestisida"
  | "review-produk"
  | "studi-kasus";

export type EducationFilterState = {
  format?: EducationFormat;
  masalah?: string;
  tanaman?: string;
  topik?: EducationTopicId;
  q?: string;
};

export type EducationOption<T extends string> = {
  id: T;
  label: string;
};

export type EducationVideoResource = {
  articleSlug?: string;
  category: "Edukasi umum" | "Review produk" | "Studi kasus lapangan";
  cropTags: string[];
  description: string;
  href: string;
  id: string;
  problemTags: string[];
  summary: string;
  thumbnail: string;
  title: string;
  topicTags: EducationTopicId[];
  youtubeId?: string | null;
};

export type ArticleGuideSection = {
  body: string[];
  title: string;
};

const EDUCATION_VIDEO_RESOURCES: EducationVideoResource[] = [
  {
    id: "case-yellow-leaf",
    title: "Studi kasus: membaca daun kuning sebelum membeli input koreksi",
    summary: "Membantu petani mengecek akar, pola air, dan kebutuhan nutrisi lebih dulu.",
    description: "Cocok untuk gejala daun kuning pada cabai, hortikultura, dan fase vegetatif.",
    category: "Studi kasus lapangan",
    href: "/artikel/daun-menguning-dan-nutrisi-awal",
    articleSlug: "daun-menguning-dan-nutrisi-awal",
    thumbnail: "/illustrations/agri-field-sunrise.svg",
    cropTags: ["cabai", "horti-buah", "sayuran-daun"],
    problemTags: ["daun-menguning", "pertumbuhan-lambat", "akar-lemah"],
    topicTags: ["studi-kasus", "nutrisi-tanaman", "edukasi-umum"],
    youtubeId: null,
  },
  {
    id: "review-protection",
    title: "Review produk proteksi: kapan pestisida benar-benar dibutuhkan",
    summary: "Review praktis agar pembelian proteksi tidak terasa terlalu cepat dan tetap terarah.",
    description: "Membandingkan gejala serangan hama dengan keputusan produk yang lebih aman.",
    category: "Review produk",
    href: "/artikel/pengendalian-hama-awal-yang-lebih-tenang",
    articleSlug: "pengendalian-hama-awal-yang-lebih-tenang",
    thumbnail: "/category-photos/pestisida.png",
    cropTags: ["cabai", "horti-buah", "sayuran-daun"],
    problemTags: ["hama-daun"],
    topicTags: ["review-produk", "pestisida", "hama-penyakit"],
    youtubeId: null,
  },
  {
    id: "education-chili-phase",
    title: "Edukasi umum: fase tanam cabai dari semai sampai berbuah",
    summary: "Membantu memahami kapan fokus ke media, nutrisi, proteksi, atau booster.",
    description: "Video pendamping untuk user yang ingin memahami ritme keputusan per fase tanam.",
    category: "Edukasi umum",
    href: "/artikel/fase-tanam-cabai-dari-semai-sampai-berbuah",
    articleSlug: "fase-tanam-cabai-dari-semai-sampai-berbuah",
    thumbnail: "/illustrations/agri-seedling-lab.svg",
    cropTags: ["cabai"],
    problemTags: ["bunga-rontok", "pertumbuhan-lambat"],
    topicTags: ["edukasi-umum", "nutrisi-tanaman", "studi-kasus"],
    youtubeId: null,
  },
];

export const EDUCATION_TOPIC_OPTIONS: EducationOption<EducationTopicId>[] = [
  { id: "nutrisi-tanaman", label: "Nutrisi" },
  { id: "pestisida", label: "Pestisida" },
  { id: "benih", label: "Benih" },
  { id: "hama-penyakit", label: "Hama" },
  { id: "efisiensi-biaya", label: "Biaya" },
  { id: "studi-kasus", label: "Kasus" },
  { id: "review-produk", label: "Review" },
  { id: "edukasi-umum", label: "Umum" },
];

export const EDUCATION_FORMAT_OPTIONS: EducationOption<EducationFormat>[] = [
  { id: "all", label: "Semua" },
  { id: "article", label: "Artikel" },
  { id: "video", label: "Video" },
];

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function buildArticleHaystack(article: Pick<ArticleSummaryPayload & ArticleEnrichmentFields, "excerpt" | "taxonomy_labels" | "title" | "user_goal_summary">) {
  return normalize(
    [
      article.title,
      article.excerpt ?? "",
      ...(article.taxonomy_labels ?? []),
      article.user_goal_summary ?? "",
    ].join(" "),
  );
}

function matchesEducationTopic(
  article: ArticleEnrichmentFields | undefined,
  topic?: EducationTopicId,
) {
  if (!topic || topic === "edukasi-umum") {
    return true;
  }

  const topics = article?.taxonomy?.topics ?? [];
  const goals = article?.taxonomy?.goals ?? [];

  switch (topic) {
    case "benih":
      return topics.includes("benih-bibit");
    case "efisiensi-biaya":
      return goals.includes("susun-belanja") || topics.includes("manajemen-belanja");
    case "hama-penyakit":
      return topics.includes("hama-penyakit");
    case "nutrisi-tanaman":
      return topics.includes("pupuk-nutrisi");
    case "pestisida":
      return topics.includes("hama-penyakit");
    case "review-produk":
      return Boolean(article?.related_product_queries?.length);
    case "studi-kasus":
      return goals.includes("atasi-masalah") || Boolean(article?.related_solution);
    default:
      return true;
  }
}

function matchesArticleFilter(
  article: ArticleSummaryPayload & ArticleEnrichmentFields,
  filter: EducationFilterState,
) {
  const haystack = buildArticleHaystack(article);
  const query = normalize(filter.q);
  const crop = filter.tanaman;
  const problem = filter.masalah;
  const taxonomy = article.taxonomy;

  return (
    (!query || haystack.includes(query)) &&
    (!crop || taxonomy?.commodities.includes(crop) || haystack.includes(crop.replace(/-/g, " "))) &&
    (!problem || taxonomy?.symptoms.includes(problem) || haystack.includes(problem.replace(/-/g, " "))) &&
    matchesEducationTopic(article, filter.topik)
  );
}

function matchesVideoFilter(video: EducationVideoResource, filter: EducationFilterState) {
  const haystack = normalize(
    [video.title, video.summary, video.description, ...video.cropTags, ...video.problemTags].join(" "),
  );
  const query = normalize(filter.q);

  return (
    (!query || haystack.includes(query)) &&
    (!filter.tanaman || video.cropTags.includes(filter.tanaman)) &&
    (!filter.masalah || video.problemTags.includes(filter.masalah)) &&
    (!filter.topik || video.topicTags.includes(filter.topik) || filter.topik === "edukasi-umum")
  );
}

function videoPriorityScore(video: EducationVideoResource) {
  return video.category === "Studi kasus lapangan"
    ? 3
    : video.category === "Review produk"
      ? 2
      : 1;
}

export function getEducationVideoResources() {
  return EDUCATION_VIDEO_RESOURCES;
}

export function buildEducationHref(
  current: EducationFilterState,
  next: Partial<Record<keyof EducationFilterState, string | undefined | null>>,
) {
  const state: EducationFilterState = {
    q: current.q,
    tanaman: current.tanaman,
    masalah: current.masalah,
    topik: current.topik,
    format: current.format,
  };

  if ("q" in next) {
    state.q = next.q ?? undefined;
  }
  if ("tanaman" in next) {
    state.tanaman = next.tanaman ?? undefined;
  }
  if ("masalah" in next) {
    state.masalah = next.masalah ?? undefined;
  }
  if ("topik" in next) {
    state.topik = (next.topik as EducationTopicId | undefined) ?? undefined;
  }
  if ("format" in next) {
    state.format = (next.format as EducationFormat | undefined) ?? undefined;
  }

  const params = new URLSearchParams();
  if (state.q?.trim()) {
    params.set("q", state.q.trim());
  }
  if (state.tanaman) {
    params.set("tanaman", state.tanaman);
  }
  if (state.masalah) {
    params.set("masalah", state.masalah);
  }
  if (state.topik) {
    params.set("topik", state.topik);
  }
  if (state.format && state.format !== "all") {
    params.set("format", state.format);
  }

  const query = params.toString();
  return query ? `/artikel?${query}` : "/artikel";
}

export function filterEducationArticles(
  articles: Array<ArticleSummaryPayload & ArticleEnrichmentFields>,
  filter: EducationFilterState,
) {
  const filtered = articles.filter((article) => matchesArticleFilter(article, filter));

  return [...filtered].sort((left, right) => {
    const leftDate = new Date(left.updated_at ?? left.published_at ?? 0).getTime();
    const rightDate = new Date(right.updated_at ?? right.published_at ?? 0).getTime();
    return rightDate - leftDate;
  });
}

export function filterEducationVideos(filter: EducationFilterState) {
  return [...EDUCATION_VIDEO_RESOURCES]
    .filter((video) => matchesVideoFilter(video, filter))
    .sort((left, right) => videoPriorityScore(right) - videoPriorityScore(left));
}

export function getFeaturedEducationVideos(filter: EducationFilterState, limit = 3) {
  const filtered = filterEducationVideos(filter);
  return (filtered.length ? filtered : EDUCATION_VIDEO_RESOURCES)
    .slice()
    .sort((left, right) => videoPriorityScore(right) - videoPriorityScore(left))
    .slice(0, limit);
}

export function getRelatedEducationVideosForArticle(
  article: ArticleSummaryPayload & ArticleEnrichmentFields,
  limit = 2,
) {
  const cropTags = article.taxonomy?.commodities ?? [];
  const problemTags = article.taxonomy?.symptoms ?? [];
  const titleHaystack = buildArticleHaystack(article);

  return [...EDUCATION_VIDEO_RESOURCES]
    .map((video) => {
      const cropScore = cropTags.filter((tag) => video.cropTags.includes(tag)).length;
      const problemScore = problemTags.filter((tag) => video.problemTags.includes(tag)).length;
      const topicScore = video.topicTags.reduce(
        (total, tag) => (titleHaystack.includes(tag.replace(/-/g, " ")) ? total + 1 : total),
        0,
      );

      return {
        score: cropScore * 2 + problemScore * 3 + topicScore + videoPriorityScore(video),
        video,
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.video);
}

export function buildArticleGuideSections(
  article: ArticleSummaryPayload & ArticleEnrichmentFields,
): ArticleGuideSection[] {
  const labels = article.taxonomy_labels ?? [];
  const cropLabel = labels.find((label) =>
    ["Padi", "Cabai", "Jagung", "Sayuran Daun", "Horti & Buah", "Kebun Rumah"].includes(label),
  );
  const problemLabel = labels.find((label) =>
    [
      "Daun Menguning",
      "Hama Daun",
      "Pertumbuhan Lambat",
      "Bunga / Buah Rontok",
      "Akar Lemah",
    ].includes(label),
  );
  const productHints = article.related_product_queries?.length
    ? article.related_product_queries
    : ["produk pendukung sesuai kebutuhan lapangan"];

  return [
    {
      title: "Apa masalahnya?",
      body: [
        article.excerpt || `Panduan ini membantu membaca konteks ${article.title.toLowerCase()} dengan lebih sederhana.`,
        cropLabel || problemLabel
          ? `Fokus utamanya terkait ${[problemLabel, cropLabel].filter(Boolean).join(" pada ")}.`
          : "Tujuannya adalah memberi konteks yang cukup sebelum pengguna bergerak ke solusi atau produk.",
      ],
    },
    {
      title: "Penyebab umum",
      body: [
        "Masalah lapangan biasanya muncul dari kombinasi fase tanam, kondisi akar, ritme perawatan, dan tekanan lingkungan.",
        "Karena itu, artikel ini sebaiknya dibaca sebagai panduan awal, bukan satu diagnosis final untuk semua kasus.",
      ],
    },
    {
      title: "Cara mengatasi",
      body: [
        ...(article.key_takeaways?.slice(0, 3) ?? [
          "Mulai dari pengamatan gejala yang paling jelas.",
          "Rapikan pola perawatan dasar sebelum menambah input baru.",
          "Pantau ulang respons tanaman setelah tindakan awal.",
        ]),
      ],
    },
    {
      title: "Produk yang bisa membantu",
      body: [
        `Produk yang paling relevan biasanya berasal dari kategori seperti ${productHints.join(", ")}.`,
        "Pilih produk setelah konteks masalah dan fase tanam cukup jelas agar keputusan belanja lebih sehat.",
      ],
    },
    {
      title: "Kapan harus konsultasi?",
      body: [
        "Jika gejala menyebar cepat, bercampur dengan masalah lain, atau tidak membaik setelah tindakan awal, gunakan jalur solusi atau konsultasi lanjutan.",
      ],
    },
  ];
}

export function getRecommendedProductsForArticle(
  article: ArticleSummaryPayload & ArticleEnrichmentFields,
  products: ProductSummary[],
  limit = 4,
) {
  const articleHaystack = buildArticleHaystack(article);

  return products
    .map((product) => {
      const context = getProductCatalogContext(product);
      const productHaystack = normalize(
        [
          product.name,
          product.summary,
          product.description,
          product.category?.name,
          context.benefit,
          context.quickBadge,
        ].join(" "),
      );
      const topicScore = (article.related_product_queries ?? []).reduce(
        (total, query) => (productHaystack.includes(normalize(query)) ? total + 3 : total),
        0,
      );
      const cropScore = context.cropIds.reduce(
        (total, cropId) => (articleHaystack.includes(cropId.replace(/-/g, " ")) ? total + 2 : total),
        0,
      );
      const problemScore = context.problemIds.reduce(
        (total, problemId) => (articleHaystack.includes(problemId.replace(/-/g, " ")) ? total + 2 : total),
        0,
      );
      const stockScore = product.availability.state === "out_of_stock" ? 0 : 1;

      return {
        context,
        product,
        score: topicScore + cropScore + problemScore + stockScore,
      };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit);
}
