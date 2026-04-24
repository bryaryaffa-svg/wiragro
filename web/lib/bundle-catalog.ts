import { getProduct, type ProductSummary } from "@/lib/api";
import {
  getGrowthBundlePricingPreview,
  type GrowthBundleDefinition,
  type GrowthBundleItemDefinition,
} from "@/lib/growth-commerce";
import { getProductImageOverride } from "@/lib/product-image-overrides";

type BundleCatalogSource = "catalog" | "snapshot";

export type ResolvedGrowthBundleItem = {
  lineId: string;
  productSlug: string;
  qty: number;
  roleLabel: string;
  notes?: string;
  source: BundleCatalogSource;
  productId: string | null;
  productHref: string | null;
  canAddToCart: boolean;
  product: ProductSummary;
  lineNormalTotalAmount: string;
  lineCompareAtTotalAmount: string | null;
};

export type ResolvedGrowthBundleCatalog = {
  bundle: GrowthBundleDefinition;
  items: ResolvedGrowthBundleItem[];
  connectedProducts: ProductSummary[];
  purchasableItems: Array<{ productId: string; qty: number }>;
  missingProductSlugs: string[];
  missingItemCount: number;
  catalogCoverage: "full" | "partial" | "snapshot";
  isFullyPurchasable: boolean;
  pricingPreview: ReturnType<typeof getGrowthBundlePricingPreview>;
};

const CATEGORY_IMAGE_BY_NAME: Record<string, string> = {
  "alat pertanian": "/category-photos/alat-pertanian.png",
  benih: "/category-photos/benih.png",
  nutrisi: "/category-photos/nutrisi-perangsang.png",
  pestisida: "/category-photos/pestisida.png",
  pupuk: "/category-photos/pupuk.png",
};

function parseAmount(value?: string | null) {
  const amount = Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function buildFallbackProductSummary(
  item: GrowthBundleItemDefinition,
  sourceLabel: string,
): ProductSummary {
  const isPromo =
    item.fallback.compareAtAmount !== null &&
    item.fallback.compareAtAmount !== undefined &&
    parseAmount(item.fallback.compareAtAmount) > parseAmount(item.fallback.priceAmount);
  const imageUrl =
    getProductImageOverride(item.productSlug) ??
    CATEGORY_IMAGE_BY_NAME[item.fallback.categoryName.trim().toLowerCase()] ??
    null;

  return {
    id: `snapshot-${item.productSlug}`,
    sku: item.fallback.sku,
    slug: item.productSlug,
    name: item.fallback.productName,
    summary: item.notes ?? item.fallback.summary,
    description: item.fallback.summary,
    product_type: item.fallback.categoryName,
    unit: item.fallback.unit,
    weight_grams: item.fallback.weightGrams,
    badges: {
      featured: isPromo,
      new_arrival: false,
      best_seller: false,
    },
    price: {
      type: isPromo ? "PROMO" : "NORMAL",
      amount: item.fallback.priceAmount,
      compare_at_amount: isPromo ? item.fallback.compareAtAmount ?? null : null,
      min_qty: null,
      member_level: null,
      is_promo: isPromo,
    },
    availability: {
      state: "out_of_stock",
      label: sourceLabel,
      stock_qty: null,
    },
    category: {
      id: `snapshot-category-${item.productSlug}`,
      name: item.fallback.categoryName,
      slug: item.fallback.categoryName.trim().toLowerCase().replace(/\s+/g, "-"),
    },
    images: imageUrl
      ? [
          {
            id: `snapshot-image-${item.productSlug}`,
            url: imageUrl,
            alt_text: item.fallback.productName,
            is_primary: true,
          },
        ]
      : [],
    videos: [],
    created_at: null,
    updated_at: null,
    seo: {
      title: item.fallback.productName,
      description: item.fallback.summary,
    },
  };
}

function resolveLinePricing(item: GrowthBundleItemDefinition) {
  const lineNormalTotal = parseAmount(item.fallback.priceAmount) * item.qty;
  const compareAtAmount = parseAmount(item.fallback.compareAtAmount ?? null);

  return {
    lineNormalTotalAmount: formatAmount(lineNormalTotal),
    lineCompareAtTotalAmount:
      compareAtAmount > 0 ? formatAmount(compareAtAmount * item.qty) : null,
  };
}

async function resolveBundleItem(
  item: GrowthBundleItemDefinition,
): Promise<ResolvedGrowthBundleItem> {
  const pricing = resolveLinePricing(item);

  try {
    const product = await getProduct(item.productSlug);

    return {
      lineId: item.lineId,
      productSlug: item.productSlug,
      qty: item.qty,
      roleLabel: item.roleLabel,
      notes: item.notes,
      source: "catalog",
      productId: product.id,
      productHref: `/produk/${product.slug}`,
      canAddToCart: product.availability.state !== "out_of_stock",
      product,
      ...pricing,
    };
  } catch {
    return {
      lineId: item.lineId,
      productSlug: item.productSlug,
      qty: item.qty,
      roleLabel: item.roleLabel,
      notes: item.notes,
      source: "snapshot",
      productId: null,
      productHref: null,
      canAddToCart: false,
      product: buildFallbackProductSummary(
        item,
        "Belum tersambung ke katalog aktif",
      ),
      ...pricing,
    };
  }
}

export async function resolveGrowthBundleCatalog(
  bundle: GrowthBundleDefinition,
): Promise<ResolvedGrowthBundleCatalog> {
  const items = await Promise.all(bundle.bundleItems.map(resolveBundleItem));
  const connectedProducts = items
    .filter((item) => item.source === "catalog")
    .map((item) => item.product);
  const purchasableItems = items
    .filter((item) => item.canAddToCart && item.productId)
    .map((item) => ({
      productId: item.productId as string,
      qty: item.qty,
    }));
  const missingProductSlugs = items
    .filter((item) => item.source !== "catalog")
    .map((item) => item.productSlug);
  const missingItemCount = missingProductSlugs.length;
  const catalogCoverage =
    missingItemCount === 0
      ? "full"
      : missingItemCount === items.length
        ? "snapshot"
        : "partial";

  return {
    bundle,
    items,
    connectedProducts,
    purchasableItems,
    missingProductSlugs,
    missingItemCount,
    catalogCoverage,
    isFullyPurchasable:
      items.length > 0 && purchasableItems.length === items.length,
    pricingPreview: getGrowthBundlePricingPreview(bundle),
  };
}
