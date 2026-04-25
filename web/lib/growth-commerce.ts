import { GROWTH_BUNDLE_SOURCES } from "@/lib/commercial-content/bundles";
import {
  type CommercialEntryOps,
  type CommercialPublicationState,
  type CommercialQueryOptions,
  filterCommercialEntries,
  resolveCommercialPublicationState,
  sortCommercialEntriesByPriority,
} from "@/lib/commercial-content/shared";
import { buildBundleHref } from "@/lib/content-reference-catalog";

export type CommerceIntent =
  | "consultation"
  | "recommendation"
  | "reorder"
  | "b2b"
  | "checkout-followup";

export type CommerceSurface =
  | "homepage"
  | "shopping-hub"
  | "bundle-hub"
  | "bundle-detail"
  | "product-detail"
  | "campaign-hub"
  | "campaign-detail"
  | "checkout"
  | "b2b";

export type CommerceFunnelStage =
  | "discover"
  | "consider"
  | "convert"
  | "assist"
  | "retain";

export type CommerceTrackingEventName =
  | "wiragro_whatsapp_intent_click"
  | "wiragro_whatsapp_intent_impression";

export type CommerceTrackingEventType = "click" | "impression";

export type CommerceLeadSource = {
  ref: string;
  code: string;
  label: string;
  summary: string;
  opsNote: string;
  contextLines: string[];
  intent: CommerceIntent;
  intentLabel: string;
  surface: CommerceSurface;
  surfaceLabel: string;
  funnelStage: CommerceFunnelStage;
  funnelStageLabel: string;
  sourcePath: string;
};

export type CommerceTrackingPayload = {
  eventName: CommerceTrackingEventName;
  eventType: CommerceTrackingEventType;
  targetChannel: "whatsapp";
  targetUrl: string;
  intent: CommerceIntent;
  surface: CommerceSurface;
  funnelStage: CommerceFunnelStage;
  sourcePath: string;
  storeName: string;
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commodityLabel?: string;
  checkoutLabel?: string;
  leadCode: string;
  leadLabel: string;
  leadOpsNote: string;
  leadRef: string;
  leadSummary: string;
};

export type CommerceWhatsAppLink = {
  href: string;
  message: string;
  leadRef: string;
  leadSummary: string;
  leadSource: CommerceLeadSource;
  tracking: CommerceTrackingPayload;
};

export type CommerceIntentCard = {
  intent: CommerceIntent;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  actionLabel: string;
  leadRef: string;
  leadSummary: string;
  leadSource: CommerceLeadSource;
  tracking: CommerceTrackingPayload;
};

export type GrowthProofSignal = {
  title: string;
  body: string;
};

export type GrowthBundleKind = "commodity" | "phase" | "problem";

export type GrowthBundleItemFallback = {
  sku: string;
  productName: string;
  categoryName: string;
  unit: string;
  weightGrams: string;
  summary: string;
  priceAmount: string;
  compareAtAmount?: string | null;
};

export type GrowthBundleItemDefinition = {
  lineId: string;
  productSlug: string;
  qty: number;
  roleLabel: string;
  notes?: string;
  fallback: GrowthBundleItemFallback;
};

export type GrowthBundlePricingDefinition = {
  bundlePriceAmount: string;
  priceStatus: "mock" | "confirmed";
  note: string;
};

export type GrowthBundleDefinition = {
  sku: string;
  slug: string;
  kind: GrowthBundleKind;
  title: string;
  description: string;
  summary: string;
  audience: string;
  catalogHref: string;
  actionLabel: string;
  href: string;
  supportingLinks?: Array<{ href: string; label: string }>;
  bundleItems: GrowthBundleItemDefinition[];
  pricing: GrowthBundlePricingDefinition;
  relatedArticleSlugs: string[];
  relatedSolutionSlugs: string[];
  relatedCommoditySlugs: string[];
  outcomes: string[];
  proofSignals: GrowthProofSignal[];
  ops: CommercialEntryOps;
  publicationState: CommercialPublicationState;
};

export type GrowthBundleSourceDefinition = Omit<
  GrowthBundleDefinition,
  "href" | "publicationState"
>;

export type GrowthBundlePricingPreview = {
  itemCount: number;
  skuCount: number;
  normalTotalAmount: string;
  bundlePriceAmount: string;
  savingsAmount: string;
  savingsPercent: number;
};

