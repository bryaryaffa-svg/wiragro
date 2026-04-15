import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wiragro",
    short_name: "Wiragro",
    description: "Platform pertanian digital Wiragro untuk storefront Sidomakmur",
    start_url: "/",
    display: "standalone",
    background_color: "#f5fbef",
    theme_color: "#74c365",
    lang: "id-ID",
    icons: [
      {
        src: "/brand/wiragro-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
