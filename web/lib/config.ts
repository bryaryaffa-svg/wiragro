import { getPublicRuntimeConfig } from "@/lib/runtime-config";

export function getStoreCode() {
  return getPublicRuntimeConfig().storeCode;
}

export function getStorefrontApiBaseUrl() {
  return getPublicRuntimeConfig().storefrontApiBaseUrl;
}

export function getCustomerApiBaseUrl() {
  return getPublicRuntimeConfig().customerApiBaseUrl;
}

export function getSiteUrl() {
  return getPublicRuntimeConfig().siteUrl;
}

export function getGoogleClientId() {
  return getPublicRuntimeConfig().googleClientId;
}

export function getGoogleMapsApiKey() {
  return getPublicRuntimeConfig().googleMapsApiKey;
}