export type B2BOffer = {
  title: string;
  description: string;
  bullets: string[];
};

type CommerceSurfacePreset = {
  funnelStage: CommerceFunnelStage;
  intents: CommerceIntent[];
};

type CommerceMessageContext = {
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commodityLabel?: string;
  checkoutLabel?: string;
  sourcePath: string;
  surface: CommerceSurface;
  funnelStage: CommerceFunnelStage;
};

type BuildCommerceLeadSourceInput = {
  intent: CommerceIntent;
  sourcePath: string;
  surface: CommerceSurface;
  funnelStage: CommerceFunnelStage;
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commodityLabel?: string;
  checkoutLabel?: string;
};

type BuildCommerceIntentCardsInput = {
  phone?: string | null;
  storeName?: string | null;
  sourcePath: string;
  surface: CommerceSurface;
  funnelStage?: CommerceFunnelStage;
  intents?: CommerceIntent[];
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commodityLabel?: string;
  checkoutLabel?: string;
};

const COMMERCE_SURFACE_PRESETS: Record<CommerceSurface, CommerceSurfacePreset> = {
  homepage: {
    funnelStage: "discover",
    intents: ["recommendation", "b2b"],
  },
  "shopping-hub": {
    funnelStage: "discover",
    intents: ["recommendation"],
  },
  "bundle-hub": {
    funnelStage: "discover",
    intents: ["recommendation"],
  },
  "bundle-detail": {
    funnelStage: "consider",
    intents: ["recommendation", "b2b"],
  },
  "product-detail": {
    funnelStage: "consider",
    intents: ["recommendation", "reorder"],
  },
  "campaign-hub": {
    funnelStage: "discover",
    intents: ["recommendation"],
  },
  "campaign-detail": {
    funnelStage: "consider",
    intents: ["recommendation", "b2b"],
  },
  checkout: {
    funnelStage: "convert",
    intents: ["checkout-followup"],
  },
  b2b: {
    funnelStage: "assist",
    intents: ["b2b"],
  },
};

function normalizePhone(phone?: string | null) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  return normalized.startsWith("0") ? `62${normalized.slice(1)}` : normalized;
}

function normalizeLeadValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

function getSurfaceLabel(surface: CommerceSurface) {
  switch (surface) {
    case "homepage":
      return "Homepage";
    case "shopping-hub":
      return "Halaman produk";
    case "bundle-hub":
      return "Hub bundle";
    case "bundle-detail":
      return "Landing bundle";
    case "product-detail":
      return "PDP produk";
    case "campaign-hub":
      return "Hub campaign";
    case "campaign-detail":
      return "Landing campaign";
    case "checkout":
      return "Checkout";
    case "b2b":
    default:
      return "Halaman B2B";
  }
}

function getFunnelStageLabel(stage: CommerceFunnelStage) {
  switch (stage) {
    case "discover":
      return "Discovery";
    case "consider":
      return "Consideration";
    case "convert":
      return "Conversion";
    case "assist":
      return "Assisted sale";
    case "retain":
    default:
      return "Retention";
  }
}

function getIntentLabel(intent: CommerceIntent) {
  switch (intent) {
    case "consultation":
      return "Konsultasi";
    case "recommendation":
      return "Rekomendasi";
    case "reorder":
      return "Reorder";
    case "b2b":
      return "B2B";
    case "checkout-followup":
    default:
      return "Follow-up checkout";
  }
}

function resolveCommerceIntentFunnelStage(
  intent: CommerceIntent,
  defaultStage: CommerceFunnelStage,
) {
  switch (intent) {
    case "reorder":
      return "retain";
    case "b2b":
      return "assist";
    case "checkout-followup":
      return "convert";
    case "consultation":
    case "recommendation":
    default:
      return defaultStage;
  }
}

