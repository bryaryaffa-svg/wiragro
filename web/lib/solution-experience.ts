import { getFallbackArticleSummaries } from "@/lib/article-content";
import { getSiteUrl } from "@/lib/config";
import { ARTICLE_REFERENCE_SLUGS } from "@/lib/content-reference-catalog";
import { resolveArticleReferences } from "@/lib/content-relation-resolver";
import type { ArticleSummaryPayload, ProductDetailPayload, ProductSummary } from "@/lib/api";
import { buildProductPageEnrichment } from "@/lib/product-content";

type ProductProfileKey =
  | "general"
  | "media"
  | "nutrition"
  | "protection"
  | "seed"
  | "tool";

export type SolutionCropId =
  | "bawang"
  | "cabai"
  | "hortikultura"
  | "jagung"
  | "lainnya"
  | "melon"
  | "padi"
  | "sawit"
  | "tomat";

export type SolutionProblemId =
  | "akar-busuk"
  | "bercak-daun"
  | "buah-rontok"
  | "daun-kuning"
  | "gulma"
  | "hama"
  | "hasil-panen"
  | "pembungaan-buruk"
  | "pertumbuhan-lambat"
  | "tanaman-kerdil";

export type SolutionCropOption = {
  id: SolutionCropId;
  label: string;
  description: string;
  icon:
    | "chili"
    | "corn"
    | "grid"
    | "horti"
    | "melon"
    | "onion"
    | "palm"
    | "rice"
    | "tomato";
};

export type SolutionProblemOption = {
  id: SolutionProblemId;
  label: string;
  description: string;
  symptomHint: string;
  icon:
    | "fruit-drop"
    | "fungus"
    | "nutrition"
    | "pest"
    | "root"
    | "stunted"
    | "weed"
    | "yellow-leaf";
};

export type SolutionVideoResource = {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  thumbnail: string;
  cropIds: SolutionCropId[];
  problemIds: SolutionProblemId[];
};

export type SolutionData = {
  cropId: SolutionCropId;
  problemId: SolutionProblemId;
  title: string;
  summary: string[];
  steps: string[];
  productTags: string[];
  articleTags: string[];
  videoTags: string[];
  relatedArticleSlugs: string[];
  relatedVideoIds: string[];
  productBrowseHref: string;
  whatsappMessage: string;
};

type SolutionBlueprint = {
  articleSlugs: string[];
  buildSteps: (cropLabel: string) => string[];
  buildSummary: (cropLabel: string) => string[];
  preferredProfiles: ProductProfileKey[];
  productTags: string[];
  relatedVideoIds: string[];
  videoTags: string[];
};

const SITE_URL = getSiteUrl().replace(/\/+$/, "");

export const SOLUTION_CROP_OPTIONS: SolutionCropOption[] = [
  {
    id: "padi",
    label: "Padi",
    description: "Untuk sawah dan fase budidaya tanaman pangan.",
    icon: "rice",
  },
  {
    id: "cabai",
    label: "Cabai",
    description: "Komoditas intensif yang sensitif pada fase dan gejala.",
    icon: "chili",
  },
  {
    id: "jagung",
    label: "Jagung",
    description: "Mulai dari benih, fase awal, sampai pertumbuhan vegetatif.",
    icon: "corn",
  },
  {
    id: "tomat",
    label: "Tomat",
    description: "Fokus pada daun, pembungaan, dan kualitas hasil.",
    icon: "tomato",
  },
  {
    id: "bawang",
    label: "Bawang",
    description: "Cocok untuk pemilihan solusi fase vegetatif dan perlindungan.",
    icon: "onion",
  },
  {
    id: "melon",
    label: "Semangka / Melon",
    description: "Untuk buah horti yang sensitif pada fase generatif.",
    icon: "melon",
  },
  {
    id: "sawit",
    label: "Sawit",
    description: "Untuk kebutuhan kebun dan pengamatan gejala skala lapangan.",
    icon: "palm",
  },
  {
    id: "hortikultura",
    label: "Hortikultura",
    description: "Sayur dan buah yang perlu solusi praktis dan cepat dipahami.",
    icon: "horti",
  },
  {
    id: "lainnya",
    label: "Lainnya",
    description: "Jika komoditas Anda belum ada, mulai dari gejala utama.",
    icon: "grid",
  },
];

