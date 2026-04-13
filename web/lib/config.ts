export const storeCode =
  process.env.STORE_CODE ?? process.env.NEXT_PUBLIC_STORE_CODE ?? "SIDO-JATIM-ONLINE";

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

const configuredPublicApiBase =
  process.env.PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL;

const configuredCustomerApiBase =
  process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ??
  process.env.CUSTOMER_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL;

export const storefrontApiBaseUrl = trimTrailingSlash(
  configuredPublicApiBase
    ? toPublicApiBase(configuredPublicApiBase)
    : configuredCustomerApiBase
      ? toPublicApiBase(configuredCustomerApiBase)
      : "http://localhost:8000/api",
);

export const customerApiBaseUrl = trimTrailingSlash(
  configuredCustomerApiBase
    ? toCustomerApiBase(configuredCustomerApiBase)
    : toCustomerApiBase(storefrontApiBaseUrl),
);

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

export const googleMapsApiKey =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