function buildLeadRef(input: BuildCommerceLeadSourceInput) {
  return [
    "WRG-LEAD",
    `intent=${input.intent}`,
    `surface=${input.surface}`,
    `stage=${input.funnelStage}`,
    `path=${input.sourcePath}`,
    input.productSlug ? `product=${input.productSlug}` : null,
    input.bundleSlug ? `bundle=${input.bundleSlug}` : null,
    input.campaignSlug ? `campaign=${input.campaignSlug}` : null,
    input.checkoutLabel
      ? `checkout=${normalizeLeadValue(input.checkoutLabel)}`
      : null,
    input.commodityLabel
      ? `commodity=${normalizeLeadValue(input.commodityLabel)}`
      : null,
  ]
    .filter(Boolean)
    .join(" | ");
}

function buildCommerceLeadCode(input: BuildCommerceLeadSourceInput) {
  return [
    input.surface,
    input.funnelStage,
    input.intent,
    input.productSlug ?? null,
    input.bundleSlug ?? null,
    input.campaignSlug ?? null,
    input.checkoutLabel ? normalizeLeadValue(input.checkoutLabel) : null,
    input.commodityLabel ? normalizeLeadValue(input.commodityLabel) : null,
  ]
    .filter(Boolean)
    .join(":");
}

function buildCommerceLeadContextLines(input: BuildCommerceLeadSourceInput) {
  const lines = [
    `- Jalur: ${getSurfaceLabel(input.surface)} > ${getIntentLabel(input.intent)} > ${getFunnelStageLabel(input.funnelStage)}`,
    `- Halaman: ${input.sourcePath}`,
  ];

  if (input.productName) {
    lines.push(`- Produk: ${input.productName}`);
  }

  if (input.bundleTitle) {
    lines.push(`- Bundle: ${input.bundleTitle}`);
  }

  if (input.campaignTitle) {
    lines.push(`- Campaign: ${input.campaignTitle}`);
  }

  if (input.commodityLabel) {
    lines.push(`- Komoditas: ${input.commodityLabel}`);
  }

  if (input.checkoutLabel) {
    lines.push(`- Konteks checkout: ${input.checkoutLabel}`);
  }

  return lines;
}

export function formatCommerceLeadSourceForOps(source: CommerceLeadSource) {
  return [
    "Lead source Wiragro:",
    `- Kode: ${source.code}`,
    ...source.contextLines,
    `- Ref: ${source.ref}`,
  ].join("\n");
}

export function buildCommerceLeadSource(
  input: BuildCommerceLeadSourceInput,
): CommerceLeadSource {
  const ref = buildLeadRef(input);
  const code = buildCommerceLeadCode(input);
  const surfaceLabel = getSurfaceLabel(input.surface);
  const intentLabel = getIntentLabel(input.intent);
  const funnelStageLabel = getFunnelStageLabel(input.funnelStage);
  const contextLines = buildCommerceLeadContextLines(input);
  const label = `${surfaceLabel} > ${intentLabel} > ${funnelStageLabel}`;
  const summary = ["Ringkasan lead Wiragro:", ...contextLines].join("\n");
  const sourceWithoutOpsNote: CommerceLeadSource = {
    ref,
    code,
    label,
    summary,
    opsNote: "",
    contextLines,
    intent: input.intent,
    intentLabel,
    surface: input.surface,
    surfaceLabel,
    funnelStage: input.funnelStage,
    funnelStageLabel,
    sourcePath: input.sourcePath,
  };

  return {
    ...sourceWithoutOpsNote,
    opsNote: formatCommerceLeadSourceForOps(sourceWithoutOpsNote),
  };
}

export function buildCommerceLeadSourceSummary(input: BuildCommerceLeadSourceInput) {
  return buildCommerceLeadSource(input).summary;
}

function parseAmount(value?: string | number | null) {
  const amount =
    typeof value === "number" ? value : Number.parseFloat(value ?? "0");
  return Number.isFinite(amount) ? amount : 0;
}

function formatAmount(value: number) {
  return value.toFixed(2);
}

