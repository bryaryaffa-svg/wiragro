function buildGoogleMapsQuery(parts: Array<string | null | undefined>) {
  return parts
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
}

export function buildGoogleMapsSearchUrl(address: string) {
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildGoogleMapsEmbedUrl(address: string) {
  const query = encodeURIComponent(address.trim());
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export function buildGoogleMapsStoreSearchUrl(
  storeName: string,
  address?: string | null,
) {
  const query = encodeURIComponent(buildGoogleMapsQuery([storeName, address]).join(", "));
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export function buildGoogleMapsStoreEmbedUrl(
  storeName: string,
  address?: string | null,
) {
  const query = encodeURIComponent(buildGoogleMapsQuery([storeName, address]).join(", "));
  return `https://www.google.com/maps?q=${query}&output=embed`;
}