export const SOLUTION_PROBLEM_OPTIONS: SolutionProblemOption[] = [
  {
    id: "daun-kuning",
    label: "Daun kuning",
    description: "Warna daun memucat, lalu tanaman terlihat kurang segar.",
    symptomHint: "Biasanya muncul saat akar, nutrisi, atau pola air belum seimbang.",
    icon: "yellow-leaf",
  },
  {
    id: "hama",
    label: "Hama wereng / kutu / ulat",
    description: "Daun rusak, berlubang, atau ada serangga yang cepat menyebar.",
    symptomHint: "Perlu dibedakan dulu antara serangan hama dan penyakit daun.",
    icon: "pest",
  },
  {
    id: "bercak-daun",
    label: "Bercak daun / jamur",
    description: "Daun menunjukkan bercak, noda, atau gejala menyebar.",
    symptomHint: "Sering berkaitan dengan kelembapan tinggi dan sanitasi area tanam.",
    icon: "fungus",
  },
  {
    id: "tanaman-kerdil",
    label: "Tanaman kerdil",
    description: "Ukuran tanaman tertahan dan tidak berkembang semestinya.",
    symptomHint: "Periksa fondasi fase awal, akar, serta ritme perawatan dasarnya.",
    icon: "stunted",
  },
  {
    id: "buah-rontok",
    label: "Buah rontok",
    description: "Buah muda mudah gugur atau tidak lanjut berkembang.",
    symptomHint: "Sering muncul saat tanaman stres di fase generatif.",
    icon: "fruit-drop",
  },
  {
    id: "akar-busuk",
    label: "Akar busuk",
    description: "Tanaman tampak layu, media berat, dan akar terlihat tidak sehat.",
    symptomHint: "Mulai dari cek drainase, kelembapan, dan kondisi akar di lapangan.",
    icon: "root",
  },
  {
    id: "gulma",
    label: "Gulma",
    description: "Gulma mulai mengganggu pertumbuhan dan kebersihan area tanam.",
    symptomHint: "Butuh tindakan yang rapi agar tanaman utama tidak ikut tertekan.",
    icon: "weed",
  },
  {
    id: "pertumbuhan-lambat",
    label: "Pertumbuhan lambat",
    description: "Tanaman berjalan lambat meski sudah masuk fase tumbuh aktif.",
    symptomHint: "Biasanya perlu dilihat dari fase tanam, nutrisi dasar, dan kondisi akar.",
    icon: "nutrition",
  },
  {
    id: "pembungaan-buruk",
    label: "Pembungaan buruk",
    description: "Bunga sedikit, tidak seragam, atau cepat gugur.",
    symptomHint: "Kondisi generatif perlu dibaca dari ritme nutrisi dan stres tanaman.",
    icon: "fruit-drop",
  },
  {
    id: "hasil-panen",
    label: "Hasil panen kurang maksimal",
    description: "Produksi tidak sesuai harapan walau tanaman tampak tumbuh.",
    symptomHint: "Biasanya perlu evaluasi bertahap dari fase, kesehatan tanaman, dan input.",
    icon: "nutrition",
  },
];

const SOLUTION_VIDEO_RESOURCES: SolutionVideoResource[] = [
  {
    id: "video-daun-kuning",
    title: "Membaca daun kuning sebelum memilih input koreksi",
    category: "Studi kasus lapangan",
    description: "Cocok untuk petani yang ingin membedakan masalah akar, air, dan nutrisi lebih dulu.",
    href: "/artikel/daun-menguning-dan-nutrisi-awal",
    thumbnail: "/illustrations/agri-field-sunrise.svg",
    cropIds: ["cabai", "hortikultura", "lainnya", "tomat"],
    problemIds: ["daun-kuning", "pertumbuhan-lambat", "tanaman-kerdil"],
  },
  {
    id: "video-hama-awal",
    title: "Mengenali serangan hama sebelum memilih proteksi",
    category: "Review produk",
    description: "Ringkasan gejala hama ringan sampai berat agar pilihan proteksi lebih masuk akal.",
    href: "/artikel/pengendalian-hama-awal-yang-lebih-tenang",
    thumbnail: "/category-photos/pestisida.png",
    cropIds: ["cabai", "hortikultura", "melon", "tomat", "bawang"],
    problemIds: ["hama", "bercak-daun", "hasil-panen"],
  },
  {
    id: "video-fase-generatif",
    title: "Menjaga fase generatif agar bunga dan buah lebih stabil",
    category: "Edukasi umum",
    description: "Membantu memahami kapan tanaman butuh penyesuaian sebelum memilih booster.",
    href: "/artikel/fase-tanam-cabai-dari-semai-sampai-berbuah",
    thumbnail: "/illustrations/agri-seedling-lab.svg",
    cropIds: ["cabai", "tomat", "melon", "hortikultura"],
    problemIds: ["buah-rontok", "pembungaan-buruk", "hasil-panen"],
  },
];

const COMMODITY_TO_CROP_IDS: Record<string, SolutionCropId[]> = {
  cabai: ["cabai"],
  "horti-buah": ["hortikultura", "tomat", "melon"],
  jagung: ["jagung"],
  "kebun-rumah": ["lainnya"],
  padi: ["padi"],
  "sayuran-daun": ["hortikultura", "lainnya"],
};

