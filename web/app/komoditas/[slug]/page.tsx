import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleCard } from "@/components/article-card";
import { CampaignSpotlightCard } from "@/components/campaign-spotlight-card";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { ProductCard } from "@/components/product-card";
import { SolutionCard } from "@/components/solution-card";
import {
  type ProductSummary,
  getArticles,
  getFallbackProductList,
  getFallbackStoreProfile,
  getProducts,
  getStoreProfile,
} from "@/lib/api";
import { getCampaignLandingsForCommodity } from "@/lib/campaign-content";
import { getCommodityHub } from "@/lib/commodity-content";
import { filterArticlesByState } from "@/lib/article-content";
import { buildWhatsAppConsultationUrl } from "@/lib/homepage-content";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";
import { filterSolutionsByState, getAllSolutions } from "@/lib/solution-content";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

function dedupeProducts(products: Array<ProductSummary | null | undefined>) {
  return products
    .filter((product): product is ProductSummary => Boolean(product))
    .filter((product, index, list) => list.findIndex((item) => item.id === product.id) === index);
}

function uniqueBySlug<T extends { slug: string }>(items: Array<T | null | undefined>) {
  return items
    .filter((item): item is T => Boolean(item))
    .filter((item, index, list) => list.findIndex((candidate) => candidate.slug === item.slug) === index);
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const commodity = getCommodityHub(slug);

  if (!commodity) {
    return buildPageMetadata({
      title: "Komoditas tidak tersedia",
      description: "Halaman komoditas yang Anda cari belum tersedia.",
      path: `/komoditas/${slug}`,
      canonicalPath: "/komoditas",
      noIndex: true,
      section: "static",
    });
  }

  return buildPageMetadata({
    title: `${commodity.label} | Komoditas Pertanian`,
    description: commodity.summary,
    path: `/komoditas/${commodity.slug}`,
    canonicalPath: `/komoditas/${commodity.slug}`,
    section: "static",
    keywords: [
      commodity.label,
      `komoditas ${commodity.label.toLowerCase()}`,
      `${commodity.label.toLowerCase()} artikel`,
      `${commodity.label.toLowerCase()} solusi`,
      `${commodity.label.toLowerCase()} produk`,
    ],
  });
}

