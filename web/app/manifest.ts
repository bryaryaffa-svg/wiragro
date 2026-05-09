import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wiragro",
    short_name: "Wiragro",
    description: "Platform Solusi Pertanian Digital untuk solusi tanaman, edukasi, produk, dan layanan pertanian.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5fbef",
    theme_color: "#74c365",
    lang: "id-ID",
    icons: [
      {
        src: "/brand/wiragro-icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/brand/wiragro-icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
