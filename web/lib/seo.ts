import type { Metadata } from "next";

import type {
  ContentPagePayload,
  ProductDetailPayload,
  ProductReviewFeedPayload,
  StoreProfile,
} from "@/lib/api";
import { getSiteUrl } from "@/lib/config";
import { WIRAGRO_CATEGORY_ASSETS } from "@/lib/wiragro-assets";

export const SITE_NAME = "Wiragro";
export const BRAND_TAGLINE = "Platform Solusi Pertanian Digital";
export const BRAND_SUBTAGLINE =
  "Cari solusi masalah tanaman, pelajari cara terbaik, dan beli produk pertanian yang tepat dalam satu tempat.";
export const DEFAULT_SITE_TITLE = `Wiragro | ${BRAND_TAGLINE}`;
export const DEFAULT_DESCRIPTION = BRAND_SUBTAGLINE;
export const DEFAULT_OG_IMAGE = WIRAGRO_CATEGORY_ASSETS.pupuk;

const DEFAULT_AUTHOR_NAME = "Tim Wiragro";
const DEFAULT_KEYWORDS = [
  "wiragro",
  "platform pertanian digital",
  "solusi pertanian",
  "solusi masalah tanaman",
  "ai pertanian premium",
  "toko pertanian online",
  "edukasi pertanian",
  "produk pertanian",
  "b2b pertanian",
  "pupuk",
  "benih",
  "pestisida",
];

type SeoPageType = "website" | "article";
type SeoSection =
  | "home"
  | "catalog"
  | "product"
  | "article-list"
  | "article"
  | "static"
  | "utility";

type SeoMetadataInput = {
  title: string;
  description?: string | null;
  path: string;
  canonicalPath?: string;
  image?: string | null;
  keywords?: string[];
  type?: SeoPageType;
  noIndex?: boolean;
  section?: SeoSection;
  publishedTime?: string | null;
  modifiedTime?: string | null;
};

type JsonLdBreadcrumbItem = {
  name: string;
  path: string;
};

const SECTION_KEYWORDS: Record<SeoSection, string[]> = {
  home: [
    "homepage wiragro",
    "platform solusi pertanian digital",
    "belanja pertanian",
    "edukasi dan solusi pertanian",
  ],
  catalog: [
    "katalog produk pertanian",
    "produk pertanian online",
    "belanja pupuk",
    "belanja benih",
    "belanja pestisida",
  ],
  product: [
    "detail produk pertanian",
    "harga produk pertanian",
    "stok produk pertanian",
  ],
  "article-list": [
    "artikel pertanian",
    "edukasi pertanian",
    "panduan budidaya",
    "tips pertanian",
  ],
  article: [
    "artikel pertanian",
    "insight pertanian",
    "panduan pertanian",
  ],
  static: [
    "informasi wiragro",
    "platform pertanian digital",
  ],
  utility: [
    "layanan wiragro",
    "akun wiragro",
  ],
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function normalizePath(path: string) {
  if (!path) {
    return "/";
  }

  return path.startsWith("/") ? path : `/${path}`;
}

function absoluteUrl(path: string) {
  return new URL(normalizePath(path), trimTrailingSlash(getSiteUrl())).toString();
}

function absoluteImageUrl(image?: string | null) {
  if (!image) {
    return absoluteUrl(DEFAULT_OG_IMAGE);
  }

  try {
    return new URL(image).toString();
  } catch {
    return absoluteUrl(image);
  }
}

function cleanText(value?: string | null, maxLength = 160) {
  const text = (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return DEFAULT_DESCRIPTION;
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 3).trimEnd()}...`;
}

function buildFullTitle(title: string) {
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

function normalizeKeywords(keywords?: string[] | string | null) {
  if (!keywords) {
    return [];
  }

  return Array.isArray(keywords)
    ? keywords.filter(Boolean)
    : keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean);
}

function uniqueKeywords(values: Array<string | undefined | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function buildRobots(noIndex: boolean): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: true,
      nocache: true,
      googleBot: {
        index: false,
        follow: true,
        noarchive: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

function getWebsiteId() {
  return `${absoluteUrl("/")}#website`;
}

function getOrganizationId() {
  return `${absoluteUrl("/")}#organization`;
}