const SOLUTION_TO_PROBLEM_IDS: Record<string, SolutionProblemId[]> = {
  "bercak-daun-dan-gejala-jamur": ["bercak-daun"],
  "bunga-rontok-dan-buah-tidak-jadi": ["buah-rontok", "hasil-panen", "pembungaan-buruk"],
  "daun-menguning": ["daun-kuning", "pertumbuhan-lambat"],
  "hama-daun": ["hama"],
  "pertumbuhan-lambat": ["hasil-panen", "pertumbuhan-lambat", "tanaman-kerdil"],
  "semai-rebah": ["akar-busuk", "tanaman-kerdil"],
};

const LEGACY_CROP_MAP: Record<string, SolutionCropId> = {
  bawang: "bawang",
  cabai: "cabai",
  "horti-buah": "hortikultura",
  jagung: "jagung",
  padi: "padi",
  sawit: "sawit",
  "sayuran-daun": "hortikultura",
  tomat: "tomat",
};

const LEGACY_PROBLEM_MAP: Record<string, SolutionProblemId> = {
  "akar-lemah": "akar-busuk",
  "bercak-daun": "bercak-daun",
  "bunga-rontok": "buah-rontok",
  "busuk-akar": "akar-busuk",
  "daun-berlubang": "hama",
  "daun-menguning": "daun-kuning",
  "jamur-daun": "bercak-daun",
  "layu-bakteri": "akar-busuk",
  "pertumbuhan-lambat": "pertumbuhan-lambat",
  "rebah-semai": "tanaman-kerdil",
  thrips: "hama",
  ulat: "hama",
};

