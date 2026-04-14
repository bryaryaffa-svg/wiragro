import type { MetadataRoute } from "next";

import { getArticles, getProducts } from "@/lib/api";
import { getSiteUrl } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/produk",
    "/artikel",
    "/lacak-pesanan",
    "/tentang-kami",
    "/kontak",
    "/kebijakan-privasi",
    "/syarat-dan-ketentuan",
    "/faq",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.8,
  }));

  try {
    const [products, articles] = await Promise.all([
      getProducts({ page_size: 50 }),
      getArticles({ page_size: 50 }),
    ]);

    return [
      ...staticRoutes,
      ...products.items.map((product) => ({
        url: `${siteUrl}/produk/${product.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...articles.items.map((article) => ({
        url: `${siteUrl}/artikel/${article.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticRoutes;
  }
}