function buildIntentMessage(
  intent: CommerceIntent,
  storeName: string,
  context: CommerceMessageContext,
) {
  switch (intent) {
    case "recommendation":
      if (context.productName) {
        return `Halo ${storeName}, saya sedang melihat ${context.productName}${context.commodityLabel ? ` untuk ${context.commodityLabel}` : ""} dan ingin minta rekomendasi produk pendamping atau bundle yang paling cocok.`;
      }

      if (context.bundleTitle) {
        return `Halo ${storeName}, saya melihat bundle "${context.bundleTitle}"${context.commodityLabel ? ` untuk ${context.commodityLabel}` : ""} dan ingin minta rekomendasi apakah paket ini sudah paling cocok atau perlu disesuaikan.`;
      }

      if (context.campaignTitle) {
        return `Halo ${storeName}, saya tertarik dengan campaign "${context.campaignTitle}"${context.commodityLabel ? ` untuk ${context.commodityLabel}` : ""} dan ingin minta rekomendasi produk atau bundle yang paling pas.`;
      }

      return `Halo ${storeName}, saya ingin minta rekomendasi produk atau bundle yang paling cocok untuk kebutuhan saya${context.commodityLabel ? ` di ${context.commodityLabel}` : ""}.`;
    case "reorder":
      return `Halo ${storeName}, saya ingin repeat order${context.productName ? ` untuk ${context.productName}` : context.bundleTitle ? ` untuk bundle ${context.bundleTitle}` : ""}. Mohon bantu cek stok, qty yang cocok, dan opsi pengirimannya.`;
    case "b2b":
      return `Halo ${storeName}, saya ingin diskusi pembelian partai / B2B${context.commodityLabel ? ` untuk ${context.commodityLabel}` : ""}${context.productName ? ` terkait ${context.productName}` : context.bundleTitle ? ` terkait bundle ${context.bundleTitle}` : ""}. Mohon info harga grosir, minimum order, dan opsi pickup atau delivery.`;
    case "checkout-followup":
      return `Halo ${storeName}, saya sudah masuk ke checkout${context.checkoutLabel ? ` untuk ${context.checkoutLabel}` : ""}${context.productName ? ` (${context.productName})` : context.bundleTitle ? ` (${context.bundleTitle})` : ""} dan butuh bantuan memastikan stok, ongkir, atau metode pembayaran sebelum lanjut.`;
    case "consultation":
    default:
      return `Halo ${storeName}, saya ingin konsultasi singkat${context.productName ? ` tentang ${context.productName}` : context.bundleTitle ? ` tentang bundle ${context.bundleTitle}` : context.campaignTitle ? ` dari campaign ${context.campaignTitle}` : ""}${context.commodityLabel ? ` untuk ${context.commodityLabel}` : ""} agar pilihan saya lebih tepat.`;
  }
}

export function buildCommerceWhatsAppLink(input: {
  phone?: string | null;
  storeName?: string | null;
  intent: CommerceIntent;
  sourcePath: string;
  surface: CommerceSurface;
  funnelStage: CommerceFunnelStage;
  bundleSlug?: string;
  bundleTitle?: string;
  campaignSlug?: string;
  campaignTitle?: string;
  productSlug?: string;
  productName?: string;
  commodityLabel?: string;
  checkoutLabel?: string;
}): CommerceWhatsAppLink | null {
  const storeName = input.storeName ?? "Wiragro";
  const formatted = normalizePhone(input.phone);

  if (!formatted) {
    return null;
  }

  const leadSource = buildCommerceLeadSource({
    intent: input.intent,
    sourcePath: input.sourcePath,
    surface: input.surface,
    funnelStage: input.funnelStage,
    bundleSlug: input.bundleSlug,
    bundleTitle: input.bundleTitle,
    campaignSlug: input.campaignSlug,
    campaignTitle: input.campaignTitle,
    productSlug: input.productSlug,
    productName: input.productName,
    commodityLabel: input.commodityLabel,
    checkoutLabel: input.checkoutLabel,
  });
  const leadRef = leadSource.ref;
  const leadSummary = leadSource.summary;
  const message = [
    buildIntentMessage(input.intent, storeName, {
      bundleSlug: input.bundleSlug,
      bundleTitle: input.bundleTitle,
      campaignSlug: input.campaignSlug,
      campaignTitle: input.campaignTitle,
      productSlug: input.productSlug,
      productName: input.productName,
      commodityLabel: input.commodityLabel,
      checkoutLabel: input.checkoutLabel,
      sourcePath: input.sourcePath,
      surface: input.surface,
      funnelStage: input.funnelStage,
    }),
    leadSource.opsNote,
  ].join("\n\n");
  const href = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;

  return {
    href,
    message,
    leadRef,
    leadSummary,
    leadSource,
    tracking: {
      eventName: "wiragro_whatsapp_intent_click",
      eventType: "click",
      targetChannel: "whatsapp",
      targetUrl: href,
      intent: input.intent,
      surface: input.surface,
      funnelStage: input.funnelStage,
      sourcePath: input.sourcePath,
      storeName,
      bundleSlug: input.bundleSlug,
      bundleTitle: input.bundleTitle,
      campaignSlug: input.campaignSlug,
      campaignTitle: input.campaignTitle,
      productSlug: input.productSlug,
      productName: input.productName,
      commodityLabel: input.commodityLabel,
      checkoutLabel: input.checkoutLabel,
      leadCode: leadSource.code,
      leadLabel: leadSource.label,
      leadOpsNote: leadSource.opsNote,
      leadRef,
      leadSummary,
    },
  };
}