const SOLUTION_BLUEPRINTS: Record<SolutionProblemId, SolutionBlueprint> = {
  "akar-busuk": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide, ARTICLE_REFERENCE_SLUGS.seedGuide],
    buildSummary: (cropLabel) => [
      `Akar busuk pada ${cropLabel.toLowerCase()} biasanya perlu dibaca dari kondisi media, aliran air, dan kesehatan akar di lapangan.`,
      "Mulailah dari pengecekan yang ringan dan praktis, lalu baru pilih input jika penyebab utamanya sudah lebih jelas.",
      "Arahan ini adalah rekomendasi awal dan tetap perlu disesuaikan dengan kondisi kebun, cuaca, dan tingkat kerusakan nyata.",
    ],
    buildSteps: () => [
      "Identifikasi gejala layu, media terlalu basah, dan kondisi akar pada beberapa sampel tanaman.",
      "Perbaiki pola perawatan: kurangi kelembapan berlebih dan benahi drainase bila perlu.",
      "Gunakan produk pendukung hanya setelah kebutuhan akar, media, atau proteksi mulai terlihat jelas.",
      "Pantau ulang 2-3 hari setelah tindakan awal untuk melihat apakah gejala membaik.",
      "Konsultasi lanjutan bila tanaman terus turun atau kerusakan akar sudah berat.",
    ],
    preferredProfiles: ["media", "nutrition", "protection"],
    productTags: ["akar", "media", "pembenah tanah", "fungisida", "nutrisi tanaman"],
    relatedVideoIds: ["video-daun-kuning"],
    videoTags: ["akar", "media", "cek lapangan"],
  },
  "bercak-daun": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.earlyPestGuide, ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide],
    buildSummary: (cropLabel) => [
      `Bercak daun pada ${cropLabel.toLowerCase()} sering terlihat mirip antara penyakit daun, kelembapan tinggi, dan stres tanaman lainnya.`,
      "Supaya tidak terlalu cepat membeli proteksi, pastikan dulu pola bercaknya, sebarannya, dan kondisi lingkungan di sekitar tanaman.",
      "Rekomendasi ini adalah titik awal yang halus, jadi penyesuaian lapangan tetap lebih penting daripada satu jawaban tunggal.",
    ],
    buildSteps: () => [
      "Identifikasi bentuk bercak, lokasi sebaran, dan daun mana yang paling dulu terdampak.",
      "Perbaiki sirkulasi area tanam dan singkirkan bagian yang sudah parah bila memungkinkan.",
      "Gunakan produk proteksi atau pendukung hanya jika pola penyakitnya sudah cukup kuat.",
      "Pantau ulang kondisi daun baru dan daun lama setelah tindakan awal dilakukan.",
      "Konsultasi jika gejala menyebar cepat atau bercak bercampur dengan layu berat.",
    ],
    preferredProfiles: ["protection", "tool", "nutrition"],
    productTags: ["fungisida", "proteksi", "sprayer", "jamur", "bercak"],
    relatedVideoIds: ["video-hama-awal"],
    videoTags: ["bercak", "jamur", "proteksi"],
  },
  "buah-rontok": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.chiliStageGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Buah rontok pada ${cropLabel.toLowerCase()} biasanya muncul saat tanaman sedang tertekan di fase generatif.`,
      "Fokus awalnya bukan langsung booster, tetapi memastikan ritme air, kondisi akar, dan keseimbangan fase berbunga sampai berbuah.",
      "Rekomendasi ini adalah arahan awal, jadi keputusan akhir tetap perlu melihat kondisi lapangan dan usia tanaman.",
    ],
    buildSteps: () => [
      "Identifikasi kapan buah mulai rontok dan apakah gejalanya merata atau hanya di titik tertentu.",
      "Perbaiki pola perawatan pada fase generatif agar tanaman tidak mengalami stres tambahan.",
      "Gunakan produk nutrisi atau pendukung generatif sesuai kebutuhan, bukan sekadar karena sedang populer.",
      "Pantau ulang pembentukan buah baru setelah 1-2 siklus pengamatan.",
      "Konsultasi bila kerontokan terus berlanjut atau tanaman juga menunjukkan gejala hama dan penyakit.",
    ],
    preferredProfiles: ["nutrition", "protection", "tool"],
    productTags: ["buah", "generatif", "booster", "kalium", "nutrisi tanaman"],
    relatedVideoIds: ["video-fase-generatif"],
    videoTags: ["buah", "generatif", "studi kasus"],
  },
  "daun-kuning": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Daun kuning pada ${cropLabel.toLowerCase()} adalah gejala awal yang paling aman dibaca dari akar, nutrisi, dan pola air sekaligus.`,
      "Dengan urutan yang tenang, petani bisa menghindari pembelian yang terlalu reaktif dan lebih cepat menemukan tindakan yang memang relevan.",
      "Rekomendasi ini adalah panduan awal, jadi tetap sesuaikan dengan varietas, cuaca, dan kondisi media di lapangan.",
    ],
    buildSteps: () => [
      "Identifikasi pola daun yang menguning: daun tua, daun muda, atau menyebar di seluruh tanaman.",
      "Perbaiki pola perawatan dengan menstabilkan pengairan dan mengecek kondisi media.",
      "Gunakan produk nutrisi atau pembenah tanah hanya jika kebutuhan dasarnya mulai terlihat jelas.",
      "Pantau ulang respons tanaman pada daun baru setelah tindakan awal dilakukan.",
      "Konsultasi jika daun kuning disertai layu berat, akar rusak, atau gejala menyebar cepat.",
    ],
    preferredProfiles: ["nutrition", "media", "seed"],
    productTags: ["pupuk", "nutrisi", "daun", "pembenah tanah", "booster"],
    relatedVideoIds: ["video-daun-kuning"],
    videoTags: ["nutrisi", "daun", "cek akar"],
  },
  gulma: {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.earlyPestGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Gulma pada ${cropLabel.toLowerCase()} perlu ditangani rapi supaya tanaman utama tidak kalah bersaing pada air, ruang, dan nutrisi.`,
      "Tindakan awal yang tepat biasanya dimulai dari tingkat persebaran gulma dan fase tanam saat ini, bukan sekadar memilih produk tercepat.",
      "Rekomendasi awal ini tetap perlu disesuaikan dengan jenis gulma dan kondisi lapangan yang sebenarnya.",
    ],
    buildSteps: () => [
      "Identifikasi area gulma yang paling mengganggu dan lihat fase tanam tanaman utama.",
      "Perbaiki pola perawatan dan kebersihan lahan agar gulma tidak cepat kembali mendominasi.",
      "Gunakan produk pendukung hanya jika tindakan lapangan memang membutuhkan bantuan tambahan.",
      "Pantau ulang pertumbuhan tanaman utama setelah gulma mulai terkendali.",
      "Konsultasi bila gulma berulang cepat atau mulai memukul pertumbuhan tanaman secara signifikan.",
    ],
    preferredProfiles: ["protection", "tool", "general"],
    productTags: ["gulma", "proteksi", "alat", "sprayer", "kebersihan lahan"],
    relatedVideoIds: ["video-hama-awal"],
    videoTags: ["gulma", "perawatan lahan", "monitoring"],
  },
  hama: {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.earlyPestGuide, ARTICLE_REFERENCE_SLUGS.chiliStageGuide],
    buildSummary: (cropLabel) => [
      `Serangan hama pada ${cropLabel.toLowerCase()} sebaiknya dibaca dari tingkat kerusakan dan jenis gejala yang paling jelas terlihat.`,
      "Dengan begitu, petani bisa lebih yakin membedakan antara masalah hama, penyakit, atau stres tanaman sebelum memilih produk.",
      "Arahan ini adalah rekomendasi awal dan tetap perlu disesuaikan dengan kondisi serangan yang nyata di lapangan.",
    ],
    buildSteps: () => [
      "Identifikasi gejala paling awal: daun berlubang, koloni kecil, atau serangan di pucuk tanaman.",
      "Perbaiki pola monitoring dan kebersihan area yang paling dulu terdampak.",
      "Gunakan produk proteksi sesuai kebutuhan dan alat aplikasi yang paling masuk akal.",
      "Pantau ulang intensitas serangan setelah tindakan awal dilakukan.",
      "Konsultasi bila gejala makin cepat menyebar atau campur dengan penyakit daun.",
    ],
    preferredProfiles: ["protection", "tool", "nutrition"],
    productTags: ["pestisida", "insektisida", "hama", "proteksi", "sprayer"],
    relatedVideoIds: ["video-hama-awal"],
    videoTags: ["hama", "review produk", "lapangan"],
  },
  "hasil-panen": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.chiliStageGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Saat hasil panen ${cropLabel.toLowerCase()} belum maksimal, biasanya masalahnya bukan hanya satu produk, tetapi gabungan fase, perawatan, dan kestabilan tanaman.`,
      "Mulailah dari evaluasi yang sederhana agar setiap keputusan perbaikan terasa lebih tepat dan tidak boros.",
      "Rekomendasi awal ini tetap perlu disesuaikan dengan target panen, umur tanaman, dan kondisi lapangan sebenarnya.",
    ],
    buildSteps: () => [
      "Identifikasi fase tanam dan lihat titik mana yang paling menahan hasil panen.",
      "Perbaiki pola perawatan dasar agar tanaman tidak terus bekerja dalam kondisi tertekan.",
      "Gunakan produk pendukung sesuai kebutuhan hasil, bukan sekadar mengikuti tren pasar.",
      "Pantau ulang kualitas pertumbuhan, bunga, atau buah setelah penyesuaian.",
      "Konsultasi bila target hasil masih jauh meski tindakan dasar sudah dirapikan.",
    ],
    preferredProfiles: ["nutrition", "protection", "tool"],
    productTags: ["hasil", "booster", "nutrisi", "generatif", "panen"],
    relatedVideoIds: ["video-fase-generatif"],
    videoTags: ["hasil", "pembungaan", "optimasi"],
  },
  "pembungaan-buruk": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.chiliStageGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Pembungaan yang kurang baik pada ${cropLabel.toLowerCase()} perlu dibaca dari ritme generatif, bukan hanya dari nama produk yang ingin dibeli.`,
      "Fokus awalnya adalah memastikan tanaman cukup stabil untuk masuk ke fase berbunga dengan lebih sehat.",
      "Ini adalah rekomendasi awal, jadi penyesuaian tetap perlu mengikuti kondisi kebun dan umur tanaman Anda.",
    ],
    buildSteps: () => [
      "Identifikasi apakah tanaman sudah cukup siap masuk ke fase pembungaan.",
      "Perbaiki pola perawatan dan kurangi stres berlebih pada fase generatif.",
      "Gunakan produk nutrisi atau pendukung pembungaan sesuai kebutuhan riil tanaman.",
      "Pantau ulang pembentukan bunga baru dan kestabilan tanaman sesudahnya.",
      "Konsultasi bila pembungaan tetap buruk atau mulai diikuti gejala buah rontok.",
    ],
    preferredProfiles: ["nutrition", "protection", "tool"],
    productTags: ["bunga", "generatif", "kalium", "booster", "nutrisi tanaman"],
    relatedVideoIds: ["video-fase-generatif"],
    videoTags: ["pembungaan", "generatif", "edukasi"],
  },
  "pertumbuhan-lambat": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.fertilizerGuide, ARTICLE_REFERENCE_SLUGS.yellowLeavesGuide],
    buildSummary: (cropLabel) => [
      `Pertumbuhan lambat pada ${cropLabel.toLowerCase()} biasanya perlu dibaca dari fondasi awal: akar, fase tanam, dan ritme nutrisi dasar.`,
      "Langkah yang lebih tenang membantu petani memilih perbaikan yang memang diperlukan, bukan sekadar menambah input.",
      "Rekomendasi ini adalah arahan awal dan tetap perlu disesuaikan dengan umur tanaman serta kondisi lapangan.",
    ],
    buildSteps: () => [
      "Identifikasi apakah pertumbuhan lambat terjadi merata atau hanya pada area tertentu.",
      "Perbaiki pola perawatan awal dan cek kembali kondisi media serta akar.",
      "Gunakan produk pendukung pertumbuhan sesuai kebutuhan riil tanaman.",
      "Pantau ulang ukuran daun, batang, dan respons tanaman setelah tindakan awal.",
      "Konsultasi bila tanaman tetap stagnan atau mulai diikuti gejala lain.",
    ],
    preferredProfiles: ["nutrition", "seed", "media"],
    productTags: ["pupuk", "starter", "pertumbuhan", "nutrisi", "media"],
    relatedVideoIds: ["video-daun-kuning"],
    videoTags: ["pertumbuhan", "fase awal", "nutrisi"],
  },
  "tanaman-kerdil": {
    articleSlugs: [ARTICLE_REFERENCE_SLUGS.seedGuide, ARTICLE_REFERENCE_SLUGS.fertilizerGuide],
    buildSummary: (cropLabel) => [
      `Tanaman kerdil pada ${cropLabel.toLowerCase()} sering muncul saat fase awal tidak mendapat dukungan akar, media, atau ritme perawatan yang cukup.`,
      "Karena itu, solusi awalnya lebih aman dimulai dari pemeriksaan dasar sebelum menambah booster atau proteksi.",
      "Rekomendasi ini adalah arahan awal dan perlu disesuaikan dengan kondisi nyata di lapangan.",
    ],
    buildSteps: () => [
      "Identifikasi gejala pertumbuhan yang tertahan dan bandingkan dengan tanaman yang masih sehat.",
      "Perbaiki pola perawatan dasar, media, dan pengamatan fase awal.",
      "Gunakan produk yang memang mendukung pertumbuhan setelah penyebab utamanya lebih jelas.",
      "Pantau ulang perkembangan tanaman selama beberapa hari setelah penyesuaian.",
      "Konsultasi bila tanaman tetap tertahan atau mulai menunjukkan gejala akar dan daun.",
    ],
    preferredProfiles: ["seed", "media", "nutrition"],
    productTags: ["benih", "media", "starter", "nutrisi", "akar"],
    relatedVideoIds: ["video-daun-kuning"],
    videoTags: ["fase awal", "tanaman kerdil", "media"],
  },
};

function findCropById(cropId?: string | null) {
  return SOLUTION_CROP_OPTIONS.find((item) => item.id === cropId) ?? null;
}

function findProblemById(problemId?: string | null) {
  return SOLUTION_PROBLEM_OPTIONS.find((item) => item.id === problemId) ?? null;
}

function normalizeText(value?: string | null) {
  return (value ?? "").toLowerCase();
}

function parseAmount(value?: string | null) {
  const amount = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}

function productText(product: ProductSummary | ProductDetailPayload) {
  return normalizeText(
    [
      product.name,
      product.summary,
      product.description,
      product.category?.name,
      product.product_type,
    ].join(" "),
  );
}

function buildProductContext(product: ProductSummary | ProductDetailPayload) {
  const enrichment = buildProductPageEnrichment(product as ProductDetailPayload);
  const cropIds = enrichment.commodityLinks.flatMap((item) => COMMODITY_TO_CROP_IDS[item.slug] ?? []);
  const problemIds = enrichment.problemLinks.flatMap(
    (item) => SOLUTION_TO_PROBLEM_IDS[item.slug] ?? [],
  );

  return {
    benefit: enrichment.primaryBenefits[0] ?? product.summary ?? "",
    cropIds: [...new Set(cropIds)],
    enrichment,
    problemIds: [...new Set(problemIds)],
    profile: enrichment.profile as ProductProfileKey,
  };
}

function scoreProductForProblem(
  product: ProductSummary,
  cropId: SolutionCropId,
  problemId: SolutionProblemId,
) {
  const blueprint = SOLUTION_BLUEPRINTS[problemId];
  const context = buildProductContext(product);
  const text = productText(product);
  const cropGroup = cropId === "melon" || cropId === "tomat" || cropId === "bawang" ? "hortikultura" : cropId;
  let score = 0;

  if (context.problemIds.includes(problemId)) {
    score += 7;
  }

  if (context.cropIds.includes(cropId)) {
    score += 5;
  } else if (cropGroup !== cropId && context.cropIds.includes(cropGroup as SolutionCropId)) {
    score += 4;
  } else if (cropId === "lainnya") {
    score += 1;
  }

  const profileIndex = blueprint.preferredProfiles.indexOf(context.profile);
  if (profileIndex >= 0) {
    score += 5 - profileIndex;
  }

  score += blueprint.productTags.reduce(
    (total, tag) => (text.includes(tag) ? total + 1.6 : total),
    0,
  );

  if (product.availability.state === "in_stock") {
    score += 1;
  }

  if (product.badges.featured || product.badges.best_seller) {
    score += 0.6;
  }

  return {
    context,
    score,
  };
}

function keywordToCropId(keyword?: string) {
  if (!keyword) {
    return null;
  }

  const haystack = normalizeText(keyword);
  const mapping: Array<[string, SolutionCropId]> = [
    ["padi", "padi"],
    ["cabai", "cabai"],
    ["jagung", "jagung"],
    ["tomat", "tomat"],
    ["bawang", "bawang"],
    ["melon", "melon"],
    ["semangka", "melon"],
    ["sawit", "sawit"],
    ["horti", "hortikultura"],
  ];

  return mapping.find(([needle]) => haystack.includes(needle))?.[1] ?? null;
}

function keywordToProblemId(keyword?: string) {
  if (!keyword) {
    return null;
  }

  const haystack = normalizeText(keyword);
  const mapping: Array<[string, SolutionProblemId]> = [
    ["daun kuning", "daun-kuning"],
    ["kuning", "daun-kuning"],
    ["hama", "hama"],
    ["wereng", "hama"],
    ["ulat", "hama"],
    ["kutu", "hama"],
    ["jamur", "bercak-daun"],
    ["bercak", "bercak-daun"],
    ["gulma", "gulma"],
    ["akar", "akar-busuk"],
    ["buah rontok", "buah-rontok"],
    ["pembungaan", "pembungaan-buruk"],
    ["panen", "hasil-panen"],
    ["kerdil", "tanaman-kerdil"],
    ["lambat", "pertumbuhan-lambat"],
  ];

  return mapping.find(([needle]) => haystack.includes(needle))?.[1] ?? null;
}

export function normalizeSolutionCropId(value?: string | null) {
  return findCropById(value)?.id ?? null;
}

export function normalizeSolutionProblemId(value?: string | null) {
  return findProblemById(value)?.id ?? null;
}

export function resolveSolutionSelection(params: Record<string, string | string[] | undefined>) {
  const cropFromQuery = [
    typeof params.tanaman === "string" ? normalizeSolutionCropId(params.tanaman) : null,
    typeof params.crop === "string" ? normalizeSolutionCropId(params.crop) : null,
  ].find(Boolean) as SolutionCropId | null;
  const problemFromQuery = [
    typeof params.masalah === "string" ? normalizeSolutionProblemId(params.masalah) : null,
    typeof params.problem === "string" ? normalizeSolutionProblemId(params.problem) : null,
  ].find(Boolean) as SolutionProblemId | null;
  const cropFromLegacy =
    typeof params.komoditas === "string" ? LEGACY_CROP_MAP[params.komoditas] ?? keywordToCropId(params.komoditas) : null;
  const problemFromLegacy = [
    typeof params.gejala === "string" ? LEGACY_PROBLEM_MAP[params.gejala] ?? keywordToProblemId(params.gejala) : null,
    typeof params.hama === "string" ? LEGACY_PROBLEM_MAP[params.hama] ?? keywordToProblemId(params.hama) : null,
    typeof params.penyakit === "string" ? LEGACY_PROBLEM_MAP[params.penyakit] ?? keywordToProblemId(params.penyakit) : null,
    typeof params.q === "string" ? keywordToProblemId(params.q) : null,
  ].find(Boolean) as SolutionProblemId | null;
  const cropFromSearch = typeof params.q === "string" ? keywordToCropId(params.q) : null;

  return {
    cropId: cropFromQuery ?? cropFromLegacy ?? cropFromSearch ?? null,
    problemId: problemFromQuery ?? problemFromLegacy ?? (typeof params.q === "string" ? keywordToProblemId(params.q) : null),
  };
}

export function buildSolutionHref(cropId?: SolutionCropId | null, problemId?: SolutionProblemId | null) {
  const params = new URLSearchParams();

  if (cropId) {
    params.set("tanaman", cropId);
  }

  if (problemId) {
    params.set("masalah", problemId);
  }

  const query = params.toString();
  return query ? `/solusi?${query}` : "/solusi";
}

export function buildProductSolutionHref(cropId?: SolutionCropId | null, problemId?: SolutionProblemId | null) {
  const params = new URLSearchParams();

  if (cropId) {
    params.set("tanaman", cropId);
  }

  if (problemId) {
    params.set("masalah", problemId);
  }

  const query = params.toString();
  return query ? `/produk?${query}` : "/produk";
}

export function buildSolutionResetHref() {
  return "/solusi";
}

export function buildSolutionWhatsAppUrl(
  phone: string | null | undefined,
  storeName: string,
  cropId: SolutionCropId,
  problemId: SolutionProblemId,
) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  const crop = findCropById(cropId);
  const problem = findProblemById(problemId);
  if (!crop || !problem) {
    return null;
  }

  const formatted = normalized.startsWith("0") ? `62${normalized.slice(1)}` : normalized;
  const sourcePath = `${SITE_URL}${buildSolutionHref(cropId, problemId)}`;
  const message = encodeURIComponent(
    `Halo ${storeName}, saya ingin konsultasi produk untuk ${crop.label.toLowerCase()} dengan masalah ${problem.label.toLowerCase()}. Link halaman: ${sourcePath}`,
  );

  return `https://wa.me/${formatted}?text=${message}`;
}

