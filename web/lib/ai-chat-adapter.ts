import type { ArticleSummaryPayload, CustomerSession, ProductSummary } from "@/lib/api";
import type { EducationVideoResource } from "@/lib/education-content";
import {
  getRelatedEducationVideosForArticle,
  getRecommendedProductsForArticle,
} from "@/lib/education-content";
import {
  buildSolutionData,
  getProductCatalogContext,
  getRecommendedProductsForSolution,
  getSolutionArticles,
  resolveSolutionSelection,
} from "@/lib/solution-experience";

export type AiChatContext = {
  crop?: string | null;
  problem?: string | null;
  product?: string | null;
};

export type AiChatStructuredResponse = {
  articles: ArticleSummaryPayload[];
  checks: string[];
  diagnosis: string;
  disclaimer: string;
  products: ProductSummary[];
  steps: string[];
  summary: string;
  videos: EducationVideoResource[];
};

export function isPremiumAiUser(session: CustomerSession | null) {
  const haystack = `${session?.pricing_mode ?? ""} ${session?.role ?? ""} ${session?.customer.member_tier ?? ""}`.toLowerCase();
  return /(premium|ai|pro|plus|gold|platinum|admin)/.test(haystack);
}

function canUseMockAdapter() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_WIRAGRO_AI_MOCK === "1";
}

function dedupeArticles(items: ArticleSummaryPayload[]) {
  return items.filter(
    (article, index, list) => list.findIndex((item) => item.slug === article.slug) === index,
  );
}

function dedupeProducts(items: ProductSummary[]) {
  return items.filter(
    (product, index, list) => list.findIndex((item) => item.id === product.id) === index,
  );
}

export async function requestAiChatResponse({
  articles,
  context,
  message,
  products,
  videos,
}: {
  articles: ArticleSummaryPayload[];
  context: AiChatContext;
  message: string;
  products: ProductSummary[];
  videos: EducationVideoResource[];
}): Promise<AiChatStructuredResponse> {
  if (!canUseMockAdapter()) {
    throw new Error("AI belum bisa menjawab saat ini. Coba lagi atau gunakan halaman Solusi.");
  }

  const relatedProduct = context.product
    ? products.find((product) => product.slug === context.product || product.id === context.product)
    : null;
  const relatedProductContext = relatedProduct ? getProductCatalogContext(relatedProduct) : null;
  const derivedCrop = relatedProductContext?.cropIds[0] ?? null;
  const derivedProblem = relatedProductContext?.problemIds[0] ?? null;

  const resolved = resolveSolutionSelection({
    crop: context.crop ?? derivedCrop ?? undefined,
    masalah: context.problem ?? derivedProblem ?? undefined,
    problem: context.problem ?? derivedProblem ?? undefined,
    product: context.product ?? undefined,
    q: message,
    tanaman: context.crop ?? derivedCrop ?? undefined,
  });
  const cropId = resolved.cropId ?? "lainnya";
  const problemId = resolved.problemId ?? "pertumbuhan-lambat";
  const solution = buildSolutionData(cropId, problemId);

  if (!solution) {
    return {
      articles: articles.slice(0, 2),
      checks: [
        "Sebutkan tanaman yang sedang Anda tangani.",
        "Ceritakan gejala paling terlihat seperti warna daun, hama, atau akar.",
        "Tambahkan umur tanaman atau fase tanam bila Anda tahu.",
      ],
      diagnosis: "Konteks awalnya belum cukup untuk memberi dugaan masalah yang spesifik.",
      disclaimer:
        "Rekomendasi AI bersifat arahan awal. Untuk kasus berat, cek kondisi lapangan dan ikuti petunjuk label produk.",
      products: products.slice(0, 2),
      steps: [
        "Mulai dari deskripsi gejala yang paling jelas.",
        "Sebutkan tanaman dan fase tanam agar arahan lebih presisi.",
        "Jika perlu, lanjutkan lewat halaman Solusi untuk alur yang lebih terstruktur.",
      ],
      summary:
        "Saya belum cukup yakin dengan konteksnya. Bantu saya dengan menyebut tanaman dan gejala utama agar arahan bisa lebih tepat.",
      videos: videos.slice(0, 1),
    };
  }

  const relatedArticles = dedupeArticles(getSolutionArticles(cropId, problemId, articles)).slice(0, 3);
  const relatedProducts = dedupeProducts(
    getRecommendedProductsForSolution(products, cropId, problemId, 3).map((item) => item.product),
  ).slice(0, 3);
  const relatedVideos = dedupeArticles(relatedArticles).flatMap((article) =>
    getRelatedEducationVideosForArticle(article, 1),
  );
  const selectedVideos = (relatedVideos.length ? relatedVideos : videos).slice(0, 2);

  if (!relatedProducts.length && relatedArticles.length) {
    const fallbackProducts = getRecommendedProductsForArticle(relatedArticles[0], products, 3).map(
      (item) => item.product,
    );

    return {
      articles: relatedArticles,
      checks: [solution.summary[0], solution.summary[1] ?? solution.summary[0]].filter(Boolean),
      diagnosis: solution.title,
      disclaimer:
        "Rekomendasi AI bersifat arahan awal. Untuk kasus berat, cek kondisi lapangan dan ikuti petunjuk label produk.",
      products: fallbackProducts,
      steps: solution.steps.slice(0, 4),
      summary:
        "Berdasarkan konteks awal Anda, saya sarankan mulai dari pengecekan gejala, lalu lanjut ke artikel dan produk yang paling relevan.",
      videos: selectedVideos,
    };
  }

  return {
    articles: relatedArticles,
    checks: [solution.summary[0], solution.summary[1] ?? solution.summary[0]].filter(Boolean),
    diagnosis: solution.summary[0],
    disclaimer:
      "Rekomendasi AI bersifat arahan awal. Untuk kasus berat, cek kondisi lapangan dan ikuti petunjuk label produk.",
    products: relatedProducts,
    steps: solution.steps.slice(0, 4),
    summary:
      "Saya menyusun arahan awal berdasarkan tanaman, gejala yang Anda ceritakan, dan referensi solusi Wiragro yang paling dekat.",
    videos: selectedVideos,
  };
}
