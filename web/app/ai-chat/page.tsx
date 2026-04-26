import Link from "next/link";

import { AIChatClient } from "@/components/ai-chat-client";
import { JsonLd } from "@/components/json-ld";
import { getArticles, getProducts } from "@/lib/api";
import { getEducationVideoResources } from "@/lib/education-content";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  return typeof params[key] === "string" ? params[key] : undefined;
}

export const metadata = buildPageMetadata({
  title: "AI Pertanian - Wiragro",
  description:
    "Gunakan AI Pertanian Wiragro untuk mendapatkan arahan awal masalah tanaman dan rekomendasi produk.",
  path: "/ai-chat",
  keywords: [
    "ai pertanian premium",
    "diagnosis awal tanaman",
    "rekomendasi produk pertanian",
    "ai chat wiragro",
  ],
  section: "utility",
});

export default async function AIChatPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const context = {
    crop: getParam(resolved, "crop") ?? getParam(resolved, "tanaman") ?? null,
    problem: getParam(resolved, "problem") ?? getParam(resolved, "masalah") ?? null,
    product: getParam(resolved, "product") ?? null,
  };

  const [articles, products] = await Promise.all([
    getArticles({ page_size: 12 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 12, count: 0 },
    })),
    getProducts({ page_size: 12, sort: "best_seller" }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 12, count: 0 },
      available_filters: {},
      seo: {},
    })),
  ]);
  const videos = getEducationVideoResources();

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "AI Pertanian Wiragro | Premium Feature",
            description:
              "Jelaskan masalah tanaman, dapatkan arahan awal, rekomendasi produk, serta artikel dan video terkait di AI Pertanian Wiragro.",
            path: "/ai-chat",
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "AI Chat", path: "/ai-chat" },
          ]),
        ]}
        id="ai-chat-page-jsonld"
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <span>AI Chat</span>
      </div>

      <AIChatClient
        articles={articles.items}
        context={context}
        products={products.items}
        videos={videos}
      />
    </section>
  );
}
