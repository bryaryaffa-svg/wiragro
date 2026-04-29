import type { ProductSummary } from "@/lib/api";
import {
  getProductCatalogContext,
  getSolutionCropOptions,
  getSolutionProblemOptions,
  type SolutionCropId,
  type SolutionProblemId,
} from "@/lib/solution-experience";
import { WIRAGRO_CATEGORY_ASSETS, WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

const PROFILE_CATEGORY_LABELS: Record<string, string> = {
  general: "Kebutuhan lapangan",
  media: "Media tanam",
  nutrition: "Nutrisi tanaman",
  protection: "Proteksi tanaman",
  seed: "Benih & fase awal",
  tool: "Alat pertanian",
};

const PROBLEM_CARD_LABELS: Partial<Record<SolutionProblemId, string>> = {
  "akar-busuk": "Akar busuk",
  "bercak-daun": "Jamur / bercak",
  "buah-rontok": "Buah rontok",
  "daun-kuning": "Daun kuning",
  gulma: "Gulma",
  hama: "Hama",
  "hasil-panen": "Hasil panen",
  "pembungaan-buruk": "Pembungaan",
  "pertumbuhan-lambat": "Pertumbuhan lambat",
  "tanaman-kerdil": "Tanaman kerdil",
};

const CROP_LABELS = new Map<SolutionCropId, string>(
  getSolutionCropOptions().map((item) => [item.id, item.label]),
);

const PROBLEM_LABELS = new Map<SolutionProblemId, string>(
  getSolutionProblemOptions().map((item) => [item.id, item.label]),
);

function limitLabels(labels: string[], max = 2) {
  if (labels.length <= max) {
    return labels;
  }

  return [...labels.slice(0, max), `+${labels.length - max}`];
}

function getProblemLabel(problemId: SolutionProblemId) {
  return PROBLEM_CARD_LABELS[problemId] ?? PROBLEM_LABELS.get(problemId) ?? problemId;
}

export function getFallbackProductVisual(product: ProductSummary) {
  const haystack = `${product.name} ${product.category?.name ?? ""} ${product.product_type}`.toLowerCase();

  if (haystack.includes("benih") || haystack.includes("bibit")) {
    return WIRAGRO_CATEGORY_ASSETS.benih;
  }
  if (
    haystack.includes("pestisida") ||
    haystack.includes("insektisida") ||
    haystack.includes("fungisida") ||
    haystack.includes("herbisida")
  ) {
    return WIRAGRO_CATEGORY_ASSETS.pesticide;
  }
  if (haystack.includes("nutrisi") || haystack.includes("booster") || haystack.includes("kalium")) {
    return WIRAGRO_CATEGORY_ASSETS.nutritionBooster;
  }
  if (haystack.includes("alat") || haystack.includes("sprayer") || haystack.includes("semprot")) {
    return haystack.includes("sprayer") || haystack.includes("semprot")
      ? WIRAGRO_CATEGORY_ASSETS.sprayer
      : WIRAGRO_ICON_ASSETS.tool;
  }

  return WIRAGRO_CATEGORY_ASSETS.pupuk;
}

export function getProductCardBadge(product: ProductSummary) {
  if (product.badges.featured || product.price.is_promo) {
    return "Promo";
  }
  if (product.badges.best_seller) {
    return "Terlaris";
  }
  if (product.badges.new_arrival) {
    return "Baru";
  }

  return null;
}

export function getProductStockLabel(product: ProductSummary) {
  const qty = product.availability.stock_qty;

  if (product.availability.state === "out_of_stock") {
    return "Stok habis";
  }
  if (product.availability.state === "low_stock") {
    return qty ? `Stok menipis: ${qty}` : "Stok menipis";
  }

  return qty ? `Stok tersedia: ${qty}` : "Stok tersedia";
}

export function getProductCardFit(product: ProductSummary) {
  const context = getProductCatalogContext(product);
  const categoryLabel =
    product.category?.name ||
    PROFILE_CATEGORY_LABELS[context.profile] ||
    product.product_type ||
    "Produk";
  const meaningfulCropIds = context.cropIds.filter((cropId) => cropId !== "lainnya");
  const cropLabels = limitLabels(
    meaningfulCropIds
      .map((cropId) => CROP_LABELS.get(cropId))
      .filter((label): label is string => Boolean(label)),
  );
  const problemLabels = limitLabels(
    context.problemIds
      .map((problemId) => getProblemLabel(problemId))
      .filter((label): label is string => Boolean(label)),
  );
  const hasSpecificFit = cropLabels.length > 0 || problemLabels.length > 0;
  const previewLabels = hasSpecificFit ? [...cropLabels, ...problemLabels].slice(0, 2) : [categoryLabel];

  return {
    categoryLabel,
    cropLabels,
    hasSpecificFit,
    needsConsultation: context.profile === "general" || !hasSpecificFit,
    previewLabels,
    problemLabels,
    quickBadge: context.quickBadge,
    stockLabel: getProductStockLabel(product),
    stockState: product.availability.state,
    summary:
      context.benefit ||
      product.summary ||
      "Produk pertanian aktif dari Wiragro yang siap dipilih sesuai kebutuhan Anda.",
  };
}