function hydrateGrowthBundle(
  source: GrowthBundleSourceDefinition,
  now = new Date(),
): GrowthBundleDefinition {
  return {
    ...source,
    href: buildBundleHref(source.slug),
    publicationState: resolveCommercialPublicationState(source.ops, now),
  };
}

function getHydratedGrowthBundles(now = new Date()) {
  return sortCommercialEntriesByPriority(
    GROWTH_BUNDLE_SOURCES.map((bundle) => hydrateGrowthBundle(bundle, now)),
  );
}

export const B2B_OFFERS: B2BOffer[] = [
  {
    title: "Pembelian partai untuk kebun atau proyek",
    description:
      "Cocok untuk tim yang butuh suplai lebih besar, diskusi kebutuhan per fase, atau kombinasi beberapa komoditas.",
    bullets: ["Diskusi qty dan ritme pengiriman", "Pilihan pickup atau delivery", "Rekomendasi bundle awal untuk briefing cepat"],
  },
  {
    title: "Inquiry untuk kios atau reseller",
    description:
      "Jalur ringan untuk toko yang ingin menanyakan ketersediaan produk inti, pelengkap, dan kemungkinan pola repeat order.",
    bullets: ["Produk inti dan pelengkap", "Alur repeat order yang lebih cepat", "Percakapan harga grosir via WhatsApp"],
  },
  {
    title: "Pembelian rutin yang butuh arahan cepat",
    description:
      "Bila katalog terasa terlalu lebar, jalur B2B membantu menyederhanakan belanja menjadi daftar prioritas yang lebih mudah ditindak.",
    bullets: ["Kurasi SKU yang sering dibutuhkan", "Masuk dari bundle atau komoditas", "Mudah diteruskan ke tindak lanjut manual"],
  },
];

export function getGrowthBundlePricingPreview(
  bundle: Pick<GrowthBundleDefinition, "bundleItems" | "pricing">,
): GrowthBundlePricingPreview {
  const itemCount = bundle.bundleItems.reduce((total, item) => total + item.qty, 0);
  const normalTotal = bundle.bundleItems.reduce(
    (total, item) => total + parseAmount(item.fallback.priceAmount) * item.qty,
    0,
  );
  const bundlePrice = parseAmount(bundle.pricing.bundlePriceAmount);
  const savings = Math.max(normalTotal - bundlePrice, 0);
  const savingsPercent = normalTotal > 0 ? Math.round((savings / normalTotal) * 100) : 0;

  return {
    itemCount,
    skuCount: bundle.bundleItems.length,
    normalTotalAmount: formatAmount(normalTotal),
    bundlePriceAmount: formatAmount(bundlePrice),
    savingsAmount: formatAmount(savings),
    savingsPercent,
  };
}

export function getAllGrowthBundleDefinitions(
  options: Pick<CommercialQueryOptions, "now"> = {},
) {
  return getHydratedGrowthBundles(options.now ?? new Date());
}

export function getAllGrowthBundles(options: CommercialQueryOptions = {}) {
  const now = options.now ?? new Date();
  return filterCommercialEntries(getHydratedGrowthBundles(now), options);
}

export function getGrowthBundle(
  slug: string,
  options: CommercialQueryOptions = {},
) {
  const bundles = options.includeInactive
    ? getAllGrowthBundleDefinitions({ now: options.now })
    : getAllGrowthBundles(options);

  return bundles.find((bundle) => bundle.slug === slug) ?? null;
}

