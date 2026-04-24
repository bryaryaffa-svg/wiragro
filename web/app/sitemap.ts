import type { MetadataRoute } from "next";

import { getArticles, getProducts } from "@/lib/api";
import {
  ARTICLE_TAXONOMY_SECTIONS,
  buildArticleTaxonomyBrowseHref,
  getAvailableArticleTaxonomySlugs,
} from "@/lib/article-content";
import { getAllCampaignLandings } from "@/lib/campaign-content";
import { getAllCommodityHubs } from "@/lib/commodity-content";
import { getSiteUrl } from "@/lib/config";
import { getAllGrowthBundles } from "@/lib/growth-commerce";
import {
  SOLUTION_TAXONOMY_SECTIONS,
  buildSolutionTaxonomyBrowseHref,
  getAllSolutions,
  getAvailableSolutionTaxonomySlugs,
} from "@/lib/solution-content";

function toAbsoluteImageUrl(siteUrl: string, imageUrl: string) {
  try {
    return new URL(imageUrl).toString();
  } catch {
    return `${siteUrl}${imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`}`;
  }
}

async function collectProductEntries(siteUrl: string) {
  const pageSize = 100;
  const items: MetadataRoute.Sitemap = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const payload = await getProducts({ page, page_size: pageSize });

    total = payload.pagination.count;

    if (!payload.items.length) {
      break;
    }

    items.push(
      ...payload.items.map((product) => ({
        url: `${siteUrl}/produk/${product.slug}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
        images: product.images.length
          ? [product.images.find((image) => image.is_primary)?.url ?? product.images[0]?.url]
              .filter((image): image is string => Boolean(image))
              .map((image) => toAbsoluteImageUrl(siteUrl, image))
          : undefined,
      })),
    );

    if (payload.items.length < pageSize) {
      break;
    }

    page += 1;
  }

  return items;
}

async function collectArticleEntries(siteUrl: string) {
  const pageSize = 100;
  const items: MetadataRoute.Sitemap = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const payload = await getArticles({ page, page_size: pageSize });

    total = payload.pagination.count;

    if (!payload.items.length) {
      break;
    }

    items.push(
      ...payload.items.map((article) => ({
        url: `${siteUrl}/artikel/${article.slug}`,
        lastModified: article.updated_at
          ? new Date(article.updated_at)
          : article.published_at
            ? new Date(article.published_at)
            : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    );

    if (payload.items.length < pageSize) {
      break;
    }

    page += 1;
  }

  return items;
}

async function collectArticleTaxonomyEntries(siteUrl: string) {
  const payload = await getArticles({ page_size: 200 });
  const availableSlugs = getAvailableArticleTaxonomySlugs(payload.items);
  const now = new Date();

  return ARTICLE_TAXONOMY_SECTIONS.flatMap((section) => {
    const activeTerms = section.items.filter((item) =>
      availableSlugs[section.queryKey].includes(item.slug),
    );

    if (!activeTerms.length) {
      return [];
    }

    return [
      {
        url: `${siteUrl}${buildArticleTaxonomyBrowseHref(section.queryKey)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.76,
      },
      ...activeTerms.map((term) => ({
        url: `${siteUrl}${buildArticleTaxonomyBrowseHref(section.queryKey, term.slug)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.72,
      })),
    ];
  });
}

function collectSolutionEntries(siteUrl: string) {
  return getAllSolutions().map((solution) => ({
    url: `${siteUrl}/solusi/masalah/${solution.slug}`,
    lastModified: solution.updated_at
      ? new Date(solution.updated_at)
      : solution.published_at
        ? new Date(solution.published_at)
        : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.76,
  }));
}

function collectSolutionTaxonomyEntries(siteUrl: string) {
  const availableSlugs = getAvailableSolutionTaxonomySlugs(getAllSolutions());
  const now = new Date();

  return SOLUTION_TAXONOMY_SECTIONS.flatMap((section) => {
    const activeTerms = section.items.filter((item) =>
      availableSlugs[section.queryKey].includes(item.slug),
    );

    if (!activeTerms.length) {
      return [];
    }

    return [
      {
        url: `${siteUrl}${buildSolutionTaxonomyBrowseHref(section.queryKey)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.79,
      },
      ...activeTerms.map((term) => ({
        url: `${siteUrl}${buildSolutionTaxonomyBrowseHref(section.queryKey, term.slug)}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
    ];
  });
}

function collectCommodityEntries(siteUrl: string) {
  return getAllCommodityHubs().map((commodity) => ({
    url: `${siteUrl}/komoditas/${commodity.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}

function collectBundleEntries(siteUrl: string) {
  const now = new Date();

  return getAllGrowthBundles().map((bundle) => ({
    url: `${siteUrl}${bundle.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.78,
  }));
}

function collectCampaignEntries(siteUrl: string) {
  const now = new Date();

  return getAllCampaignLandings().map((campaign) => ({
    url: `${siteUrl}${campaign.href}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.77,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const solutionEntries = collectSolutionEntries(siteUrl);
  const solutionTaxonomyEntries = collectSolutionTaxonomyEntries(siteUrl);
  const commodityEntries = collectCommodityEntries(siteUrl);
  const bundleEntries = collectBundleEntries(siteUrl);
  const campaignEntries = collectCampaignEntries(siteUrl);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      path: "",
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      path: "/belajar",
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
    {
      path: "/komoditas",
      changeFrequency: "weekly" as const,
      priority: 0.87,
    },
    {
      path: "/solusi",
      changeFrequency: "weekly" as const,
      priority: 0.88,
    },
    {
      path: "/belanja",
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      path: "/belanja/paket",
      changeFrequency: "weekly" as const,
      priority: 0.86,
    },
    {
      path: "/kampanye",
      changeFrequency: "weekly" as const,
      priority: 0.82,
    },
    {
      path: "/produk",
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      path: "/artikel",
      changeFrequency: "daily" as const,
      priority: 0.85,
    },
    {
      path: "/tentang-kami",
      changeFrequency: "monthly" as const,
      priority: 0.55,
    },
    {
      path: "/kontak",
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      path: "/faq",
      changeFrequency: "weekly" as const,
      priority: 0.6,
    },
    {
      path: "/b2b",
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    {
      path: "/pengiriman-pembayaran",
      changeFrequency: "monthly" as const,
      priority: 0.45,
    },
    {
      path: "/garansi-retur",
      changeFrequency: "monthly" as const,
      priority: 0.45,
    },
    {
      path: "/kebijakan-privasi",
      changeFrequency: "monthly" as const,
      priority: 0.35,
    },
    {
      path: "/syarat-dan-ketentuan",
      changeFrequency: "monthly" as const,
      priority: 0.35,
    },
  ].map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const [productEntries, articleEntries, articleTaxonomyEntries] = await Promise.all([
      collectProductEntries(siteUrl),
      collectArticleEntries(siteUrl),
      collectArticleTaxonomyEntries(siteUrl),
    ]);

    return [
      ...staticRoutes,
      ...commodityEntries,
      ...bundleEntries,
      ...campaignEntries,
      ...articleTaxonomyEntries,
      ...solutionTaxonomyEntries,
      ...solutionEntries,
      ...productEntries,
      ...articleEntries,
    ];
  } catch {
    return [
      ...staticRoutes,
      ...commodityEntries,
      ...bundleEntries,
      ...campaignEntries,
      ...solutionTaxonomyEntries,
      ...solutionEntries,
    ];
  }
}