export function getSolutionCropOptions() {
  return SOLUTION_CROP_OPTIONS;
}

export function getSolutionProblemOptions() {
  return SOLUTION_PROBLEM_OPTIONS;
}

export function buildSolutionData(
  cropId: SolutionCropId,
  problemId: SolutionProblemId,
): SolutionData | null {
  const crop = findCropById(cropId);
  const problem = findProblemById(problemId);
  const blueprint = SOLUTION_BLUEPRINTS[problemId];

  if (!crop || !problem || !blueprint) {
    return null;
  }

  return {
    cropId,
    problemId,
    title: `Solusi untuk ${problem.label.toLowerCase()} pada ${crop.label.toLowerCase()}`,
    summary: blueprint.buildSummary(crop.label),
    steps: blueprint.buildSteps(crop.label),
    productTags: blueprint.productTags,
    articleTags: blueprint.articleSlugs,
    videoTags: blueprint.videoTags,
    relatedArticleSlugs: blueprint.articleSlugs,
    relatedVideoIds: blueprint.relatedVideoIds,
    productBrowseHref: buildProductSolutionHref(cropId, problemId),
    whatsappMessage: `Konsultasi ${crop.label} - ${problem.label}`,
  };
}

export function getSolutionArticles(
  cropId: SolutionCropId,
  problemId: SolutionProblemId,
  articlePool?: ArticleSummaryPayload[],
) {
  const blueprint = SOLUTION_BLUEPRINTS[problemId];
  const crop = findCropById(cropId);
  const fallbackPool = articlePool?.length ? articlePool : getFallbackArticleSummaries();
  const resolved = resolveArticleReferences(blueprint.articleSlugs, fallbackPool);

  if (resolved.items.length) {
    return resolved.items.slice(0, 3);
  }

  const cropLabel = crop?.label.toLowerCase() ?? "";
  const problemLabel = findProblemById(problemId)?.label.toLowerCase() ?? "";

  return fallbackPool
    .filter((article) => {
      const haystack = normalizeText(
        [article.title, article.excerpt, ...(article.taxonomy_labels ?? [])].join(" "),
      );

      return haystack.includes(cropLabel) || haystack.includes(problemLabel);
    })
    .slice(0, 3);
}