function getWebPageId(path: string) {
  return `${absoluteUrl(path)}#webpage`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  canonicalPath,
  image,
  keywords,
  type = "website",
  noIndex = false,
  section = "static",
  publishedTime,
  modifiedTime,
}: SeoMetadataInput): Metadata {
  const canonical = absoluteUrl(canonicalPath ?? path);
  const normalizedDescription = cleanText(description);
  const fullTitle = buildFullTitle(title);
  const imageUrl = absoluteImageUrl(image);
  const combinedKeywords = uniqueKeywords([
    ...DEFAULT_KEYWORDS,
    ...SECTION_KEYWORDS[section],
    ...(keywords ?? []),
  ]);

  return {
    title: fullTitle,
    description: normalizedDescription,
    keywords: combinedKeywords,
    authors: [{ name: DEFAULT_AUTHOR_NAME, url: absoluteUrl("/tentang-kami") }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    category:
      section === "article" || section === "article-list"
        ? "Agriculture Education"
        : "Agriculture",
    alternates: {
      canonical,
    },
    openGraph: {
      title: fullTitle,
      description: normalizedDescription,
      url: canonical,
      siteName: SITE_NAME,
      locale: "id_ID",
      type,
      images: [
        {
          url: imageUrl,
          alt: fullTitle,
        },
      ],
      ...(type === "article"
        ? {
            publishedTime: publishedTime ?? undefined,
            modifiedTime: modifiedTime ?? undefined,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: normalizedDescription,
      images: [imageUrl],
    },
    robots: buildRobots(noIndex),
  };
}

export function buildHomepageMetadata() {
  return buildPageMetadata({
    title: "Wiragro - Platform Solusi Pertanian Digital",
    description:
      "Cari solusi masalah tanaman, baca edukasi pertanian, dan beli produk pertanian yang tepat di Wiragro.",
    path: "/",
    section: "home",
    keywords: [
      "homepage wiragro",
      "platform solusi pertanian digital",
      "produk pertanian online",
      "ai pertanian premium",
      "edukasi pertanian",
    ],
  });
}

export function buildCatalogMetadata(input: {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  noIndex?: boolean;
  keywords?: string[];
}) {
  return buildPageMetadata({
    ...input,
    section: "catalog",
  });
}

export function buildArticleListingMetadata(input: {
  title: string;
  description: string;
  path: string;
  canonicalPath?: string;
  noIndex?: boolean;
  keywords?: string[];
}) {
  return buildPageMetadata({
    ...input,
    section: "article-list",
  });
}

export function buildUtilityMetadata(
  title: string,
  description: string,
  path: string,
  canonicalPath?: string,
) {
  return buildPageMetadata({
    title,
    description,
    path,
    canonicalPath,
    noIndex: true,
    section: "utility",
  });
}

export function buildStaticPageFallbackMetadata(
  title: string,
  description: string,
  path: string,
) {
  return buildPageMetadata({
    title,
    description,
    path,
    section: "static",
  });
}

export function buildUnavailableDetailMetadata(input: {
  title: string;
  description: string;
  path: string;
  canonicalPath: string;
  section: "product" | "article";
}) {
  return buildPageMetadata({
    title: input.title,
    description: input.description,
    path: input.path,
    canonicalPath: input.canonicalPath,
    noIndex: true,
    section: input.section,
    type: input.section === "article" ? "article" : "website",
  });
}

export function buildStaticPageMetadata(page: ContentPagePayload, path: string) {
  return buildPageMetadata({
    title: page.seo?.title || page.title,
    description: page.seo?.description || page.excerpt || DEFAULT_DESCRIPTION,
    path,
    keywords: [
      ...normalizeKeywords(page.seo?.keywords),
      page.title,
      "halaman informasi",
      "pertanian",
      "wiragro",
    ],
    section: "static",
    modifiedTime: page.updated_at ?? undefined,
  });
}

export function buildProductMetadata(product: ProductDetailPayload) {
  return buildPageMetadata({
    title: product.seo?.title || `${product.name} - Wiragro`,
    description:
      product.seo?.description ||
      `Beli ${product.name} di Wiragro. Lihat manfaat, cara pakai, dan rekomendasi produk terkait.`,
    path: `/produk/${product.slug}`,
    image:
      product.images.find((item) => item.is_primary)?.url ??
      product.images[0]?.url ??
      null,
    keywords: [
      ...normalizeKeywords(product.seo?.keywords),
      product.name,
      product.category?.name ?? product.product_type,
      "belanja pertanian",
      "produk pertanian",
    ],
    section: "product",
    modifiedTime: product.updated_at ?? product.created_at ?? undefined,
  });
}

export function buildArticleMetadata(article: ContentPagePayload, slug: string) {
  return buildPageMetadata({
    title: article.seo?.title || article.title,
    description: article.seo?.description || article.excerpt || DEFAULT_DESCRIPTION,
    path: `/artikel/${slug}`,
    type: "article",
    keywords: [
      ...normalizeKeywords(article.seo?.keywords),
      "artikel pertanian",
      "edukasi pertanian",
      article.title,
    ],
    section: "article",
    publishedTime: article.published_at ?? undefined,
    modifiedTime: article.updated_at ?? article.published_at ?? undefined,
  });
}

export function buildWebPageJsonLd(input: {
  title: string;
  description?: string | null;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": getWebPageId(input.path),
    name: input.title,
    description: cleanText(input.description),
    url: absoluteUrl(input.path),
    isPartOf: {
      "@id": getWebsiteId(),
    },
    inLanguage: "id-ID",
  };
}

export function buildBreadcrumbJsonLd(items: JsonLdBreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${absoluteUrl(items[items.length - 1]?.path ?? "/")}#breadcrumb`,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function buildOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": getOrganizationId(),
    name: SITE_NAME,
    description: BRAND_SUBTAGLINE,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/wiragro-icon.svg"),
    },
  };
}

export function buildWebsiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": getWebsiteId(),
    name: SITE_NAME,
    description: BRAND_SUBTAGLINE,
    url: absoluteUrl("/"),
    publisher: {
      "@id": getOrganizationId(),
    },
    inLanguage: "id-ID",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/cari")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildStoreJsonLd(store?: StoreProfile | null) {
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": `${absoluteUrl("/")}#store`,
    name: SITE_NAME,
    description: BRAND_SUBTAGLINE,
    url: absoluteUrl("/"),
    image: absoluteImageUrl(DEFAULT_OG_IMAGE),
    parentOrganization: {
      "@id": getOrganizationId(),
    },
    telephone: store?.whatsapp_number || undefined,
    address: store?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: store.address,
        }
      : undefined,
    openingHours: store?.operational_hours || undefined,
    areaServed: "ID",
  };
}

