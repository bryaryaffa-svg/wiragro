export const storeCode =
  process.env.STORE_CODE ?? process.env.NEXT_PUBLIC_STORE_CODE ?? "SIDO-JATIM-ONLINE";

export const storefrontApiBaseUrl =
  process.env.PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:8000/api";

const inferredCustomerApiBaseUrl = (() => {
  const publicBase =
    process.env.NEXT_PUBLIC_CUSTOMER_API_BASE_URL ??
    process.env.CUSTOMER_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (publicBase) {
    return publicBase;
  }

  const publicCatalogBase =
    process.env.NEXT_PUBLIC_PUBLIC_API_BASE_URL ??
    process.env.PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL;

  if (!publicCatalogBase) {
    return "http://localhost:8000/api/v1";
  }

  return `${publicCatalogBase.replace(/\/+$/, "")}/v1`;
})();

export const customerApiBaseUrl =
  inferredCustomerApiBaseUrl;

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