export function getSolutionVideos(cropId: SolutionCropId, problemId: SolutionProblemId) {
  const directMatches = SOLUTION_VIDEO_RESOURCES.filter(
    (item) => item.problemIds.includes(problemId) || item.cropIds.includes(cropId),
  );

  return (directMatches.length ? directMatches : SOLUTION_VIDEO_RESOURCES).slice(0, 3);
}

export function getRecommendedProductsForSolution(
  products: ProductSummary[],
  cropId: SolutionCropId,
  problemId: SolutionProblemId,
  limit = 4,
) {
  const ranked = products
    .map((product) => ({
      product,
      ...scoreProductForProblem(product, cropId, problemId),
    }))
    .filter((item) => item.score > 0.5)
    .sort((left, right) => right.score - left.score);

  return ranked.slice(0, limit).map((item) => ({
    badge:
      item.context.problemIds.includes(problemId)
        ? `Cocok untuk ${findProblemById(problemId)?.label.toLowerCase()}`
        : item.context.enrichment.useCaseLabel,
    benefit: item.context.benefit,
    cropIds: item.context.cropIds,
    problemIds: item.context.problemIds,
    product: item.product,
    profile: item.context.profile,
  }));
}

export function getProductCatalogContext(product: ProductSummary | ProductDetailPayload) {
  const context = buildProductContext(product);
  return {
    benefit: context.benefit,
    cropIds: context.cropIds,
    problemIds: context.problemIds,
    profile: context.profile,
    quickBadge:
      context.problemIds.length > 0
        ? `Cocok untuk ${findProblemById(context.problemIds[0])?.label.toLowerCase()}`
        : context.enrichment.useCaseLabel,
  };
}

