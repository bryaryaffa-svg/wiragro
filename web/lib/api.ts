import {
  customerApiBaseUrl,
  siteUrl,
  storefrontApiBaseUrl,
  storeCode,
} from "@/lib/config";
import {
  buildGoogleMapsStoreEmbedUrl,
  buildGoogleMapsStoreSearchUrl,
} from "@/lib/maps";

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
  seo?: StorefrontSeo;
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

export interface ContentPagePayload {
  slug: string;
  title: string;
  excerpt?: string | null;
  body_html: string;
  seo?: StorefrontSeo;
}

export interface ArticleListPayload {
  items: Array<{
    slug: string;
    title: string;
    excerpt?: string | null;
    published_at?: string | null;
  }>;
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

  return response.json() as Promise<T>;
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
  revalidate = 120,
): Promise<T> {
  const response = await fetchJsonWithTimeout(buildUrl(storefrontApiBaseUrl, path, query), {
    next: { revalidate },
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

  const response = await fetchJsonWithTimeout(buildUrl(customerApiBaseUrl, path, query), {
    ...init,
    headers,
  }, "Koneksi ke API customer sedang gagal.");

  return parseCustomerResponse<T>(response);
}

function toStorageUrl(path?: string | null): string | null {
  if (!path) {
    return null;
  }

  try {
    const parsed = new URL(path);
    return parsed.toString();
  } catch {
    const origin = new URL(storefrontApiBaseUrl).origin;
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

  return `${input.slice(0, length - 1).trimEnd()}…`;
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
  const images = (dto.images ?? []).map((image) => ({
    id: String(image.id),
    url: image.image_url ?? toStorageUrl(image.image_path) ?? "",
    alt_text: image.alt_text ?? dto.name,
    is_primary: Boolean(image.is_primary),
  }));
  const primaryImageUrl =
    dto.primary_image_url ?? images.find((image) => image.is_primary)?.url ?? null;

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
    seo: {
      title: dto.name,
      description: description ? truncate(description, 155) : `${dto.name} - ${storeCode}`,
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
    name: dto.store_name,
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
    "Halaman informasi storefront ini ditampilkan dengan struktur baru yang siap dipindahkan sepenuhnya ke SiGe Manager.";

  const pages: Record<string, ContentPagePayload> = {
    "tentang-kami": {
      slug,
      title: `Tentang ${store.name}`,
      excerpt: `${store.name} adalah storefront resmi yang menampilkan katalog dan informasi toko dari backend terpusat SiGe Manager.`,
      body_html: `
        <p>${store.name} hadir untuk memudahkan customer melihat produk aktif, harga terbaru, dan informasi toko dari satu sumber data yang sama.</p>
        <p>Semua katalog publik di website ini sekarang disiapkan untuk membaca API terpusat, sehingga perubahan produk, harga, stok, dan banner tidak perlu lagi dikelola terpisah.</p>
        <p><strong>Alamat toko:</strong> ${store.address ?? "-"}</p>
        <p><strong>Jam operasional:</strong> ${store.operational_hours ?? "-"}</p>
      `,
      seo: {
        title: `Tentang Kami | ${store.name}`,
        description: defaultDescription,
      },
    },
    kontak: {
      slug,
      title: "Kontak Toko",
      excerpt: `Hubungi ${store.name} melalui alamat dan WhatsApp resmi yang dikelola dari sistem pusat.`,
      body_html: `
        <p><strong>Nama toko:</strong> ${store.name}</p>
        <p><strong>Alamat:</strong> ${store.address ?? "-"}</p>
        <p><strong>WhatsApp:</strong> ${store.whatsapp_number ?? "-"}</p>
        <p><strong>Jam operasional:</strong> ${store.operational_hours ?? "-"}</p>
        ${
          store.address
            ? `<p><a href="${buildGoogleMapsStoreSearchUrl(store.name, store.address)}" target="_blank" rel="noreferrer">Buka lokasi di Google Maps</a></p>
               <div class="map-embed-card">
                 <iframe
                   src="${buildGoogleMapsStoreEmbedUrl(store.name, store.address)}"
                   loading="lazy"
                   referrerpolicy="no-referrer-when-downgrade"
                   title="Peta lokasi ${store.name}">
                 </iframe>
               </div>`
            : ""
        }
      `,
      seo: {
        title: `Kontak | ${store.name}`,
        description: defaultDescription,
      },
    },
    faq: {
      slug,
      title: "FAQ",
      excerpt: "Jawaban singkat untuk pertanyaan yang paling sering muncul saat menggunakan storefront.",
      body_html: `
        <h2>Apakah harga di website selalu terbaru?</h2>
        <p>Website membaca data dari backend terpusat, sehingga harga dan status produk mengikuti data yang dikelola admin.</p>
        <h2>Bagaimana cara menghubungi toko?</h2>
        <p>Anda bisa menghubungi toko melalui WhatsApp resmi: ${store.whatsapp_number ?? "-"}</p>
        <h2>Apakah semua produk selalu tersedia?</h2>
        <p>Ketersediaan mengikuti stok yang dicatat di sistem admin. Produk yang nonaktif tidak akan ditampilkan di katalog publik.</p>
      `,
      seo: {
        title: `FAQ | ${store.name}`,
        description: defaultDescription,
      },
    },
    "kebijakan-privasi": {
      slug,
      title: "Kebijakan Privasi",
      excerpt: "Ringkasan kebijakan privasi storefront Kios Sidomakmur.",
      body_html: `
        <p>Data yang ditampilkan di website ini digunakan untuk kebutuhan informasi produk, kontak toko, dan proses transaksi sesuai kebutuhan operasional toko.</p>
        <p>Data customer hanya dipakai untuk menjalankan layanan yang diminta, seperti proses checkout, pelacakan pesanan, dan komunikasi terkait transaksi.</p>
      `,
      seo: {
        title: `Kebijakan Privasi | ${store.name}`,
        description: defaultDescription,
      },
    },
    "syarat-dan-ketentuan": {
      slug,
      title: "Syarat dan Ketentuan",
      excerpt: "Ketentuan dasar penggunaan storefront dan pemesanan produk.",
      body_html: `
        <p>Seluruh informasi produk, harga, dan ketersediaan dapat berubah mengikuti data yang dikelola toko melalui sistem admin.</p>
        <p>Pemesanan dianggap sah setelah data order diterima sistem dan diverifikasi sesuai metode pembayaran yang dipilih.</p>
      `,
      seo: {
        title: `Syarat dan Ketentuan | ${store.name}`,
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
    code: storeCode,
    name: "Kios Sidomakmur",
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
      title: `${store.name} | Katalog Produk`,
      description: "Katalog sedang dimuat ulang. Silakan coba lagi beberapa saat lagi.",
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
      title: categorySlug ? `Kategori ${categorySlug}` : "Katalog Produk",
      description: search
        ? `Katalog sedang dimuat ulang untuk pencarian ${search}.`
        : "Katalog sedang dimuat ulang. Silakan coba lagi beberapa saat lagi.",
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
      title: `${store.name} | Katalog Produk`,
      description: `Lihat katalog aktif ${store.name}, termasuk produk pertanian, kebutuhan toko, dan promo terbaru.`,
    },
  };
}

export async function getCategories() {
  const payload = await fetchStorefrontServerJson<LaravelCategoryDto[]>(
    "/v1/public/categories",
    undefined,
    300,
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
    120,
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
      title: categorySlug ? `Kategori ${categorySlug}` : "Katalog Produk",
      description: search
        ? `Hasil pencarian produk untuk kata kunci ${search}.`
        : "Daftar produk aktif dari SiGe Manager.",
    },
  } satisfies ProductListPayload;
}

export async function getProduct(slug: string): Promise<ProductDetailPayload> {
  const dto = await fetchStorefrontServerJson<LaravelProductDto>(
    `/v1/public/products/${slug}`,
    undefined,
    120,
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

  return {
    items: [],
    pagination: {
      page,
      page_size: pageSize,
      count: 0,
    },
  };
}

export async function getArticle(_slug: string): Promise<ContentPagePayload> {
  throw new Error("Artikel belum dipublikasikan dari backend Laravel MVP.");
}

export async function getSeo(path: string) {
  const store = await fetchStoreProfile().catch(() => getFallbackStoreProfile());

  return {
    title: `${store.name} | ${path === "/" ? "Beranda" : path.replace(/\//g, " ").trim()}`,
    description: `Storefront ${store.name} menampilkan produk aktif, banner, dan informasi toko dari backend SiGe Manager.`,
    canonical_url: `${siteUrl}${path}`,
  };
}

export async function createGuestCart() {
  return fetchCustomerClientJson<{ cart_id: string; guest_token: string }>(
    "/customer/carts/guest",
    {
      method: "POST",
      body: JSON.stringify({ store_code: storeCode }),
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
      pickup_store_code: payload.shippingMethod === "pickup" ? storeCode : null,
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
      callback_url: `${customerApiBaseUrl}/payments/duitku/callback`,
      return_url: `${siteUrl}/checkout?payment=return`,
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

export async function requestWhatsAppOtp(phone: string) {
  return fetchCustomerClientJson<{
    challenge_id: string;
    expires_in_seconds: number;
    debug_otp_code?: string;
  }>("/customer/auth/whatsapp/request-otp", {
    method: "POST",
    body: JSON.stringify({ store_code: storeCode, phone }),
  });
}

export async function verifyWhatsAppOtp(challengeId: string, otpCode: string) {
  return fetchCustomerClientJson<CustomerSession>("/customer/auth/whatsapp/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      store_code: storeCode,
      challenge_id: challengeId,
      otp_code: otpCode,
    }),
  });
}

export async function loginGoogleIdToken(idToken: string) {
  return fetchCustomerClientJson<CustomerSession>("/customer/auth/google", {
    method: "POST",
    body: JSON.stringify({
      store_code: storeCode,
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
