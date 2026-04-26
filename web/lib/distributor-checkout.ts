import type { CustomerSession } from "@/lib/api";
import { canUseCod, canUseRolePricing, resolveAccountRole } from "@/lib/account-role";

export type CheckoutRegion = "jatim" | "java-non-jatim" | "outside-java" | "unknown";

export type CheckoutPermissionValidationResult = {
  message?: string;
  valid: boolean;
};

export type CheckoutEligibility = {
  accountRole: ReturnType<typeof resolveAccountRole>;
  addressComplete: boolean;
  allowedPaymentMethods: Array<{
    code: string;
    label: string;
  }>;
  canCheckout: boolean;
  canUseCod: boolean;
  isDistributorAccount: boolean;
  minimumAmount: number;
  progress: number | null;
  progressMessage: string | null;
  region: CheckoutRegion;
  regionLabel: string;
  remainingAmount: number;
  requiresPermissionCode: boolean;
  statusTone: "error" | "neutral" | "success" | "warning";
  statusTitle: string;
  summary: string;
};

const EAST_JAVA_NAMES = ["east java", "jawa timur", "jatim"];
const JAVA_PROVINCES = [
  "banten",
  "daerah istimewa yogyakarta",
  "dki jakarta",
  "jakarta",
  "jawa barat",
  "jawa tengah",
  "jawa timur",
  "yogyakarta",
];

function normalize(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectCheckoutRegion(province?: string | null): CheckoutRegion {
  const normalized = normalize(province);

  if (!normalized) {
    return "unknown";
  }

  if (EAST_JAVA_NAMES.some((name) => normalized.includes(name))) {
    return "jatim";
  }

  if (JAVA_PROVINCES.some((name) => normalized.includes(name))) {
    return "java-non-jatim";
  }

  return "outside-java";
}

export function getCheckoutRegionLabel(region: CheckoutRegion) {
  switch (region) {
    case "jatim":
      return "Jawa Timur";
    case "java-non-jatim":
      return "Pulau Jawa di luar Jatim";
    case "outside-java":
      return "Luar Pulau Jawa";
    default:
      return "Wilayah belum dikenali";
  }
}

export function getCheckoutMinimumAmount(region: CheckoutRegion) {
  switch (region) {
    case "jatim":
      return 500_000;
    case "java-non-jatim":
      return 2_000_000;
    default:
      return 0;
  }
}

export async function validateCheckoutPermissionCode(
  code: string,
): Promise<CheckoutPermissionValidationResult> {
  const normalized = code.trim().toUpperCase();

  if (!normalized) {
    return {
      valid: false,
      message: "Masukkan kode izin checkout terlebih dahulu.",
    };
  }

  const configuredCodes = (process.env.NEXT_PUBLIC_WIRAGRO_CHECKOUT_PERMISSION_CODES ?? "")
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);

  if (configuredCodes.length > 0) {
    if (configuredCodes.includes(normalized)) {
      return {
        valid: true,
        message: "Kode izin berhasil divalidasi untuk checkout ini.",
      };
    }

    return {
      valid: false,
      message: "Kode izin tidak valid atau sudah kedaluwarsa.",
    };
  }

  if (
    process.env.NODE_ENV !== "production" &&
    /^WGRO-(ALLOW|IZIN)-[A-Z0-9-]{4,}$/.test(normalized)
  ) {
    return {
      valid: true,
      message: "Kode izin berhasil divalidasi untuk checkout ini.",
    };
  }

  return {
    valid: false,
    message: "Kode izin tidak valid atau sudah kedaluwarsa.",
  };
}

export function evaluateCheckoutEligibility(input: {
  permissionValidated: boolean;
  province?: string | null;
  session?: CustomerSession | null;
  subtotal: number;
}) {
  const accountRole = resolveAccountRole(input.session);
  const isDistributorAccount = canUseRolePricing(input.session);
  const region = detectCheckoutRegion(input.province);
  const regionLabel = getCheckoutRegionLabel(region);
  const addressComplete = Boolean(normalize(input.province));
  const requiresPermissionCode = isDistributorAccount && region === "outside-java";
  const minimumAmount = isDistributorAccount ? getCheckoutMinimumAmount(region) : 0;
  const remainingAmount =
    isDistributorAccount && minimumAmount > 0
      ? Math.max(0, minimumAmount - input.subtotal)
      : 0;
  const minimumMet = minimumAmount === 0 || remainingAmount <= 0;
  const permissionMet = !requiresPermissionCode || input.permissionValidated;
  const canCheckout =
    !isDistributorAccount ||
    (addressComplete && minimumMet && permissionMet);

  const allowedPaymentMethods = [
    {
      code: "duitku-va",
      label: "Pembayaran online",
    },
    ...(canUseCod(input.session)
      ? [
          {
            code: "COD",
            label: "Bayar di tempat (COD)",
          },
        ]
      : []),
  ];

  let statusTitle = "Checkout siap dilanjutkan.";
  let summary = "Aturan akun Anda sudah terpenuhi untuk melanjutkan checkout.";
  let progressMessage: string | null = null;
  let statusTone: CheckoutEligibility["statusTone"] = "success";

  if (!isDistributorAccount) {
    statusTone = "neutral";
    statusTitle = "Harga dan aturan checkout mengikuti akun pelanggan biasa.";
    summary = "COD tidak ditampilkan pada akun ini dan checkout memakai harga normal.";
  } else if (!addressComplete) {
    statusTone = "warning";
    statusTitle = "Lengkapi alamat untuk menghitung minimum pembelian.";
    summary =
      "Wilayah pengiriman dibutuhkan untuk menentukan aturan akun Anda sebelum checkout bisa diteruskan.";
  } else if (requiresPermissionCode && !input.permissionValidated) {
    statusTone = "warning";
    statusTitle = "Pembelian luar Jawa membutuhkan kode izin dari admin.";
    summary =
      "Masukkan kode izin checkout untuk melanjutkan transaksi dari luar Pulau Jawa.";
  } else if (!minimumMet) {
    statusTone = "warning";
    statusTitle = "Minimum pembelian akun Anda belum terpenuhi.";
    summary = `Kurang Rp ${new Intl.NumberFormat("id-ID").format(remainingAmount)} untuk melanjutkan checkout.`;
    progressMessage = `Kurang Rp ${new Intl.NumberFormat("id-ID").format(remainingAmount)} untuk melanjutkan checkout.`;
  }

  const progress =
    isDistributorAccount && minimumAmount > 0
      ? Math.min(100, Math.round((input.subtotal / minimumAmount) * 100))
      : null;

  return {
    accountRole,
    addressComplete,
    allowedPaymentMethods,
    canCheckout,
    canUseCod: canUseCod(input.session),
    isDistributorAccount,
    minimumAmount,
    progress,
    progressMessage,
    region,
    regionLabel,
    remainingAmount,
    requiresPermissionCode,
    statusTone,
    statusTitle,
    summary,
  } satisfies CheckoutEligibility;
}
