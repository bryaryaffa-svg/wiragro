import type { CustomerSession, ProductSummary } from "@/lib/api";

export type AccountRole = "admin" | "customer" | "distributor";

const ADMIN_TOKENS = ["admin", "owner", "superadmin"];
const DISTRIBUTOR_TOKENS = [
  "b2b",
  "distributor",
  "grosir",
  "mitra",
  "partner",
  "reseller",
  "wholesale",
];

function normalize(value?: string | null) {
  return (value ?? "").toLowerCase().trim();
}

function hasTokenMatch(value: string, tokens: string[]) {
  return tokens.some((token) => value.includes(token));
}

export function resolveAccountRole(session?: CustomerSession | null): AccountRole {
  const haystack = normalize(
    [
      session?.role,
      session?.mode,
      session?.pricing_mode,
      session?.customer.member_tier,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (hasTokenMatch(haystack, ADMIN_TOKENS)) {
    return "admin";
  }

  if (hasTokenMatch(haystack, DISTRIBUTOR_TOKENS)) {
    return "distributor";
  }

  return "customer";
}

export function isAuthenticatedCustomer(session?: CustomerSession | null) {
  return Boolean(session?.access_token);
}

export function canUseRolePricing(session?: CustomerSession | null) {
  const role = resolveAccountRole(session);
  return role === "admin" || role === "distributor";
}

export function canUseCod(session?: CustomerSession | null) {
  return canUseRolePricing(session);
}

export function getRoleAwarePrice(price: ProductSummary["price"], session?: CustomerSession | null) {
  const privileged = canUseRolePricing(session);
  const accountPrice = price.wholesale_amount;
  const hasAccountPrice =
    privileged &&
    Boolean(accountPrice) &&
    accountPrice !== price.amount;

  return {
    isRoleAware: hasAccountPrice,
    label: hasAccountPrice ? "Harga akun Anda" : "Harga aktif saat ini",
    referenceAmount: hasAccountPrice ? price.amount : price.compare_at_amount,
    value: hasAccountPrice ? accountPrice : price.amount,
  };
}