export function filterProductsForCatalog(
  products: ProductSummary[],
  input: {
    cropId?: SolutionCropId | null;
    priceBand?: "100k-250k" | "250k+" | "all" | "under-100k";
    problemId?: SolutionProblemId | null;
    promoOnly?: boolean;
    stockOnly?: boolean;
  },
) {
  const filtered = products.filter((product) => {
    const amount = parseAmount(product.price.amount);
    const context = getProductCatalogContext(product);
    const matchesCrop =
      !input.cropId ||
      input.cropId === "lainnya" ||
      context.cropIds.includes(input.cropId) ||
      ((input.cropId === "melon" || input.cropId === "tomat" || input.cropId === "bawang") &&
        context.cropIds.includes("hortikultura"));
    const matchesProblem =
      !input.problemId || context.problemIds.includes(input.problemId);
    const matchesPromo = !input.promoOnly || product.price.is_promo;
    const matchesStock = !input.stockOnly || product.availability.state !== "out_of_stock";
    const matchesPrice =
      !input.priceBand ||
      input.priceBand === "all" ||
      (input.priceBand === "under-100k" && amount < 100000) ||
      (input.priceBand === "100k-250k" && amount >= 100000 && amount <= 250000) ||
      (input.priceBand === "250k+" && amount > 250000);

    return matchesCrop && matchesProblem && matchesPromo && matchesStock && matchesPrice;
  });

  if (input.cropId || input.problemId) {
    return filtered.sort((left, right) => {
      const leftScore = scoreProductForProblem(
        left,
        input.cropId ?? "lainnya",
        input.problemId ?? "pertumbuhan-lambat",
      ).score;
      const rightScore = scoreProductForProblem(
        right,
        input.cropId ?? "lainnya",
        input.problemId ?? "pertumbuhan-lambat",
      ).score;

      return rightScore - leftScore;
    });
  }

  return filtered;
}
