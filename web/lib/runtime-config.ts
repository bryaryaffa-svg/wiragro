interface RuntimeConfigSource {
  API_BASE_URL?: string;
  CUSTOMER_API_BASE_URL?: string;
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
    siteUrl: source.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
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
