import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/wp-admin/",
          "/wp-content/",
          "/wp-includes/",
          "/wp-json/",
          "/xmlrpc.php",
        ],
      },
    ],
    host: siteUrl,
    sitemap: [`${siteUrl}/sitemap.xml`],
  };
}