export default async function CommodityDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const commodity = getCommodityHub(slug);

  if (!commodity) {
    notFound();
  }

  const [articleFeed, store, productGroups] = await Promise.all([
    getArticles({ page_size: 50 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 50, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    Promise.all(
      commodity.productQueries.slice(0, 4).map((query) =>
        getProducts({ q: query, page_size: 4 }).catch(() =>
          getFallbackProductList({ q: query, page_size: 4 }),
        ),
      ),
    ),
  ]);

  const taxonomyArticles = filterArticlesByState(articleFeed.items, { komoditas: commodity.slug });
  const commodityArticles = uniqueBySlug([
    ...commodity.articleSlugs.map((item) => articleFeed.items.find((article) => article.slug === item)),
    ...taxonomyArticles,
  ]).slice(0, 6);

  const allSolutions = getAllSolutions();
  const taxonomySolutions = filterSolutionsByState(allSolutions, { komoditas: commodity.slug });
  const commoditySolutions = uniqueBySlug([
    ...commodity.solutionSlugs.map((item) => allSolutions.find((solution) => solution.slug === item)),
    ...taxonomySolutions,
  ]).slice(0, 6);

  const commodityProducts = dedupeProducts(productGroups.flatMap((group) => group.items)).slice(0, 8);
  const relatedCampaigns = getCampaignLandingsForCommodity(commodity.slug, 2);
  const consultationUrl = buildWhatsAppConsultationUrl(
    store.whatsapp_number,
    store.name,
  );

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: `${commodity.label} | Komoditas Pertanian`,
            description: commodity.summary,
            path: `/komoditas/${commodity.slug}`,
          }),
          buildCollectionJsonLd({
            title: `Hub Komoditas ${commodity.label}`,
            description: commodity.summary,
            path: `/komoditas/${commodity.slug}`,
            itemUrls: [
              ...commodityArticles.slice(0, 4).map((article) => `/artikel/${article.slug}`),
              ...commoditySolutions.slice(0, 4).map((solution) => `/solusi/masalah/${solution.slug}`),
              ...commodityProducts.slice(0, 4).map((product) => `/produk/${product.slug}`),
            ],
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Komoditas", path: "/komoditas" },
            { name: commodity.label, path: `/komoditas/${commodity.slug}` },
          ]),
        ]}
        id={`commodity-${commodity.slug}-jsonld`}
      />

      <section className={`commodity-hero commodity-hero--${commodity.theme}`}>
        <div className="commodity-hero__copy">
          <div className="breadcrumbs">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/komoditas">Komoditas</Link>
            <span>/</span>
            <span>{commodity.label}</span>
          </div>
          <span className="eyebrow-label">Komoditas</span>
          <h1>{commodity.label}</h1>
          <p>{commodity.summary}</p>
          <div className="commodity-hero__actions">
            <Link className="btn btn-primary" href={`/belajar/komoditas/${commodity.slug}`}>
              Masuk ke artikel {commodity.label}
            </Link>
            <Link className="btn btn-secondary" href={`/solusi/komoditas/${commodity.slug}`}>
              Lihat solusi {commodity.label}
            </Link>
          </div>
        </div>

        <aside className="commodity-hero__aside">
          <span className="eyebrow-label">Cara pakai hub ini</span>
          <strong>Mulai dari konteks tanam, lalu pilih langkah berikutnya.</strong>
          <ul className="plain-list">
            {commodity.heroBullets.map((item) => (
              <li key={`${commodity.slug}-${item}`}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Bundle rekomendasi</span>
            <h2>Bundle berbasis komoditas, fase, dan problem yang paling sering muncul.</h2>
            <p>
              Model bundle ini sengaja ringan: cukup kuat untuk jadi jembatan conversion,
              tetapi belum memaksa tim membangun sistem bundling kompleks lebih dulu.
            </p>
          </div>
        </div>
        <div className="growth-bundle-grid">
          {commodity.bundles.map((bundle) => (
            <GrowthBundleCard bundle={bundle} key={`${commodity.slug}-${bundle.title}`} />
          ))}
        </div>
      </section>

      {commodityArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Belajar</span>
              <h2>Artikel edukasi untuk {commodity.label}.</h2>
            </div>
            <Link href={`/belajar/komoditas/${commodity.slug}`}>Semua artikel {commodity.label}</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {commodityArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {commoditySolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Cari Solusi</span>
              <h2>Masalah lapangan yang paling dekat dengan komoditas ini.</h2>
            </div>
            <Link href={`/solusi/komoditas/${commodity.slug}`}>Semua solusi {commodity.label}</Link>
          </div>
          <div className="solution-grid">
            {commoditySolutions.map((solution) => (
              <SolutionCard key={solution.slug} solution={solution} />
            ))}
          </div>
        </section>
      ) : null}

      {commodityProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Belanja</span>
              <h2>Produk yang sering relevan untuk konteks {commodity.label.toLowerCase()}.</h2>
            </div>
            <Link href="/produk">Buka katalog</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {commodityProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedCampaigns.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Campaign musiman</span>
              <h2>Landing komersial yang paling dekat dengan komoditas {commodity.label.toLowerCase()}.</h2>
              <p>
                Campaign ini bisa dipakai untuk ads, promo musiman, atau follow-up WhatsApp
                tanpa melepaskan konteks komoditas yang sedang dijelajahi user.
              </p>
            </div>
            <Link href="/kampanye">Semua campaign</Link>
          </div>
          <div className="campaign-grid">
            {relatedCampaigns.map((campaign) => (
              <CampaignSpotlightCard campaign={campaign} key={campaign.slug} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="section-block">
        <div className="commodity-bridge-band">
          <div>
            <span className="eyebrow-label">Konsultasi</span>
            <h2>Masih belum yakin harus mulai dari artikel, solusi, atau produk?</h2>
            <p>
              Jalur komoditas ini dibuat untuk menyederhanakan keputusan. Kalau user tetap ragu,
              arahkan ke WhatsApp agar trust dan conversion tetap berjalan dalam satu flow.
            </p>
          </div>
          <div className="commodity-bridge-band__actions">
            {consultationUrl ? (
              <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi WhatsApp
              </a>
            ) : (
              <Link className="btn btn-primary" href="/kontak">
                Hubungi toko
              </Link>
            )}
            <Link className="btn btn-secondary" href="/belanja/paket">
              Lihat paket bundle
            </Link>
            <Link className="btn btn-secondary" href="/komoditas">
              Lihat komoditas lain
            </Link>
          </div>
        </div>
      </section>
    </section>
  );
}