export function buildCollectionJsonLd(input: {
  title: string;
  description?: string | null;
  path: string;
  itemUrls?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${absoluteUrl(input.path)}#collection`,
    name: input.title,
    description: cleanText(input.description),
    url: absoluteUrl(input.path),
    isPartOf: {
      "@id": getWebsiteId(),
    },
    mainEntity: input.itemUrls?.length
      ? {
          "@type": "ItemList",
          itemListElement: input.itemUrls.map((url, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: absoluteUrl(url),
          })),
        }
      : undefined,
  };
}

export function buildProductJsonLd(
  product: ProductDetailPayload,
  reviewFeed?: ProductReviewFeedPayload | null,
) {
  const imageUrls = product.images.map((item) => absoluteImageUrl(item.url));
  const productUrl = absoluteUrl(`/produk/${product.slug}`);
  const availability =
    product.availability.state === "out_of_stock"
      ? "https://schema.org/OutOfStock"
      : product.availability.state === "low_stock"
        ? "https://schema.org/LimitedAvailability"
        : "https://schema.org/InStock";
  const totalReviews =
    reviewFeed?.summary.total_reviews ?? product.review_summary?.total_reviews ?? 0;
  const averageRating =
    reviewFeed?.summary.average_rating ?? product.review_summary?.average_rating ?? null;
  const structuredReviews =
    reviewFeed?.items.slice(0, 5).map((item) => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: cleanText(item.reviewer_name, 80),
      },
      datePublished: item.approved_at ?? item.submitted_at ?? undefined,
      name: cleanText(item.title || `Review untuk ${product.name}`, 110),
      reviewBody: cleanText(
        item.body || item.usage_context || `${item.rating} dari 5 bintang untuk ${product.name}`,
        500,
      ),
      reviewRating: {
        "@type": "Rating",
        ratingValue: item.rating,
        bestRating: 5,
        worstRating: 1,
      },
    })) ?? [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.name,
    description: cleanText(product.description || product.summary, 500),
    sku: product.sku,
    category: product.category?.name || product.product_type,
    image: imageUrls.length ? imageUrls : [absoluteImageUrl(DEFAULT_OG_IMAGE)],
    brand: {
      "@type": "Brand",
      name: SITE_NAME,
    },
    mainEntityOfPage: productUrl,
    aggregateRating:
      totalReviews > 0 && averageRating !== null
        ? {
            "@type": "AggregateRating",
            ratingValue: averageRating,
            reviewCount: totalReviews,
            ratingCount: totalReviews,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    review: structuredReviews.length ? structuredReviews : undefined,
    offers: {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      url: productUrl,
      priceCurrency: "IDR",
      price: product.price.amount ?? "0.00",
      availability,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": getOrganizationId(),
      },
    },
  };
}

export function buildArticleJsonLd(article: ContentPagePayload, slug: string) {
  const articleUrl = absoluteUrl(`/artikel/${slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${articleUrl}#article`,
    headline: article.title,
    description: cleanText(article.excerpt || article.body_html),
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    image: absoluteImageUrl(DEFAULT_OG_IMAGE),
    datePublished: article.published_at ?? undefined,
    dateModified: article.updated_at ?? article.published_at ?? undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
    },
    publisher: {
      "@id": getOrganizationId(),
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/wiragro-icon.svg"),
      },
    },
    articleSection: "Edukasi Pertanian",
    articleBody: cleanText(article.body_html, 5000),
    inLanguage: "id-ID",
  };
}
