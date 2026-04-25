import {
  getCustomerApiBaseUrl,
  getSiteUrl,
  getStoreCode,
  getStorefrontApiBaseUrl,
} from "@/lib/config";
import type { ArticleEnrichmentFields } from "@/lib/article-content";
import {
  buildGoogleMapsStoreEmbedUrl,
  buildGoogleMapsStoreSearchUrl,
} from "@/lib/maps";
import {
  enrichArticleDetail,
  mergeArticleSummaries,
  getFallbackArticleBySlug,
  getFallbackArticleSummaries,
} from "@/lib/article-content";
import { getProductImageOverride } from "@/lib/product-image-overrides";
import { BRAND_SUBTAGLINE, SITE_NAME } from "@/lib/seo";

export interface StorefrontSeo {
  title?: string | null;
  description?: string | null;
  keywords?: string[] | string | null;
}

export interface ProductSummary {
  id: string;
  sku: string;
  slug: string;
  name: string;
  summary?: string | null;
  description?: string | null;
  product_type: string;
  unit: string;
  weight_grams: string;
  badges: {
    featured: boolean;
    new_arrival: boolean;
    best_seller: boolean;
  };
  price: {
    type?: string | null;
    amount?: string | null;
    compare_at_amount?: string | null;
    min_qty?: number | null;
    member_level?: string | null;
    is_promo?: boolean;
  };
  availability: {
    state: "in_stock" | "low_stock" | "out_of_stock";
    label: string;
    stock_qty: number | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  images: Array<{
    id: string;
    url: string;
    alt_text?: string | null;
    is_primary: boolean;
  }>;
  videos: Array<{
    id: string;
    url: string;
    platform: string;
    thumbnail_url?: string | null;
  }>;
  created_at?: string | null;
  updated_at?: string | null;
  seo?: StorefrontSeo;
  review_summary?: ProductReviewSummaryPayload | null;
}

export interface HomePayload {
  store: {
    code: string;
    name: string;
    address?: string | null;
    whatsapp_number?: string | null;
    operational_hours?: string | null;
  };
  banners: Array<{
    title: string;
    subtitle?: string | null;
    image_url?: string | null;
    target_url?: string | null;
  }>;
  featured_products: ProductSummary[];
  new_arrivals: ProductSummary[];
  best_sellers: ProductSummary[];
  category_highlights: Array<{
    name: string;
    slug: string;
  }>;
  seo: StorefrontSeo;
}

export interface StoreProfile extends Record<string, unknown> {
  code: string;
  name: string;
  address?: string | null;
  whatsapp_number?: string | null;
  operational_hours?: string | null;
}

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parent_id?: string | null;
}

export interface ProductListPayload {
  items: ProductSummary[];
  pagination: {
    page: number;
    page_size: number;
    count: number;
  };
  available_filters: {
    category_slug?: string | null;
    sort?: string | null;
  };
  seo: StorefrontSeo;
}

export interface ProductDetailPayload extends ProductSummary {
  promotions: Array<{
    code: string;
    name: string;
    rule_payload: Record<string, unknown>;
  }>;
  related_products: ProductSummary[];
  stock_badge: {
    state: string;
    message: string;
  };
}

export interface ArticleSummaryPayload extends ArticleEnrichmentFields {
  slug: string;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
}

export interface ContentPagePayload extends ArticleSummaryPayload {
  slug: string;
  title: string;
  excerpt?: string | null;
  body_html: string;
  published_at?: string | null;
  updated_at?: string | null;
  seo?: StorefrontSeo;
}

export interface ArticleListPayload {
  items: ArticleSummaryPayload[];
  pagination: {
    page: number;
    page_size: number;
    count: number;
  };
}

export interface CartPayload {
  id: string;
  guest_token?: string | null;
  status: string;
  subtotal: string;
  discount_total: string;
  grand_total: string;
  total_weight_grams?: number;
  items: Array<{
    id: string;
    product_id: string;
    product_name?: string | null;
    product_slug?: string | null;
    product_unit?: string | null;
    product_image_url?: string | null;
    qty: number;
    price_snapshot: {
      amount?: string;
      price_type?: string;
    };
    weight_grams?: number;
    promotion_snapshot: {
      matched_promotions?: Array<{
        promotion_code: string;
        name: string;
        benefit?: string | null;
      }>;
    };
    subtotal: string;
    total: string;
  }>;
}

export interface CustomerSession {
  access_token: string;
  customer: {
    id: string;
    full_name: string;
    phone?: string | null;
    email?: string | null;
    member_tier?: string | null;
  };
  mode?: string;
  role?: string;
  pricing_mode?: string;
  auth_provider?: string;
}

export interface CustomerAddressPayload {
  id: string;
  label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  district?: string | null;
  city: string;
  province: string;
  postal_code?: string | null;
  notes?: string | null;
  is_default: boolean;
}

export interface CustomerAddressInput {
  label: string;
  recipient_name: string;
  recipient_phone: string;
  address_line: string;
  district?: string;
  city: string;
  province: string;
  postal_code?: string;
  notes?: string;
  is_default: boolean;
}

export interface CustomerAccountPayload {
  customer: CustomerSession["customer"];
  role?: string | null;
  pricing_mode?: string | null;
  addresses: CustomerAddressPayload[];
}

export type CustomerOrderReviewState =
  | "awaiting_payment"
  | "ready"
  | "pending"
  | "approved"
  | "needs_update";

export interface CustomerOrderReviewItemPayload {
  product_id: string;
  product_name?: string | null;
  product_slug?: string | null;
  eligible: boolean;
  state: CustomerOrderReviewState;
  can_write_review: boolean;
  existing_review?: CustomerProductReviewPayload | null;
}

export interface CustomerOrderReviewSummaryPayload {
  order_eligible: boolean;
  ready_item_count: number;
  pending_item_count: number;
  approved_item_count: number;
  needs_update_item_count: number;
  items: CustomerOrderReviewItemPayload[];
}

export interface CustomerOrderSummaryPayload {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  grand_total: string;
  created_at?: string | null;
  shipping_method?: string | null;
  payment_method?: string | null;
  invoice_source?: string | null;
  customer_role?: string | null;
  review_summary?: CustomerOrderReviewSummaryPayload | null;
}

export interface CustomerOrderItemPayload {
  id: string;
  product_id: string;
  product_name?: string | null;
  product_slug?: string | null;
  qty: number;
  unit_price: string;
  discount_total: string;
  line_total: string;
  price_snapshot?: Record<string, unknown>;
  review_status?: CustomerOrderReviewItemPayload | null;
}