export function getFeaturedGrowthBundles(
  limit = 6,
  options: CommercialQueryOptions = {},
) {
  return getAllGrowthBundles(options).slice(0, limit);
}

export function getRelatedGrowthBundles(
  current: GrowthBundleDefinition,
  limit = 3,
  options: CommercialQueryOptions = {},
) {
  return getAllGrowthBundles(options)
    .filter((bundle) => bundle.slug !== current.slug)
    .sort((left, right) => {
      const leftScore = left.kind === current.kind ? 1 : 0;
      const rightScore = right.kind === current.kind ? 1 : 0;
      const scoreDelta = rightScore - leftScore;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.ops.priority - left.ops.priority;
    })
    .slice(0, limit);
}

export function getGrowthBundleKindLabel(kind: GrowthBundleDefinition["kind"]) {
  switch (kind) {
    case "phase":
      return "Bundle fase";
    case "problem":
      return "Bundle problem";
    case "commodity":
    default:
      return "Bundle komoditas";
  }
}

function buildCommerceIntentCardCopy(
  intent: CommerceIntent,
  input: BuildCommerceIntentCardsInput,
) {
  switch (intent) {
    case "consultation":
      if (input.productName) {
        return {
          eyebrow: "Konsultasi",
          title: "Konsultasi produk ini",
          description:
            "Cocok saat Anda butuh validasi cara pakai, dosis, atau kecocokan produk sebelum benar-benar membeli.",
          actionLabel: "Konsultasi via WA",
        };
      }

      if (input.bundleTitle) {
        return {
          eyebrow: "Konsultasi",
          title: "Konsultasi paket ini",
          description:
            "Dipakai saat Anda tertarik pada paket, tetapi masih perlu memastikan komposisi dan waktu belinya.",
          actionLabel: "Tanya paket ini",
        };
      }

      if (input.campaignTitle) {
        return {
          eyebrow: "Konsultasi",
          title: "Tanya program ini dulu",
          description:
            "Bantu pengunjung yang tertarik pada program ini, tetapi masih ingin memastikan konteks kebutuhannya.",
          actionLabel: "Tanya via WA",
        };
      }

      return {
        eyebrow: "Konsultasi",
        title: "Konsultasi cepat",
        description:
          "Cocok saat Anda masih perlu validasi komoditas, gejala, atau cara pakai sebelum membeli.",
        actionLabel: "Konsultasi via WA",
      };
    case "recommendation":
      if (input.productName) {
        return {
          eyebrow: "Rekomendasi",
          title: "Minta rekomendasi kombinasi",
          description:
            "Pakai jalur ini saat Anda melihat satu produk tetapi masih butuh pasangan produk atau paket yang lebih tepat.",
          actionLabel: "Minta rekomendasi",
        };
      }

      if (input.bundleTitle) {
        return {
          eyebrow: "Rekomendasi",
          title: "Minta rekomendasi paket ini",
          description:
            "Tim Wiragro bisa membantu memastikan apakah paket ini sudah pas atau perlu kombinasi SKU yang berbeda.",
          actionLabel: "Minta rekomendasi",
        };
      }

      if (input.campaignTitle) {
        return {
          eyebrow: "Rekomendasi",
          title: "Minta rekomendasi dari program ini",
          description:
            "Bantu pengunjung turun dari program ini ke produk atau paket yang paling cocok.",
          actionLabel: "Minta rekomendasi",
        };
      }

      if (input.surface === "homepage") {
        return {
          eyebrow: "Rekomendasi",
          title: "Ceritakan kebutuhan dulu",
          description:
            "Bagus untuk visitor awal yang belum yakin harus mulai dari produk, bundle, atau jalur solusi.",
          actionLabel: "Minta arahan",
        };
      }

      return {
        eyebrow: "Rekomendasi",
        title: "Minta rekomendasi produk",
        description:
          "Jalur ini cocok untuk pengunjung yang belum ingin merakit sendiri dari katalog yang lebih lebar.",
        actionLabel: "Minta rekomendasi",
      };
    case "reorder":
      return {
        eyebrow: "Reorder",
        title: input.productName
          ? `Repeat order ${input.productName}`
          : input.bundleTitle
            ? "Repeat order paket ini"
            : "Repeat order produk ini",
        description:
          "Untuk pembeli yang kebutuhannya sudah jelas dan hanya ingin mempercepat stok, qty, atau pengiriman via WhatsApp.",
        actionLabel: "Repeat order via WA",
      };
    case "b2b":
      if (input.bundleTitle) {
        return {
          eyebrow: "B2B",
          title: "Ajukan volume untuk paket ini",
          description:
            "Pisahkan kebutuhan partai atau reseller yang mulai dari bundle ini ke jalur WA yang siap ditindak.",
          actionLabel: "Diskusi partai",
        };
      }

      if (input.productName) {
        return {
          eyebrow: "B2B",
          title: "Diskusi partai produk ini",
          description:
            "Cocok untuk kebutuhan proyek, reseller, atau kebun yang ingin membahas volume lebih besar dari satu SKU.",
          actionLabel: "Diskusi partai",
        };
      }

      if (input.campaignTitle) {
        return {
          eyebrow: "B2B",
          title: "Buka jalur partai dari program ini",
          description:
            "Menjaga lead musiman atau komoditas tinggi tetap masuk ke jalur WA yang lebih siap dibaca tim Wiragro.",
          actionLabel: "Minta penawaran",
        };
      }

      return {
        eyebrow: "B2B",
        title: "Diskusi pembelian partai",
        description:
          "Pisahkan lead kebun, reseller, proyek, atau kebutuhan rutin ke jalur WhatsApp yang lebih siap ditindak.",
        actionLabel: "Minta penawaran",
      };
    case "checkout-followup":
    default:
      return {
        eyebrow: "Bantuan checkout",
        title: "Tindak lanjut checkout",
        description:
          "Gunakan saat Anda sudah masuk checkout tetapi masih perlu bantuan stok, ongkir, pembayaran, atau langkah akhir.",
        actionLabel: "Minta bantuan checkout",
      };
  }
}

