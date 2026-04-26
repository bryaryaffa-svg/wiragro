import { getEducationVideoResources } from "@/lib/education-content";
import {
  getArticles,
  getFallbackProductList,
  getProducts,
  type ArticleSummaryPayload,
  type ProductSummary,
} from "@/lib/api";
import {
  buildSolutionHref,
  getProductCatalogContext,
  getSolutionCropOptions,
  getSolutionProblemOptions,
} from "@/lib/solution-experience";

export type GlobalSearchTab = "all" | "education" | "products" | "solutions" | "videos";

export type GlobalSearchItem =
  | {
      href: string;
      icon: string;
      id: string;
      kind: "solution";
      summary: string;
      tags: string[];
      title: string;
    }
  | {
      category: string;
      href: string;
      id: string;
      imageUrl?: string | null;
      kind: "product";
      product: ProductSummary;
      summary: string;
      tags: string[];
      title: string;
    }
  | {
      href: string;
      id: string;
      kind: "article";
      summary: string;
      tags: string[];
      thumbnail?: string | null;
      title: string;
    }
  | {
      category: string;
      href: string;
      id: string;
      kind: "video";
      summary: string;
      tags: string[];
      thumbnail: string;
      title: string;
      youtubeId?: string | null;
    };

export type GlobalSearchResults = {
  counts: Record<GlobalSearchTab, number>;
  groups: Record<GlobalSearchTab, GlobalSearchItem[]>;
  query: string;
  suggestions: string[];
};

export const DEFAULT_GLOBAL_SEARCH_SUGGESTIONS = [
  "daun kuning",
  "wereng",
  "pupuk cabai",
  "fungisida",
  "buah rontok",
  "gulma",
];

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length >= 2);
}

function scoreText(haystack: string, query: string, tokens: string[]) {
  if (!query) {
    return 0;
  }

  let score = 0;

  if (haystack.includes(query)) {
    score += 8;
  }

  for (const token of tokens) {
    if (haystack.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function buildSolutionSearchItems() {
  return getSolutionCropOptions().flatMap((crop) =>
    getSolutionProblemOptions().map((problem) => ({
      href: buildSolutionHref(crop.id, problem.id),
      icon: problem.icon,
      id: `${crop.id}-${problem.id}`,
      kind: "solution" as const,
      summary: `${problem.description} Pilih ${crop.label.toLowerCase()} untuk melihat arahan awal yang lebih spesifik.`,
      tags: [crop.label, problem.label],
      title: `${problem.label} pada ${crop.label}`,
    })),
  );
}

function buildArticleSearchItem(article: ArticleSummaryPayload): GlobalSearchItem {
  return {
    href: `/artikel/${article.slug}`,
    id: article.slug,
    kind: "article",
    summary:
      article.excerpt ??
      "Panduan pertanian praktis dari Wiragro yang menghubungkan edukasi, solusi, dan produk.",
    tags: article.taxonomy_labels?.slice(0, 3) ?? [],
    thumbnail: null,
    title: article.title,
  };
}

function buildProductSearchItem(product: ProductSummary): GlobalSearchItem {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
  const context = getProductCatalogContext(product);

  return {
    category: product.category?.name ?? product.product_type,
    href: `/produk/${product.slug}`,
    id: product.id,
    imageUrl: primaryImage?.url ?? null,
    kind: "product",
    product,
    summary:
      context.benefit ||
      product.summary ||
      "Produk pertanian aktif yang terhubung dengan kebutuhan tanaman Anda.",
    tags: [
      product.category?.name ?? product.product_type,
      ...(context.cropIds.slice(0, 2) ?? []),
      ...(context.problemIds.slice(0, 2) ?? []),
    ].filter(Boolean),
    title: product.name,
  };
}

function buildVideoSearchItem(
  video: ReturnType<typeof getEducationVideoResources>[number],
): GlobalSearchItem {
  return {
    category: video.category,
    href: video.href,
    id: video.id,
    kind: "video",
    summary: video.summary,
    tags: [...video.cropTags.slice(0, 2), ...video.problemTags.slice(0, 2)],
    thumbnail: video.thumbnail,
    title: video.title,
    youtubeId: video.youtubeId,
  };
}

function rankItems<T extends GlobalSearchItem>(
  items: T[],
  query: string,
  limit: number,
) {
  const tokens = tokenize(query);

  return items
    .map((item) => ({
      item,
      score: scoreText(
        normalize([item.title, item.summary, ...item.tags].join(" ")),
        normalize(query),
        tokens,
      ),
    }))
    .filter((entry) => (query ? entry.score > 0 : true))
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export async function searchGlobalContent(
  query: string,
  options?: {
    limitPerGroup?: number;
  },
): Promise<GlobalSearchResults> {
  const trimmedQuery = query.trim();
  const limitPerGroup = options?.limitPerGroup ?? 6;
  const [productsResult, articlesResult] = await Promise.allSettled([
    getProducts({ page_size: 36, sort: "best_seller" }),
    getArticles({ page_size: 24 }),
  ]);
  const products =
    productsResult.status === "fulfilled"
      ? productsResult.value.items
      : getFallbackProductList({ page_size: 36, sort: "best_seller" }).items;
  const articles =
    articlesResult.status === "fulfilled" ? articlesResult.value.items : [];
  const videos = getEducationVideoResources();
  const solutions = buildSolutionSearchItems();

  const solutionItems = rankItems(solutions, trimmedQuery, limitPerGroup);
  const productItems = rankItems(
    products.map(buildProductSearchItem),
    trimmedQuery,
    limitPerGroup,
  );
  const articleItems = rankItems(
    articles.map(buildArticleSearchItem),
    trimmedQuery,
    limitPerGroup,
  );
  const videoItems = rankItems(
    videos.map(buildVideoSearchItem),
    trimmedQuery,
    limitPerGroup,
  );
  const allItems = [
    ...solutionItems.slice(0, 3),
    ...productItems.slice(0, 4),
    ...articleItems.slice(0, 3),
    ...videoItems.slice(0, 2),
  ].slice(0, limitPerGroup + 4);

  const suggestions = trimmedQuery
    ? [
        ...new Set(
          [
            ...DEFAULT_GLOBAL_SEARCH_SUGGESTIONS.filter((item) =>
              item.includes(normalize(trimmedQuery)),
            ),
            ...allItems.slice(0, 4).map((item) => item.title),
          ].filter(Boolean),
        ),
      ].slice(0, 6)
    : DEFAULT_GLOBAL_SEARCH_SUGGESTIONS;

  return {
    counts: {
      all: allItems.length,
      education: articleItems.length,
      products: productItems.length,
      solutions: solutionItems.length,
      videos: videoItems.length,
    },
    groups: {
      all: allItems,
      education: articleItems,
      products: productItems,
      solutions: solutionItems,
      videos: videoItems,
    },
    query: trimmedQuery,
    suggestions,
  };
}
