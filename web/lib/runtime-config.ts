interface RuntimeConfigSource {
  API_BASE_URL?: string;
  CUSTOMER_API_BASE_URL?: string;
  NODE_ENV?: string;
  NEXT_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_CUSTOMER_API_BASE_URL?: string;
  NEXT_PUBLIC_GOOGLE_CLIENT_ID?: string;
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  NEXT_PUBLIC_PUBLIC_API_BASE_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  NEXT_PUBLIC_STORE_CODE?: string;
  PUBLIC_API_BASE_URL?: string;
  STORE_CODE?: string;
}

export interface PublicRuntimeConfig {
  customerApiBaseUrl: string;
  googleClientId: string;
  googleMapsApiKey: string;
  siteUrl: string;
  storeCode: string;
  storefrontApiBaseUrl: string;
}

export const PRIMARY_SITE_URL = "https://wiragro.id";
const PRIMARY_SITE_HOSTNAME = "wiragro.id";
const LEGACY_SITE_HOSTNAMES = new Set(["www.wiragro.id"]);

function trimTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function toPublicApiBase(url: string) {
  const trimmed = trimTrailingSlash(url);
  return trimmed.endsWith("/v1") ? trimmed.replace(/\/v1$/, "") : trimmed;
}

function toCustomerApiBase(url: string) {
  const trimmed = trimTrailingSlash(url);
  return trimmed.endsWith("/v1") ? trimmed : `${trimmed}/v1`;
}

function normalizeSiteUrl(rawUrl: string | undefined, environment?: string) {
  const fallbackSiteUrl = environment === "development" ? "http://localhost:3000" : PRIMARY_SITE_URL;

  if (!rawUrl) {
    return fallbackSiteUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    const isLocalHost =
      parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1";

    if (environment === "development" && isLocalHost) {
      return trimTrailingSlash(parsed.toString());
    }

    if (
      parsed.hostname === PRIMARY_SITE_HOSTNAME ||
      LEGACY_SITE_HOSTNAMES.has(parsed.hostname)
    ) {
      return PRIMARY_SITE_URL;
    }

    return environment === "development"
      ? trimTrailingSlash(parsed.toString())
      : PRIMARY_SITE_URL;
  } catch {
    return fallbackSiteUrl;
  }
}

function buildPublicRuntimeConfig(source: RuntimeConfigSource): PublicRuntimeConfig {
  const storeCode =
    source.STORE_CODE ?? source.NEXT_PUBLIC_STORE_CODE ?? "SIDO-JATIM-ONLINE";

  const configuredPublicApiBase =
    source.PUBLIC_API_BASE_URL ??
    source.API_BASE_URL ??
    source.NEXT_PUBLIC_PUBLIC_API_BASE_URL;

  const configuredCustomerApiBase =
    source.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ??
    source.CUSTOMER_API_BASE_URL ??
    source.NEXT_PUBLIC_API_BASE_URL;

  const storefrontApiBaseUrl = trimTrailingSlash(
    configuredPublicApiBase
      ? toPublicApiBase(configuredPublicApiBase)
      : configuredCustomerApiBase
        ? toPublicApiBase(configuredCustomerApiBase)
        : "http://localhost:8000/api",
  );

  const customerApiBaseUrl = trimTrailingSlash(
    configuredCustomerApiBase
      ? toCustomerApiBase(configuredCustomerApiBase)
      : toCustomerApiBase(storefrontApiBaseUrl),
  );

  return {
    customerApiBaseUrl,
    googleClientId: source.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "",
    googleMapsApiKey: source.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
    siteUrl: normalizeSiteUrl(source.NEXT_PUBLIC_SITE_URL, source.NODE_ENV),
    storeCode,
    storefrontApiBaseUrl,
  };
}

function readServerRuntimeConfig(): PublicRuntimeConfig {
  return buildPublicRuntimeConfig(process.env as RuntimeConfigSource);
}

export function getPublicRuntimeConfig(): PublicRuntimeConfig {
  if (typeof window !== "undefined" && window.__KIOS_RUNTIME_CONFIG__) {
    return window.__KIOS_RUNTIME_CONFIG__;
  }

  return readServerRuntimeConfig();
}

export function serializePublicRuntimeConfig() {
  return JSON.stringify(readServerRuntimeConfig()).replace(/</g, "\\u003c");
}
