import { cache } from "react";

import { getStaticPage } from "@/lib/api";
import {
  buildStaticPageFallbackMetadata,
  buildStaticPageMetadata,
} from "@/lib/seo";

export const getStaticPageCached = cache(getStaticPage);

type StaticPageSeoFallback = {
  title: string;
  description: string;
};

export async function generateStaticPageMetadata(
  slug: string,
  path: string,
  fallback: StaticPageSeoFallback,
) {
  try {
    const page = await getStaticPageCached(slug);
    return buildStaticPageMetadata(page, path);
  } catch {
    return buildStaticPageFallbackMetadata(fallback.title, fallback.description, path);
  }
}
