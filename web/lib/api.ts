import { apiBaseUrl, publicApiBaseUrl, siteUrl, storeCode } from "@/lib/config";

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
    min_qty?: number | null;
    member_level?: string | null;
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
  };
  banners: Array<{
    title: string;
    subtitle?: string | null;
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
  items: Array<{
    id: string;
    product_id: string;
    product_name?: string | null;
    qty: number;
    price_snapshot: {
      amount?: string;
      price_type?: string;
    };
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
  };
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
    grand_total: string;
    auto_cancel_at: string;
  };
  payment_instruction: {
    method: string;
    status: string;
  };
  next_action: string;
}

export interface DuitkuCreateResponse {
  reference: string;
  payment_url: string;
  expiry: string;
  request_payload: Record<string, unknown>;
  mode: string;
  merchant_code: string;
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

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request API gagal");
  }

  return response.json() as Promise<T>;
}

export async function fetchServerJson<T>(
  path: string,
  query?: Record<string, string | number | undefined | null>,
  revalidate = 120,
): Promise<T> {
  const response = await fetch(buildUrl(apiBaseUrl, path, query), {
    next: { revalidate },
  });

  return parseResponse<T>(response);
}

export async function fetchClientJson<T>(
  path: string,
  init?: RequestInit,
  query?: Record<string, string | number | undefined | null>,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(publicApiBaseUrl, path, query), {
    ...init,
    headers,
  });

  return parseResponse<T>(response);
}

export async function getHomeData() {
  return fetchServerJson<HomePayload>("/storefront/home", { store_code: storeCode }, 120);
}

export async function getCategories() {
  const payload = await fetchServerJson<{ items: CategoryItem[] }>(
    "/storefront/categories",
    { store_code: storeCode },
    300,
  );

  return payload.items;
}

export async function getProducts(query?: Record<string, string | number | undefined | null>) {
  return fetchServerJson<ProductListPayload>(
    "/storefront/products",
    { store_code: storeCode, ...query },
    120,
  );
}

export async function getProduct(slug: string) {
  return fetchServerJson<ProductDetailPayload>(
    `/storefront/products/${slug}`,
    { store_code: storeCode },
    120,
  );
}

export async function getStaticPage(slug: string) {
  return fetchServerJson<ContentPagePayload>(
    `/storefront/pages/${slug}`,
    { store_code: storeCode },
    300,
  );
}

export async function getArticles(query?: Record<string, string | number | undefined | null>) {
  return fetchServerJson<ArticleListPayload>(
    "/storefront/articles",
    { store_code: storeCode, ...query },
    120,
  );
}

export async function getArticle(slug: string) {
  return fetchServerJson<ContentPagePayload>(
    `/storefront/articles/${slug}`,
    { store_code: storeCode },
    120,
  );
}

export async function getSeo(path: string) {
  return fetchServerJson<StorefrontSeo & { canonical_url?: string }>(
    "/storefront/seo",
    { store_code: storeCode, path },
    300,
  );
}

export async function createGuestCart() {
  return fetchClientJson<{ cart_id: string; guest_token: string }>(
    "/customer/carts/guest",
    {
      method: "POST",
      body: JSON.stringify({ store_code: storeCode }),
    },
  );
}

export async function getGuestCart(cartId: string, guestToken: string) {
  return fetchClientJson<CartPayload>(
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
  return fetchClientJson<CartPayload>("/customer/carts/items", {
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
  return fetchClientJson<CartPayload>(`/customer/carts/items/${itemId}`, {
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
  paymentMethod: string;
  notes?: string;
}) {
  return fetchClientJson<CheckoutResponse>("/customer/checkout/guest", {
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
      payment_method: payload.paymentMethod,
      notes: payload.notes || null,
    }),
  });
}

export async function createDuitkuPayment(orderId: string) {
  return fetchClientJson<DuitkuCreateResponse>(
    "/customer/payments/duitku/create",
    {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        callback_url: `${publicApiBaseUrl}/payments/duitku/callback`,
        return_url: `${siteUrl}/checkout?payment=return`,
      }),
    },
  );
}

export async function trackOrder(orderNumber: string, phone: string) {
  return fetchClientJson<TrackOrderPayload>(
    "/customer/orders/track",
    undefined,
    { order_number: orderNumber, phone },
  );
}

export async function requestWhatsAppOtp(phone: string) {
  return fetchClientJson<{
    challenge_id: string;
    expires_in_seconds: number;
    debug_otp_code?: string;
  }>("/customer/auth/whatsapp/request-otp", {
    method: "POST",
    body: JSON.stringify({ store_code: storeCode, phone }),
  });
}

export async function verifyWhatsAppOtp(challengeId: string, otpCode: string) {
  return fetchClientJson<CustomerSession>("/customer/auth/whatsapp/verify-otp", {
    method: "POST",
    body: JSON.stringify({
      store_code: storeCode,
      challenge_id: challengeId,
      otp_code: otpCode,
    }),
  });
}

export async function loginGoogleIdToken(idToken: string) {
  return fetchClientJson<CustomerSession>("/customer/auth/google", {
    method: "POST",
    body: JSON.stringify({
      store_code: storeCode,
      id_token: idToken,
    }),
  });
}

export async function getWishlist(accessToken: string) {
  return fetchClientJson<WishlistPayload>(
    "/customer/wishlist",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export async function addWishlistItem(accessToken: string, productId: string) {
  return fetchClientJson<{ status: string; product_id: string }>(
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
  return fetchClientJson<{ status: string; product_id: string }>(
    `/customer/wishlist/items/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );
}

export async function getCacheManifest() {
  return fetchServerJson<SyncManifestPayload>(
    "/sync/cache-manifest",
    { store_code: storeCode, since_version: 0 },
    120,
  );
}