export function buildCommerceIntentCards(
  input: BuildCommerceIntentCardsInput,
): CommerceIntentCard[] {
  const storeName = input.storeName ?? "Wiragro";
  const preset = COMMERCE_SURFACE_PRESETS[input.surface];
  const funnelStage = input.funnelStage ?? preset.funnelStage;
  const intents = input.intents ?? preset.intents;

  return intents.flatMap((intent) => {
    const resolvedStage = resolveCommerceIntentFunnelStage(intent, funnelStage);
    const link = buildCommerceWhatsAppLink({
      phone: input.phone,
      storeName,
      intent,
      sourcePath: input.sourcePath,
      surface: input.surface,
      funnelStage: resolvedStage,
      bundleSlug: input.bundleSlug,
      bundleTitle: input.bundleTitle,
      campaignSlug: input.campaignSlug,
      campaignTitle: input.campaignTitle,
      productSlug: input.productSlug,
      productName: input.productName,
      commodityLabel: input.commodityLabel,
      checkoutLabel: input.checkoutLabel,
    });

    if (!link) {
      return [];
    }

    const copy = buildCommerceIntentCardCopy(intent, input);

    return [
      {
        intent,
        eyebrow: copy.eyebrow,
        title: copy.title,
        description: copy.description,
        href: link.href,
        actionLabel: copy.actionLabel,
        leadRef: link.leadRef,
        leadSummary: link.leadSummary,
        leadSource: link.leadSource,
        tracking: link.tracking,
      },
    ];
  });
}

type GrowthBundleContextInput = {
  commoditySlug?: string | null;
  solutionSlug?: string | null;
};

export function getGrowthBundlesForContext(
  input: GrowthBundleContextInput,
  limit = 3,
  options: CommercialQueryOptions = {},
) {
  const commoditySlug = input.commoditySlug ?? null;
  const solutionSlug = input.solutionSlug ?? null;

  return getAllGrowthBundles(options)
    .map((bundle) => {
    let score = 0;

    if (commoditySlug && bundle.relatedCommoditySlugs.includes(commoditySlug)) {
      score += 2;
    }

    if (solutionSlug && bundle.relatedSolutionSlugs.includes(solutionSlug)) {
      score += 3;
    }

    return {
      bundle,
      score,
    };
  })
    .filter((item) => item.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return right.bundle.ops.priority - left.bundle.ops.priority;
    })
    .slice(0, limit)
    .map((item) => item.bundle);
}
