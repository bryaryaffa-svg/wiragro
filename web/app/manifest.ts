import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kios Sidomakmur",
    short_name: "Sidomakmur",
    description: "Storefront produk pertanian Sidomakmur",
    start_url: "/",
    display: "standalone",
    background_color: "#f5fbef",
    theme_color: "#74c365",
    lang: "id-ID",
  };
}