export interface CustomerOrderDetailPayload extends CustomerOrderSummaryPayload {
  payment_due_at?: string | null;
  auto_cancel_at?: string | null;
  notes?: string | null;
  customer: {
    full_name?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  address: Record<string, unknown>;
  pricing: {
    subtotal: string;
    discount_total: string;
    shipping_total: string;
    grand_total: string;
    payment_method?: string | null;
    shipping_method?: string | null;
    invoice_source?: string | null;
  };
  shipment: {
    shipment_number?: string | null;
    status?: string | null;
    tracking_number?: string | null;
    delivery_method?: string | null;
    pickup_store_code?: string | null;
    courier_code?: string | null;
    courier_name?: string | null;
    service_code?: string | null;
    service_name?: string | null;
    etd?: string | null;
  };
  payment: {
    reference?: string | null;
    status?: string | null;
    gateway_code?: string | null;
    method_code?: string | null;
    amount: string;
    paid_at?: string | null;
  };
  can_pay_online: boolean;
  items: CustomerOrderItemPayload[];
  invoices: Array<{
    type: string;
    document_url?: string | null;
  }>;
}

export interface WishlistPayload {
  items: Array<{
    product_id: string;
    product_name: string;
    product_slug: string;
    product: ProductSummary;
    created_at: string;
  }>;
}

export interface TrackOrderPayload {
  order_number: string;
  status: string;
  payment_status: string;
  fulfillment_status: string;
  shipment: {
    shipment_number?: string | null;
    status?: string | null;
    tracking_number?: string | null;
  };
  invoices: Array<{
    type: string;
    document_url?: string | null;
  }>;
}

export interface ProductReviewSummaryPayload {
  average_rating: number | null;
  total_reviews: number;
}

export interface PublicProductReviewSummaryPayload extends ProductReviewSummaryPayload {
  rating_breakdown: Array<{
    rating: number;
    count: number;
  }>;
}

export interface PublicProductReviewItemPayload {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  usage_context?: string | null;
  reviewer_name: string;
  verified_purchase: boolean;
  submitted_at?: string | null;
  approved_at?: string | null;
}

export interface ProductReviewFeedPayload {
  product_id: string;
  product_slug: string;
  summary: PublicProductReviewSummaryPayload;
  items: PublicProductReviewItemPayload[];
}

export interface CustomerProductReviewPayload {
  id: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  usage_context?: string | null;
  moderation_status: string;
  moderation_note?: string | null;
  submitted_at?: string | null;
  approved_at?: string | null;
  verified_purchase: boolean;
}

export interface CustomerProductReviewStatusPayload {
  eligible: boolean;
  product_id: string;
  order_id?: string | null;
  purchased_at?: string | null;
  existing_review?: CustomerProductReviewPayload | null;
}

export interface B2BInquiryInput {
  buyerType: "kebun" | "reseller" | "proyek" | "rutin";
  businessName?: string;
  contactName: string;
  phone: string;
  email?: string;
  commodityFocus?: string;
  commoditySlug?: string;
  bundleSlug?: string;
  campaignSlug?: string;
  productSlug?: string;
  productName?: string;
  monthlyVolume?: string;
  fulfillmentType?: "pickup" | "delivery" | "mixed";
  preferredFollowUp: "whatsapp" | "phone" | "email";
  budgetHint?: string;
  needSummary: string;
  requestedItems: B2BInquiryRequestedItemInput[];
  notes?: string;
  sourcePage?: string;
  storeCode?: string;
}

export interface B2BInquiryRequestedItemInput {
  label: string;
  qty?: string;
  unit?: string;
  notes?: string;
}

export interface B2BInquiryRequestedItemPayload {
  label: string;
  qty?: string | null;
  unit?: string | null;
  notes?: string | null;
}

export interface B2BQuoteItemPayload extends B2BInquiryRequestedItemPayload {
  unit_estimate_amount?: string | null;
  line_estimate_amount?: string | null;
}

export interface B2BInquiryResponsePayload {
  id: string;
  inquiry_number: string;
  status: string;
  status_label: string;
  preferred_follow_up: string;
}

export interface CustomerB2BInquiryPayload {
  id: string;
  inquiry_number: string;
  status: "new" | "contacted" | "quoted" | "won" | "closed";
  status_label: string;
  status_description: string;
  buyer_type: B2BInquiryInput["buyerType"];
  buyer_type_label: string;
  business_name?: string | null;
  contact_name: string;
  phone: string;
  email?: string | null;
  commodity_focus?: string | null;
  commodity_slug?: string | null;
  bundle_slug?: string | null;
  campaign_slug?: string | null;
  product_slug?: string | null;
  product_name?: string | null;
  monthly_volume?: string | null;
  fulfillment_type?: B2BInquiryInput["fulfillmentType"] | null;
  preferred_follow_up: B2BInquiryInput["preferredFollowUp"];
  budget_hint?: string | null;
  need_summary: string;
  requested_items: B2BInquiryRequestedItemPayload[];
  notes?: string | null;
  source_page?: string | null;
  quote: {
    has_estimate: boolean;
    items: B2BQuoteItemPayload[];
    subtotal_amount?: string | null;
    shipping_amount?: string | null;
    total_amount?: string | null;
    sales_note?: string | null;
    quoted_at?: string | null;
  };
  contacted_at?: string | null;
  quoted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface SyncManifestPayload {
  cursor: string;
  etag: string;
  categories: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
  prices: Array<Record<string, unknown>>;
  banners: Array<Record<string, unknown>>;
  content_pages: Array<Record<string, unknown>>;
  settings: Array<Record<string, unknown>>;
}

export interface CheckoutResponse {
  order: {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    shipping_total?: string;
    grand_total: string;
    auto_cancel_at: string;
    shipping_method?: string;
    payment_method?: string;
    shipping_service?: string;
  };
  payment_instruction: {
    method: string;
    status: string;
  };
  next_action: string;
}

export interface ShippingDestination {
  id: string;
  label: string;
  province_name?: string | null;
  city_name?: string | null;
  district_name?: string | null;
  subdistrict_name?: string | null;
  zip_code?: string | null;
}

export interface ShippingRateItem {
  id: string;
  courier_code: string;
  courier_name: string;
  service_code: string;
  service_name: string;
  description?: string | null;
  cost: string;
  etd?: string | null;
}

export interface ShippingRatesPayload {
  destination_id: string;
  total_weight_grams: number;
  items: ShippingRateItem[];
}

export interface DuitkuCreateResponse {
  reference: string;
  payment_url: string;
  expiry: string;
  request_payload: Record<string, unknown>;
  mode: string;
  merchant_code: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

interface LaravelEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string[]>;
}

interface LaravelPaginated<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
}

interface LaravelStoreDto {
  id: number | string;
  store_name: string;
  store_code: string;
  store_address?: string | null;
  whatsapp_number?: string | null;
  operational_hours?: string | null;
  is_active?: boolean;
}

interface LaravelCategoryDto {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  is_active?: boolean;
}

interface LaravelProductImageDto {
  id: number | string;
  image_path?: string | null;
  image_url?: string | null;
  alt_text?: string | null;
  sort_order?: number | null;
  is_primary?: boolean;
}

interface LaravelProductDto {
  id: number | string;
  category_id?: number | string | null;
  category?: LaravelCategoryDto | null;
  sku: string;
  name: string;
  slug: string;
  description?: string | null;
  unit: string;
  weight_grams?: number | string | null;
  price: string | number;
  promo_price?: string | number | null;
  reseller_price?: string | number | null;
  stock_qty?: number | null;
  is_active?: boolean;
  current_price?: string | number | null;
  primary_image_url?: string | null;
  images?: LaravelProductImageDto[];
  created_at?: string | null;
  updated_at?: string | null;
  review_summary?: {
    average_rating?: number | string | null;
    total_reviews?: number | string | null;
  } | null;
}

interface LaravelBannerDto {
  id: number | string;
  title: string;
  subtitle?: string | null;
  image_path?: string | null;
  image_url?: string | null;
  link_url?: string | null;
  sort_order?: number | null;
  starts_at?: string | null;
  ends_at?: string | null;
  is_active?: boolean;
}

interface LaravelArticleSummaryDto {
  slug: string;
  title: string;
  excerpt?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  seo?: StorefrontSeo;
}

interface LaravelArticleDetailDto extends LaravelArticleSummaryDto {
  body_html: string;
}

interface LaravelWishlistPayload {
  items: Array<{
    product_id: string | number;
    product_name: string;
    product_slug: string;
    product: LaravelProductDto | ProductSummary;
    created_at: string;
  }>;
}

function buildUrl(
  base: string,
  path: string,
  query?: Record<string, string | number | undefined | null>,
) {
  const url = new URL(`${base}${path}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseStorefrontResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as LaravelEnvelope<T> | null;

  if (!response.ok) {
    throw new ApiRequestError(payload?.message || "Request API publik gagal", response.status);
  }

  if (!payload || typeof payload !== "object" || !("data" in payload)) {
    throw new ApiRequestError("Response API publik tidak valid", response.status || 500);
  }

  return payload.data;
}

async function parseCustomerResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    if (payload && typeof payload === "object" && "message" in payload) {
      throw new ApiRequestError(String(payload.message), response.status);
    }

    const message = await response.text();
    throw new ApiRequestError(message || "Request API customer gagal", response.status);
  }

  const payload = (await response.json().catch(() => null)) as LaravelEnvelope<T> | T | null;

  if (payload && typeof payload === "object" && "data" in payload && "success" in payload) {
    return payload.data;
  }

  if (payload === null) {
    throw new ApiRequestError("Response API customer tidak valid", response.status || 500);
  }

  return payload as T;
}

async function fetchJsonWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { next?: { revalidate?: number | false } },
  failureMessage: string,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15_000);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch {
    throw new ApiRequestError(failureMessage, 503);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchStorefrontServerJson<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
  revalidate: number | false = 120,
): Promise<T> {
  const response = await fetchJsonWithTimeout(buildUrl(getStorefrontApiBaseUrl(), path, query), {
    cache: revalidate === false ? "no-store" : undefined,
    next: revalidate === false ? undefined : { revalidate },
  }, "Koneksi ke API publik sedang gagal.");

  return parseStorefrontResponse<T>(response);
}

async function fetchCustomerClientJson<T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetchJsonWithTimeout(buildUrl(getCustomerApiBaseUrl(), path, query), {
    ...init,
    headers,
  }, "Koneksi ke API customer sedang gagal.");

  return parseCustomerResponse<T>(response);
}

function buildCustomerAuthHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function toStorageUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  try {
    const parsed = new URL(path);
    return parsed.toString();
  } catch {
    const origin = new URL(getStorefrontApiBaseUrl()).origin;
    return `${origin}/storage/${String(path).replace(/^\/+/, "")}`;
  }
}

function stripHtml(input?: string | null): string {
  return (input ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function truncate(input: string, length = 120): string {
  if (input.length <= length) {
    return input;
  }

  return `${input.slice(0, length - 3).trimEnd()}...`;
}

function normalizeNumber(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount =
    typeof value === "string" ? Number.parseFloat(value) : Number(value);

  if (Number.isNaN(amount)) {
    return null;
  }

  return amount.toFixed(2);
}

function mapCategory(dto: LaravelCategoryDto): CategoryItem {
  return {
    id: String(dto.id),
    name: dto.name,
    slug: dto.slug,
    parent_id: null,
  };
}

function mapProductReviewSummary(
  summary?: LaravelProductDto["review_summary"],
): ProductReviewSummaryPayload | null {
  if (!summary) {
    return null;
  }

  const totalReviewsValue =
    typeof summary.total_reviews === "number"
      ? summary.total_reviews
      : Number.parseInt(String(summary.total_reviews ?? "0"), 10);
  const totalReviews = Number.isFinite(totalReviewsValue) ? Math.max(0, totalReviewsValue) : 0;

  if (totalReviews <= 0) {
    return {
      average_rating: null,
      total_reviews: 0,
    };
  }

  const averageRatingValue =
    typeof summary.average_rating === "number"
      ? summary.average_rating
      : Number.parseFloat(String(summary.average_rating ?? ""));

  return {
    average_rating: Number.isFinite(averageRatingValue)
      ? Number(averageRatingValue.toFixed(1))
      : null,
    total_reviews: totalReviews,
  };
}

function mapProductSummary(dto: LaravelProductDto): ProductSummary {
  const description = stripHtml(dto.description);
  const stockQty = dto.stock_qty ?? null;
  const currentPrice =
    normalizeNumber(dto.current_price) ??
    normalizeNumber(dto.promo_price) ??
    normalizeNumber(dto.price);
  const basePrice = normalizeNumber(dto.price);
  const isPromo = Boolean(
    dto.promo_price !== null &&
      dto.promo_price !== undefined &&
      normalizeNumber(dto.promo_price) !== basePrice,
  );
  const imageOverrideUrl = getProductImageOverride(dto.slug);
  let images = (dto.images ?? []).map((image) => ({
    id: String(image.id),
    url: image.image_url ?? toStorageUrl(image.image_path) ?? "",
    alt_text: image.alt_text ?? dto.name,
    is_primary: Boolean(image.is_primary),
  }));
  const primaryImageUrl =
    imageOverrideUrl ??
    dto.primary_image_url ??
    images.find((image) => image.is_primary)?.url ??
    null;

  if (imageOverrideUrl) {
    images = [
      {
        id: `override-${dto.id}`,
        url: imageOverrideUrl,
        alt_text: dto.name,
        is_primary: true,
      },
    ];
  }

  if (primaryImageUrl && !images.some((image) => image.url === primaryImageUrl)) {
    images.unshift({
      id: `primary-${dto.id}`,
      url: primaryImageUrl,
      alt_text: dto.name,
      is_primary: true,
    });
  }

  const isNewArrival =
    dto.created_at !== null &&
    dto.created_at !== undefined &&
    !Number.isNaN(new Date(dto.created_at).getTime()) &&
    Date.now() - new Date(dto.created_at).getTime() < 1000 * 60 * 60 * 24 * 30;

  const availability =
    stockQty === null
      ? {
          state: "in_stock" as const,
          label: "Siap dipesan",
          stock_qty: stockQty,
        }
      : stockQty <= 0
        ? {
            state: "out_of_stock" as const,
            label: "Stok habis",
            stock_qty: stockQty,
          }
        : stockQty <= 10
          ? {
              state: "low_stock" as const,
              label: `Stok menipis (${stockQty})`,
              stock_qty: stockQty,
            }
          : {
              state: "in_stock" as const,
              label: `Stok tersedia (${stockQty})`,
              stock_qty: stockQty,
            };

  return {
    id: String(dto.id),
    sku: dto.sku,
    slug: dto.slug,
    name: dto.name,
    summary: description ? truncate(description) : null,
    description: description || null,
    product_type: dto.category?.name ?? "Produk",
    unit: dto.unit,
    weight_grams: String(dto.weight_grams ?? 0),
    badges: {
      featured: isPromo,
      new_arrival: isNewArrival,
      best_seller: false,
    },
    price: {
      type: isPromo ? "PROMO" : "NORMAL",
      amount: currentPrice ?? basePrice ?? "0.00",
      compare_at_amount: isPromo ? basePrice : null,
      min_qty: null,
      member_level: null,
      is_promo: isPromo,
    },
    availability,
    category: dto.category
      ? {
          id: String(dto.category.id),
          name: dto.category.name,
          slug: dto.category.slug,
        }
      : undefined,
    images,
    videos: [],
    created_at: dto.created_at ?? null,
    updated_at: dto.updated_at ?? dto.created_at ?? null,
    review_summary: mapProductReviewSummary(dto.review_summary),
    seo: {
      title: dto.name,
      description: description ? truncate(description, 155) : `${dto.name} - ${getStoreCode()}`,
    },
  };
}

function mapBanner(dto: LaravelBannerDto) {
  return {
    title: dto.title,
    subtitle: dto.subtitle ?? null,
    image_url: dto.image_url ?? toStorageUrl(dto.image_path),
    target_url: dto.link_url ?? null,
  };
}

function mapArticleSummary(dto: LaravelArticleSummaryDto): ArticleSummaryPayload {
  return {
    slug: dto.slug,
    title: dto.title,
    excerpt: dto.excerpt ?? null,
    published_at: dto.published_at ?? null,
    updated_at: dto.updated_at ?? dto.published_at ?? null,
  };
}

function mapArticleDetail(dto: LaravelArticleDetailDto): ContentPagePayload {
  return {
    slug: dto.slug,
    title: dto.title,
    excerpt: dto.excerpt ?? null,
    body_html: dto.body_html,
    published_at: dto.published_at ?? null,
    updated_at: dto.updated_at ?? dto.published_at ?? null,
    seo: dto.seo,
  };
}

function sortProductItems(items: ProductSummary[], sort?: string | null) {
  const sorted = [...items];

  if (sort === "name_asc") {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "id"));
  } else if (sort === "name_desc") {
    sorted.sort((a, b) => b.name.localeCompare(a.name, "id"));
  } else if (sort === "price_asc") {
    sorted.sort(
      (a, b) =>
        Number.parseFloat(a.price.amount ?? "0") - Number.parseFloat(b.price.amount ?? "0"),
    );
  } else if (sort === "price_desc") {
    sorted.sort(
      (a, b) =>
        Number.parseFloat(b.price.amount ?? "0") - Number.parseFloat(a.price.amount ?? "0"),
    );
  } else if (sort === "promo") {
    sorted.sort((a, b) => Number(b.price.is_promo) - Number(a.price.is_promo));
  } else if (sort === "best_seller") {
    sorted.sort((a, b) => {
      const aRank = Number(a.badges.best_seller) * 3 + Number(a.badges.featured);
      const bRank = Number(b.badges.best_seller) * 3 + Number(b.badges.featured);
      return bRank - aRank;
    });
  }

  return sorted;
}

async function fetchStoreProfile(): Promise<StoreProfile> {
  const dto = await fetchStorefrontServerJson<LaravelStoreDto>("/v1/public/store", undefined, 300);

  return {
    code: dto.store_code,
    name: SITE_NAME,
    address: dto.store_address ?? null,
    whatsapp_number: dto.whatsapp_number ?? null,
    operational_hours: dto.operational_hours ?? null,
  };
}

async function resolveCategoryId(categorySlug?: string | null) {
  if (!categorySlug) {
    return undefined;
  }

  const categories = await getCategories();
  return categories.find((category) => category.slug === categorySlug)?.id;
}

function buildStaticPageContent(
  slug: string,
  store: StoreProfile,
): ContentPagePayload {
  const defaultDescription =
    "Halaman informasi resmi Wiragro untuk membantu Anda memahami layanan, belanja, dan dukungan platform secara lebih jelas.";

  const pages: Record<string, ContentPagePayload> = {
    "tentang-kami": {
      slug,
      title: `Tentang ${SITE_NAME}`,
      excerpt: `${SITE_NAME} adalah platform solusi pertanian digital yang menyatukan solusi tanaman, edukasi, belanja produk, dan layanan B2C maupun B2B dalam satu tempat.`,
      body_html: `
        <p><strong>${SITE_NAME}</strong> hadir sebagai platform solusi pertanian digital untuk membantu petani, pehobi, kios, dan buyer bisnis bergerak dari masalah ke keputusan yang lebih tepat.</p>
        <p>Di satu tempat, Anda bisa mencari solusi masalah tanaman, mempelajari praktik budidaya, menemukan produk pertanian yang relevan, dan membuka jalur layanan B2C maupun B2B secara lebih rapi.</p>
        <p>Kami membangun pengalaman yang ramah, modern, dan mudah dipahami agar proses belajar sampai belanja terasa lebih tenang.</p>
        <p><strong>Alamat layanan:</strong> ${store.address ?? "-"}</p>
        <p><strong>Jam layanan:</strong> ${store.operational_hours ?? "-"}</p>
      `,
      seo: {
        title: `Tentang Kami | ${SITE_NAME}`,
        description: defaultDescription,
      },
    },
    kontak: {
      slug,
      title: "Kontak Wiragro",
      excerpt: `Hubungi tim ${SITE_NAME} untuk bantuan produk, konsultasi, pesanan, dan layanan platform.`,
      body_html: `
        <p><strong>Nama layanan:</strong> ${SITE_NAME}</p>
        <p><strong>Alamat:</strong> ${store.address ?? "-"}</p>
        <p><strong>WhatsApp:</strong> ${store.whatsapp_number ?? "-"}</p>
        <p><strong>Jam layanan:</strong> ${store.operational_hours ?? "-"}</p>
        ${
          store.address
            ? `<p><a href="${buildGoogleMapsStoreSearchUrl(SITE_NAME, store.address)}" target="_blank" rel="noreferrer">Buka lokasi di Google Maps</a></p>
               <div class="map-embed-card">
                 <iframe
                   src="${buildGoogleMapsStoreEmbedUrl(SITE_NAME, store.address)}"
                   loading="lazy"
                   referrerpolicy="no-referrer-when-downgrade"
                   title="Peta lokasi ${SITE_NAME}">
                 </iframe>
               </div>`
            : ""
        }
      `,
      seo: {
        title: `Kontak | ${SITE_NAME}`,
        description: defaultDescription,
      },
    },
    faq: {
      slug,
      title: "FAQ",
      excerpt: "Jawaban singkat untuk pertanyaan yang paling sering muncul saat menggunakan layanan Wiragro.",
      body_html: `
        <h2>Apa yang bisa saya lakukan di Wiragro?</h2>
        <p>Anda bisa mencari solusi masalah tanaman, membaca edukasi pertanian, membeli produk, melacak pesanan, dan membuka kebutuhan B2B dari satu platform.</p>
        <h2>Bagaimana cara menghubungi tim Wiragro?</h2>
        <p>Anda bisa menghubungi WhatsApp resmi di ${store.whatsapp_number ?? "-"} atau membuka halaman kontak untuk detail layanan.</p>
        <h2>Apakah AI Chat sudah tersedia?</h2>
        <p>AI Chat pertanian premium sedang dibuka bertahap. Halaman AI Chat akan memberi tahu jalur akses yang paling relevan saat ini.</p>
        <h2>Apakah semua produk selalu tersedia?</h2>
        <p>Daftar produk aktif, harga, dan opsi pembelian akan terus diperbarui agar Anda mendapat pilihan yang paling relevan saat berbelanja.</p>
      `,
      seo: {
        title: `FAQ | ${SITE_NAME}`,
        description: defaultDescription,
      },
    },
    "pengiriman-pembayaran": {
      slug,
      title: "Pengiriman dan Pembayaran",
      excerpt:
        "Ringkasan pengiriman, pickup, pembayaran, dan langkah checkout yang berlaku di Wiragro.",
      body_html: `
        <h2>Metode pengiriman</h2>
        <p>${SITE_NAME} mendukung <strong>delivery</strong> dan <strong>pickup</strong>. Untuk delivery, biaya ongkir mengikuti layanan kirim yang tersedia saat checkout.</p>
        <h2>Pickup</h2>
        <p>Pickup dapat dilakukan pada jam layanan: ${store.operational_hours ?? "-"}. Alamat pengambilan: ${store.address ?? "-"}</p>
        <h2>Metode pembayaran</h2>
        <p>Pembayaran yang didukung saat ini adalah <strong>Duitku VA</strong> dan <strong>COD / nota merah</strong> sesuai pilihan yang muncul saat checkout.</p>
        <h2>Catatan penting</h2>
        <p>Pastikan data penerima, alamat, dan nomor WhatsApp aktif sudah benar sebelum menyelesaikan pesanan agar proses konfirmasi dan pengiriman berjalan lancar.</p>
      `,
      seo: {
        title: `Pengiriman dan Pembayaran | ${SITE_NAME}`,
        description:
          "Informasi pengiriman, pickup, dan metode pembayaran yang berlaku di Wiragro.",
      },
    },
    "garansi-retur": {
      slug,
      title: "Garansi dan Retur",
      excerpt:
        "Penjelasan ringkas tentang validasi order, penanganan kendala, dan jalur bantuan jika produk atau pengiriman bermasalah.",
      body_html: `
        <h2>Validasi sebelum retur</h2>
        <p>Jika ada kendala pada pesanan, pembeli dianjurkan mengecek nomor order, kondisi barang, dan bukti penerimaan lebih dulu sebelum mengajukan komplain.</p>
        <h2>Jalur bantuan</h2>
        <p>Hubungi WhatsApp resmi di <strong>${store.whatsapp_number ?? "-"}</strong> dengan menyertakan nomor order, foto produk, dan ringkasan masalah agar tim Wiragro bisa memberi arahan yang tepat.</p>
        <h2>Garansi operasional</h2>
        <p>Kami akan membantu meninjau masalah yang terkait pesanan aktif, kesalahan item, atau kebutuhan verifikasi pengiriman sesuai data transaksi yang tersedia.</p>
        <h2>Batasan</h2>
        <p>Retur atau penukaran tidak diproses otomatis tanpa verifikasi. Keputusan tindak lanjut mengikuti hasil pengecekan terhadap kondisi produk, status pengiriman, dan bukti transaksi.</p>
      `,
      seo: {
        title: `Garansi dan Retur | ${SITE_NAME}`,
        description:
          "Informasi bantuan komplain, garansi operasional, dan alur retur yang berlaku di Wiragro.",
      },
    },
    "kebijakan-privasi": {
      slug,
      title: "Kebijakan Privasi",
      excerpt: `Ringkasan kebijakan privasi ${SITE_NAME}.`,
      body_html: `
        <p>Data yang ditampilkan di website ini digunakan untuk kebutuhan informasi produk, layanan platform, dan proses transaksi sesuai kebutuhan layanan ${SITE_NAME}.</p>
        <p>Data pengguna hanya dipakai untuk menjalankan layanan yang diminta, seperti checkout, pelacakan pesanan, login, dan komunikasi terkait transaksi atau bantuan layanan.</p>
      `,
      seo: {
        title: `Kebijakan Privasi | ${SITE_NAME}`,
        description: defaultDescription,
      },
    },
    "syarat-dan-ketentuan": {
      slug,
      title: "Syarat dan Ketentuan",
      excerpt: `Ketentuan dasar penggunaan platform dan pemesanan produk di ${SITE_NAME}.`,
      body_html: `
        <p>Seluruh informasi produk, harga, ketersediaan, dan layanan dapat berubah mengikuti pembaruan yang berlaku di platform.</p>
        <p>Pemesanan dianggap sah setelah data pesanan diterima dan diverifikasi sesuai metode pembayaran yang dipilih.</p>
      `,
      seo: {
        title: `Syarat dan Ketentuan | ${SITE_NAME}`,
        description: defaultDescription,
      },
    },
  };

  const page = pages[slug];
  if (!page) {
    throw new Error("Halaman tidak ditemukan");
  }

  return page;
}

export function getFallbackStoreProfile() {
  return {
    code: getStoreCode(),
    name: SITE_NAME,
    address: "RT 04 RW 13, Desa Panjerejo, Kecamatan Rejotangan, Kabupaten Tulungagung, Jawa Timur 66293",
    whatsapp_number: "6281234567890",
    operational_hours: "Senin - Sabtu, 08:00 - 17:00",
  } satisfies StoreProfile;
}

export async function getStoreProfile() {
  return fetchStoreProfile();
}

export function getFallbackHomeData(): HomePayload {
  const store = getFallbackStoreProfile();

  return {
    store,
    banners: [],
    featured_products: [],
    new_arrivals: [],
    best_sellers: [],
    category_highlights: [],
    seo: {
      title: `${SITE_NAME} | Produk Pertanian`,
      description: "Data produk sedang dimuat ulang. Silakan coba lagi beberapa saat lagi.",
    },
  };
}

export function getFallbackProductList(
  query?: Record<string, string | number | undefined | null>,
): ProductListPayload {
  const search = typeof query?.q === "string" ? query.q : undefined;
  const categorySlug =
    typeof query?.category_slug === "string" ? query.category_slug : undefined;
  const sort = typeof query?.sort === "string" ? query.sort : "latest";

  return {
    items: [],
    pagination: {
      page: 1,
      page_size: 20,
      count: 0,
    },
    available_filters: {
      category_slug: categorySlug ?? null,
      sort,
    },
    seo: {
      title: categorySlug ? `Produk ${categorySlug}` : "Produk Pertanian",
      description: search
        ? `Hasil pencarian "${search}" sedang dimuat ulang.`
        : "Daftar produk sedang dimuat ulang. Silakan coba lagi beberapa saat lagi.",
    },
  };
}

export async function getHomeData(): Promise<HomePayload> {
  const [storeResult, bannersResult, categoriesResult, productsResult] = await Promise.allSettled([
    fetchStoreProfile(),
    fetchStorefrontServerJson<LaravelBannerDto[]>("/v1/public/banners", undefined, 120),
    getCategories(),
    getProducts({ page_size: 12, sort: "latest" }),
  ]);

  const store =
    storeResult.status === "fulfilled" ? storeResult.value : getFallbackStoreProfile();
  const banners = bannersResult.status === "fulfilled" ? bannersResult.value : [];
  const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
  const products =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : getFallbackProductList({ page_size: 12, sort: "latest" });

  const promoProducts = products.items.filter((product) => product.price.is_promo);

  return {
    store,
    banners: banners.map(mapBanner),
    featured_products: products.items.slice(0, 4),
    new_arrivals: products.items.slice(0, 4),
    best_sellers: (promoProducts.length ? promoProducts : products.items).slice(0, 4),
    category_highlights: categories.slice(0, 8).map((item) => ({
      name: item.name,
      slug: item.slug,
    })),
    seo: {
      title: `${SITE_NAME} | Produk Pertanian`,
      description:
        "Jelajahi produk pertanian aktif, rekomendasi kebutuhan lapangan, dan penawaran terbaru dari Wiragro.",
    },
  };
}

export async function getCategories() {
  const payload = await fetchStorefrontServerJson<LaravelCategoryDto[]>(
    "/v1/public/categories",
    undefined,
    false,
  );

  return payload.map(mapCategory);
}

export async function getProducts(query?: Record<string, string | number | undefined | null>) {
  const categorySlug =
    typeof query?.category_slug === "string" ? query.category_slug : undefined;
  const categoryId =
    typeof query?.category_id === "string" || typeof query?.category_id === "number"
      ? query.category_id
      : await resolveCategoryId(categorySlug);
  const sort = typeof query?.sort === "string" ? query.sort : undefined;
  const search = typeof query?.q === "string" ? query.q : undefined;
  const page =
    typeof query?.page === "number"
      ? query.page
      : typeof query?.page === "string"
        ? Number.parseInt(query.page, 10)
        : 1;
  const pageSize =
    typeof query?.page_size === "number"
      ? query.page_size
      : typeof query?.page_size === "string"
        ? Number.parseInt(query.page_size, 10)
        : 20;

  const payload = await fetchStorefrontServerJson<LaravelPaginated<LaravelProductDto>>(
    "/v1/public/products",
    {
      search,
      category_id: categoryId,
      page,
      per_page: pageSize,
    },
    false,
  );

  const items = sortProductItems(payload.data.map(mapProductSummary), sort);

  return {
    items,
    pagination: {
      page: payload.current_page,
      page_size: payload.per_page,
      count: payload.total,
    },
    available_filters: {
      category_slug: categorySlug ?? null,
      sort: sort ?? "latest",
    },
    seo: {
      title: categorySlug ? `Produk ${categorySlug}` : "Produk Pertanian",
      description: search
        ? `Hasil pencarian produk untuk kata kunci ${search}.`
        : "Daftar produk pertanian aktif dari Wiragro.",
    },
  } satisfies ProductListPayload;
}

export async function getProduct(slug: string): Promise<ProductDetailPayload> {
  const dto = await fetchStorefrontServerJson<LaravelProductDto>(
    `/v1/public/products/${slug}`,
    undefined,
    false,
  );

  const product = mapProductSummary(dto);
  let relatedProducts: ProductSummary[] = [];

  if (dto.category_id) {
    try {
      const related = await getProducts({
        category_id: dto.category_id,
        page_size: 4,
      });

      relatedProducts = related.items.filter((item) => item.id !== String(dto.id)).slice(0, 4);
    } catch {
      relatedProducts = [];
    }
  }

  return {
    ...product,
    promotions: product.price.is_promo
      ? [
          {
            code: "PROMO-HARGA",
            name: "Harga promo aktif",
            rule_payload: {
              normal_price: product.price.compare_at_amount,
              promo_price: product.price.amount,
            },
          },
        ]
      : [],
    related_products: relatedProducts,
    stock_badge:
      (dto.stock_qty ?? 0) > 0
        ? {
            state: (dto.stock_qty ?? 0) <= 10 ? "low" : "available",
            message:
              (dto.stock_qty ?? 0) <= 10
                ? `Stok menipis (${dto.stock_qty} tersisa)`
                : `Tersedia ${dto.stock_qty} item`,
          }
        : {
            state: "empty",
            message: "Stok habis",
          },
  };
}

export async function getStaticPage(slug: string) {
  const store = await fetchStoreProfile().catch(() => getFallbackStoreProfile());
  return buildStaticPageContent(slug, store);
}

export async function getArticles(
  query?: Record<string, string | number | undefined | null>,
): Promise<ArticleListPayload> {
  const page =
    typeof query?.page === "number"
      ? query.page
      : typeof query?.page === "string"
        ? Number.parseInt(query.page, 10)
        : 1;
  const pageSize =
    typeof query?.page_size === "number"
      ? query.page_size
      : typeof query?.page_size === "string"
        ? Number.parseInt(query.page_size, 10)
        : 9;
  const search = typeof query?.q === "string" ? query.q.trim().toLowerCase() : "";

  try {
    const payload = await fetchStorefrontServerJson<{
      items: LaravelArticleSummaryDto[];
      pagination?: {
        page?: number;
        page_size?: number;
        count?: number;
      };
    }>("/v1/public/articles", { page, page_size: Math.max(pageSize, 24), q: search || undefined }, 60);

    const merged = mergeArticleSummaries((payload.items ?? []).map(mapArticleSummary));
    const filtered = search
      ? merged.filter((article) =>
          `${article.title} ${article.excerpt ?? ""} ${(article.taxonomy_labels ?? []).join(" ")}`
            .toLowerCase()
            .includes(search),
        )
      : merged;
    const startIndex = Math.max(0, (page - 1) * pageSize);
    const items = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items,
      pagination: {
        page,
        page_size: pageSize,
        count: filtered.length,
      },
    };
  } catch {
    const fallback = getFallbackArticleSummaries();
    const filtered = search
      ? fallback.filter((article) =>
          `${article.title} ${article.excerpt ?? ""} ${(article.taxonomy_labels ?? []).join(" ")}`
            .toLowerCase()
            .includes(search),
        )
      : fallback;
    const startIndex = Math.max(0, (page - 1) * pageSize);

    return {
      items: filtered.slice(startIndex, startIndex + pageSize),
      pagination: {
        page,
        page_size: pageSize,
        count: filtered.length,
      },
    };
  }
}

export async function getArticle(slug: string): Promise<ContentPagePayload> {
  try {
    const dto = await fetchStorefrontServerJson<LaravelArticleDetailDto>(
      `/v1/public/articles/${slug}`,
      undefined,
      60,
    );

    return enrichArticleDetail(mapArticleDetail(dto));
  } catch (error) {
    const fallback = getFallbackArticleBySlug(slug);

    if (fallback) {
      return {
        slug: fallback.slug,
        title: fallback.title,
        excerpt: fallback.excerpt ?? null,
        body_html: fallback.body_html ?? "<p>Konten artikel sedang diperbarui.</p>",
        published_at: fallback.published_at ?? null,
        updated_at: fallback.updated_at ?? null,
        seo: {
          title: fallback.title,
          description: fallback.excerpt ?? null,
          keywords: fallback.taxonomy_labels ?? [],
        },
        reading_time_minutes: fallback.reading_time_minutes,
        taxonomy: fallback.taxonomy,
        taxonomy_labels: fallback.taxonomy_labels,
        key_takeaways: fallback.key_takeaways,
        related_product_queries: fallback.related_product_queries,
        related_solution: fallback.related_solution,
        related_commodity: fallback.related_commodity,
        user_goal_summary: fallback.user_goal_summary,
      };
    }

    throw error;
  }
}

export async function getSeo(path: string) {
  const store = await fetchStoreProfile().catch(() => getFallbackStoreProfile());

  return {
    title: `${SITE_NAME} | ${path === "/" ? "Beranda" : path.replace(/\//g, " ").trim()}`,
    description: BRAND_SUBTAGLINE,
    canonical_url: `${getSiteUrl()}${path}`,
  };
}

export async function getProductReviews(slug: string): Promise<ProductReviewFeedPayload> {
  return fetchStorefrontServerJson<ProductReviewFeedPayload>(
    `/v1/public/products/${slug}/reviews`,
    undefined,
    60,
  );
}

export async function createGuestCart() {
  return fetchCustomerClientJson<{ cart_id: string; guest_token: string }>(
    "/customer/carts/guest",
    {
      method: "POST",
      body: JSON.stringify({ store_code: getStoreCode() }),
    },
  );
}

export async function getGuestCart(cartId: string, guestToken: string) {
  return fetchCustomerClientJson<CartPayload>(
    "/customer/carts/current",
    undefined,
    { cart_id: cartId, guest_token: guestToken },
  );
}

export async function addItemToCart(
  cartId: string,
  guestToken: string,
  productId: string,
  qty: number,
) {
  return fetchCustomerClientJson<CartPayload>("/customer/carts/items", {
    method: "POST",
    body: JSON.stringify({
      cart_id: cartId,
      guest_token: guestToken,
      product_id: productId,
      qty,
    }),
  });
}

export async function updateCartItem(
  itemId: string,
  cartId: string,
  guestToken: string,
  qty: number,
) {
  return fetchCustomerClientJson<CartPayload>(`/customer/carts/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify({
      cart_id: cartId,
      guest_token: guestToken,
      qty,
    }),
  });
}

export async function submitGuestCheckout(payload: {
  cartId: string;
  guestToken: string;
  fullName: string;
  phone: string;
  email?: string;
  shippingMethod: "pickup" | "delivery";
  addressLine?: string;
  district?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  shippingSelection?: {
    destinationId: string;
    destinationLabel: string;
    provinceName?: string | null;
    cityName?: string | null;
    districtName?: string | null;
    subdistrictName?: string | null;
    zipCode?: string | null;
    courierCode: string;
    courierName: string;
    serviceCode: string;
    serviceName: string;
    description?: string | null;
    cost: string;
    etd?: string | null;
  };
  paymentMethod: string;
  notes?: string;
}) {
  return fetchCustomerClientJson<CheckoutResponse>("/customer/checkout/guest", {
    method: "POST",
    body: JSON.stringify({
      cart_id: payload.cartId,
      guest_token: payload.guestToken,
      customer: {
        full_name: payload.fullName,
        phone: payload.phone,
        email: payload.email || null,
      },
      shipping_method: payload.shippingMethod,
      pickup_store_code: payload.shippingMethod === "pickup" ? getStoreCode() : null,
      address:
        payload.shippingMethod === "delivery"
          ? {
              recipient_name: payload.fullName,
              recipient_phone: payload.phone,
              address_line: payload.addressLine,
              district: payload.district,
              city: payload.city,
              province: payload.province,
              postal_code: payload.postalCode,
            }
          : null,
      shipping:
        payload.shippingMethod === "delivery" && payload.shippingSelection
          ? {
              destination_id: payload.shippingSelection.destinationId,
              destination_label: payload.shippingSelection.destinationLabel,
              province_name: payload.shippingSelection.provinceName ?? null,
              city_name: payload.shippingSelection.cityName ?? null,
              district_name: payload.shippingSelection.districtName ?? null,
              subdistrict_name: payload.shippingSelection.subdistrictName ?? null,
              zip_code: payload.shippingSelection.zipCode ?? null,
              courier_code: payload.shippingSelection.courierCode,
              courier_name: payload.shippingSelection.courierName,
              service_code: payload.shippingSelection.serviceCode,
              service_name: payload.shippingSelection.serviceName,
              description: payload.shippingSelection.description ?? null,
              cost: payload.shippingSelection.cost,
              etd: payload.shippingSelection.etd ?? null,
            }
          : null,
      payment_method: payload.paymentMethod,
      notes: payload.notes || null,
    }),
  });
}

export async function searchShippingDestinations(search: string, limit = 8) {
  return fetchCustomerClientJson<{ items: ShippingDestination[] }>(
    "/customer/shipping/destinations",
    undefined,
    { search, limit },
  );
}

export async function getShippingRates(
  cartId: string,
  guestToken: string,
  destinationId: string,
  courier?: string,
) {
  return fetchCustomerClientJson<ShippingRatesPayload>("/customer/shipping/rates", {
    method: "POST",
    body: JSON.stringify({
      cart_id: cartId,
      guest_token: guestToken,
      destination_id: destinationId,
      courier: courier ?? null,
    }),
  });
}

export async function logoutCustomer(accessToken: string) {
  return fetchCustomerClientJson<{ status: string }>("/customer/auth/logout", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function createDuitkuPayment(
  orderId: string,
  options?: {
    accessToken?: string;
    customerPhone?: string;
  },
) {
  const path = options?.accessToken
    ? "/customer/payments/duitku/create/me"
    : "/customer/payments/duitku/create";

  const headers = options?.accessToken
    ? {
        Authorization: `Bearer ${options.accessToken}`,
      }
    : undefined;

  return fetchCustomerClientJson<DuitkuCreateResponse>(path, {
    method: "POST",
    headers,
    body: JSON.stringify({
      order_id: orderId,
      customer_phone: options?.customerPhone ?? null,
      callback_url: `${getCustomerApiBaseUrl()}/payments/duitku/callback`,
      return_url: `${getSiteUrl()}/checkout?payment=return`,
    }),
  });
}

export async function trackOrder(orderNumber: string, phone: string) {
  return fetchCustomerClientJson<TrackOrderPayload>(
    "/customer/orders/track",
    undefined,
    { order_number: orderNumber, phone },
  );
}

export async function getCustomerProductReviewStatus(
  accessToken: string,
  productId: string,
) {
  return fetchCustomerClientJson<CustomerProductReviewStatusPayload>(
    `/customer/products/${productId}/review-status`,
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
  );
}

export async function submitProductReview(
  accessToken: string,
  productId: string,
  payload: {
    rating: number;
    title?: string;
    body: string;
    usageContext?: string;
  },
) {
  return fetchCustomerClientJson<{
    status: string;
    review: CustomerProductReviewPayload;
  }>(`/customer/products/${productId}/reviews`, {
    method: "POST",
    headers: buildCustomerAuthHeaders(accessToken),
    body: JSON.stringify({
      rating: payload.rating,
      title: payload.title?.trim() || null,
      body: payload.body,
      usage_context: payload.usageContext?.trim() || null,
    }),
  });
}

export async function submitB2BInquiry(
  payload: B2BInquiryInput,
  options?: { accessToken?: string },
) {
  const path = options?.accessToken
    ? "/customer/b2b-inquiries/me"
    : "/customer/b2b-inquiries";
  const requestedItems = payload.requestedItems
    .map((item) => ({
      label: item.label.trim(),
      qty: item.qty?.trim() || null,
      unit: item.unit?.trim() || null,
      notes: item.notes?.trim() || null,
    }))
    .filter((item) => item.label.length > 0);

  return fetchCustomerClientJson<B2BInquiryResponsePayload>(path, {
    method: "POST",
    headers: options?.accessToken ? buildCustomerAuthHeaders(options.accessToken) : undefined,
    body: JSON.stringify({
      store_code: payload.storeCode ?? getStoreCode(),
      buyer_type: payload.buyerType,
      business_name: payload.businessName?.trim() || null,
      contact_name: payload.contactName.trim(),
      phone: payload.phone.trim(),
      email: payload.email?.trim() || null,
      commodity_focus: payload.commodityFocus?.trim() || null,
      commodity_slug: payload.commoditySlug?.trim() || null,
      bundle_slug: payload.bundleSlug?.trim() || null,
      campaign_slug: payload.campaignSlug?.trim() || null,
      product_slug: payload.productSlug?.trim() || null,
      product_name: payload.productName?.trim() || null,
      monthly_volume: payload.monthlyVolume?.trim() || null,
      fulfillment_type: payload.fulfillmentType ?? null,
      preferred_follow_up: payload.preferredFollowUp,
      budget_hint: payload.budgetHint?.trim() || null,
      need_summary: payload.needSummary.trim(),
      requested_items: requestedItems,
      notes: payload.notes?.trim() || null,
      source_page: payload.sourcePage?.trim() || null,
    }),
  });
}

export async function getCustomerB2BInquiries(accessToken: string) {
  return fetchCustomerClientJson<{ items: CustomerB2BInquiryPayload[] }>(
    "/customer/b2b-inquiries/me",
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
  );
}

export async function getCustomerB2BInquiry(accessToken: string, inquiryId: string) {
  return fetchCustomerClientJson<CustomerB2BInquiryPayload>(
    `/customer/b2b-inquiries/me/${inquiryId}`,
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
  );
}

export async function getCustomerAccount(accessToken: string) {
  return fetchCustomerClientJson<CustomerAccountPayload>("/customer/me", {
    headers: buildCustomerAuthHeaders(accessToken),
  });
}

export async function getCustomerAddresses(accessToken: string) {
  return fetchCustomerClientJson<{ items: CustomerAddressPayload[] }>(
    "/customer/me/addresses",
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
  );
}

export async function createCustomerAddress(
  accessToken: string,
  payload: CustomerAddressInput,
) {
  return fetchCustomerClientJson<{
    status: string;
    address: CustomerAddressPayload;
  }>("/customer/me/addresses", {
    method: "POST",
    headers: buildCustomerAuthHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function updateCustomerAddress(
  accessToken: string,
  addressId: string,
  payload: CustomerAddressInput,
) {
  return fetchCustomerClientJson<{
    status: string;
    address: CustomerAddressPayload;
  }>(`/customer/me/addresses/${addressId}`, {
    method: "PATCH",
    headers: buildCustomerAuthHeaders(accessToken),
    body: JSON.stringify(payload),
  });
}

export async function deleteCustomerAddress(accessToken: string, addressId: string) {
  return fetchCustomerClientJson<{
    status: string;
    address_id: string;
  }>(`/customer/me/addresses/${addressId}`, {
    method: "DELETE",
    headers: buildCustomerAuthHeaders(accessToken),
  });
}

export async function getCustomerOrders(accessToken: string, limit = 12) {
  return fetchCustomerClientJson<{ items: CustomerOrderSummaryPayload[] }>(
    "/customer/orders/me",
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
    { limit },
  );
}

export async function getCustomerOrderDetail(accessToken: string, orderId: string) {
  return fetchCustomerClientJson<CustomerOrderDetailPayload>(
    `/customer/orders/me/${orderId}`,
    {
      headers: buildCustomerAuthHeaders(accessToken),
    },
  );
}

export async function requestWhatsAppOtp(phone: string) {
  return fetchCustomerClientJson<{
    challenge_id: string;
    expires_in_seconds: number;
    debug_otp_code?: string;
  }>("/customer/auth/whatsapp/request-otp", {
    method: "POST",
    body: JSON.stringify({ store_code: getStoreCode(), phone }),
  });
}

export async function verifyWhatsAppOtp(challengeId: string, otpCode: string) {
  return fetchCustomerClientJson<CustomerSession>("/customer/auth/whatsapp/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      store_code: getStoreCode(),
      challenge_id: challengeId,
      otp_code: otpCode,
    }),
  });
}

export async function loginGoogleIdToken(idToken: string) {
  return fetchCustomerClientJson<CustomerSession>("/customer/auth/google", {
    method: "POST",
    body: JSON.stringify({
      store_code: getStoreCode(),
      id_token: idToken,
    }),
  });
}

export async function getWishlist(accessToken: string) {
  const payload = await fetchCustomerClientJson<LaravelWishlistPayload | WishlistPayload>(
    "/customer/wishlist",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    items: payload.items.map((item) => ({
      product_id: String(item.product_id),
      product_name: item.product_name,
      product_slug: item.product_slug,
      product:
        "badges" in item.product
          ? item.product
          : mapProductSummary(item.product),
      created_at: item.created_at,
    })),
  } satisfies WishlistPayload;
}

export async function addWishlistItem(accessToken: string, productId: string) {
  return fetchCustomerClientJson<{ status: string; product_id: string }>(
    "/customer/wishlist/items",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ product_id: productId }),
    },
  );
}

export async function removeWishlistItem(accessToken: string, productId: string) {
  return fetchCustomerClientJson<{ status: string; product_id: string }>(
    `/customer/wishlist/items/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export async function getCacheManifest(): Promise<SyncManifestPayload> {
  const [categories, products, banners, store] = await Promise.all([
    getCategories(),
    getProducts({ page_size: 50 }),
    fetchStorefrontServerJson<LaravelBannerDto[]>("/v1/public/banners", undefined, 120),
    fetchStoreProfile(),
  ]);

  return {
    cursor: "laravel-mvp",
    etag: `${products.pagination.count}-${categories.length}-${banners.length}`,
    categories: categories.map((category) => ({ ...category })),
    products: products.items.map((product) => ({ ...product })),
    prices: products.items.map((product) => ({
      product_id: product.id,
      amount: product.price.amount,
      compare_at_amount: product.price.compare_at_amount ?? null,
      price_type: product.price.type ?? "NORMAL",
    })),
    banners: banners.map(mapBanner),
    content_pages: [],
    settings: [store],
  };
}
