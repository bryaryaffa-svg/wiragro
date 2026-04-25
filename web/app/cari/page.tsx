import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { ProductCard } from "@/components/product-card";
import { getFallbackProductList, getProducts } from "@/lib/api";
import {
  getAllCampaignLandings,
  type CampaignLandingDefinition,
} from "@/lib/campaign-content";
import {
  getAllGrowthBundles,
  type GrowthBundleDefinition,
} from "@/lib/growth-commerce";
import {
  COMMERCIAL_ENTRY_LINKS,
  getShoppingHubCards,
  type PathwayCard,
} from "@/lib/hybrid-navigation";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const B2B_SEARCH_TERMS = [
  "b2b",
  "grosir",
  "partai",
  "reseller",
  "kios",
  "quote",
  "quotation",
  "pengadaan",
  "proyek",
  "bulk",
  "rutin",
];

function normalizeSearchTerm(value?: string) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenizeSearchTerm(value?: string) {
  return normalizeSearchTerm(value)
    .split(" ")
    .filter((token) => token.length >= 2);
}

function scoreText(text: string, query: string, tokens: string[]) {
  if (!query) {
    return 0;
  }

  let score = 0;

  if (text.includes(query)) {
    score += 6;
  }

  for (const token of tokens) {
    if (text.includes(token)) {
      score += 2;
    }
  }

  return score;
}

function scoreBundle(bundle: GrowthBundleDefinition, query: string, tokens: string[]) {
  const title = normalizeSearchTerm(bundle.title);
  const haystack = normalizeSearchTerm(
    [
      bundle.title,
      bundle.description,
      bundle.summary,
      bundle.audience,
      bundle.kind,
      ...bundle.relatedCommoditySlugs,
    ].join(" "),
  );

  return scoreText(haystack, query, tokens) + (title.includes(query) ? 4 : 0);
}

function scoreCampaign(campaign: CampaignLandingDefinition, query: string, tokens: string[]) {
  const title = normalizeSearchTerm(campaign.title);
  const haystack = normalizeSearchTerm(
    [
      campaign.title,
      campaign.description,
      campaign.summary,
      campaign.focusLabel,
      campaign.seasonLabel,
      campaign.audience,
      ...campaign.relatedCommoditySlugs,
    ].join(" "),
  );

  return scoreText(haystack, query, tokens) + (title.includes(query) ? 4 : 0);
}

function buildBundleCard(bundle: GrowthBundleDefinition): PathwayCard {
  return {
    pillar: "shop",
    eyebrow: "Bundle resmi",
    title: bundle.title,
    description: bundle.summary,
    href: bundle.href,
    actionLabel: "Buka bundle ini",
    supportingLinks: [
      { href: "/belanja/paket", label: "Semua bundle" },
      { href: bundle.catalogHref, label: "Produk terkait" },
    ],
  };
}

function buildCampaignCard(campaign: CampaignLandingDefinition): PathwayCard {
  return {
    pillar: "shop",
    eyebrow: "Campaign resmi",
    title: campaign.title,
    description: campaign.summary,
    href: campaign.href,
    actionLabel: "Buka program ini",
    supportingLinks: [
      { href: "/kampanye", label: "Semua campaign" },
      { href: campaign.catalogHref, label: "Produk terkait" },
    ],
  };
}

function buildB2BCard(queryLabel?: string): PathwayCard {
  return {
    pillar: "shop",
    eyebrow: "B2B inquiry",
    title: "Butuh penawaran awal atau kebutuhan partai yang lebih rapi?",
    description: queryLabel
      ? `Query "${queryLabel}" terlihat dekat dengan kebutuhan kios, reseller, proyek, atau repeat order yang lebih cocok masuk ke jalur B2B.`
      : "Gunakan jalur B2B saat kebutuhan sudah masuk ke pembelian partai, proyek, atau repeat order yang perlu didiskusikan lebih lanjut.",
    href: "/b2b",
    actionLabel: "Masuk ke B2B inquiry",
    supportingLinks: [
      { href: "/belanja/paket", label: "Mulai dari bundle" },
      { href: "/kampanye", label: "Masuk dari campaign" },
    ],
  };
}

function buildCommercialSearchCards(queryLabel?: string) {
  const query = normalizeSearchTerm(queryLabel);
  const tokens = tokenizeSearchTerm(queryLabel);

  if (!query) {
    return getShoppingHubCards();
  }

  const bundleCards = getAllGrowthBundles()
    .map((bundle) => ({
      item: buildBundleCard(bundle),
      score: scoreBundle(bundle, query, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);
  const campaignCards = getAllCampaignLandings()
    .map((campaign) => ({
      item: buildCampaignCard(campaign),
      score: scoreCampaign(campaign, query, tokens),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, 2);
  const shouldShowB2B = B2B_SEARCH_TERMS.some((term) => query.includes(term));

  const cards = [...bundleCards, ...campaignCards]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3)
    .map((entry) => entry.item);

  if (shouldShowB2B) {
    cards.push(buildB2BCard(queryLabel));
  }

  return cards.length ? cards : getShoppingHubCards();
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const search = typeof resolved.q === "string" ? resolved.q : undefined;

  return buildCatalogMetadata({
    title: search ? `Cari "${search}" di Wiragro` : "Cari Penawaran Wiragro",
    description: search
      ? "Cari produk, bundle, campaign, dan entry B2B Wiragro dari satu jalur pencarian."
      : "Jalur pencarian Wiragro untuk produk, bundle, campaign, dan kebutuhan B2B.",
    path: "/cari",
    canonicalPath: "/cari",
    noIndex: Boolean(search),
    keywords: ["cari produk pertanian", "cari bundle pertanian", "campaign wiragro", "b2b pertanian"],
  });
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const search = typeof resolved.q === "string" ? resolved.q : "";
  const trimmedSearch = search.trim();
  const [productsResult] = await Promise.allSettled([
    getProducts({ q: trimmedSearch || undefined, page_size: 8, sort: "latest" }),
  ]);
  const products =
    productsResult.status === "fulfilled"
      ? productsResult.value
      : getFallbackProductList({ q: trimmedSearch || undefined, page_size: 8, sort: "latest" });
  const catalogUnavailable = productsResult.status === "rejected";
  const commercialCards = buildCommercialSearchCards(trimmedSearch);
  const catalogHref = trimmedSearch
    ? `/produk?q=${encodeURIComponent(trimmedSearch)}`
    : "/produk";

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: trimmedSearch ? `Cari "${trimmedSearch}" di Wiragro` : "Cari Penawaran Wiragro",
            description:
              "Jalur pencarian Wiragro untuk produk, bundle, campaign, dan kebutuhan B2B.",
            path: "/cari",
          }),
          buildCollectionJsonLd({
            title: "Pencarian Wiragro",
            description: "Hasil pencarian penawaran resmi dan produk aktif Wiragro.",
            path: "/cari",
            itemUrls: products.items.slice(0, 8).map((product) => `/produk/${product.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari", path: "/cari" },
          ]),
        ]}
        id="search-page-jsonld"
      />

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Cari</span>
        <h1>
          {trimmedSearch ? `Hasil pencarian untuk "${trimmedSearch}"` : "Cari penawaran Wiragro"}
        </h1>
        <p>
          Pencarian sekarang tidak hanya membawa Anda ke listing produk. Jika kata kunci yang
          dicari cocok, bundle, kampanye, dan jalur B2B juga akan ikut ditampilkan.
        </p>
      </div>

      <form action="/cari" className="catalog-search-card">
        <div className="catalog-search-card__primary">
          <label className="catalog-search-card__field">
            <span>Cari penawaran</span>
            <input
              defaultValue={trimmedSearch}
              name="q"
              placeholder="Cari produk, bundle, kampanye, atau kebutuhan B2B..."
            />
          </label>
          <button className="btn btn-primary" type="submit">
            Cari
          </button>
        </div>

        <div className="catalog-chip-row" aria-label="Jalur penawaran">
          <Link className={!trimmedSearch ? "is-active" : undefined} href="/cari">
            Semua entry
          </Link>
          {COMMERCIAL_ENTRY_LINKS.map((link) => (
            <Link href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
          <Link href="/produk">Katalog produk</Link>
        </div>
      </form>

      <PathwaySection
        action={{
          href: catalogHref,
          label: trimmedSearch ? "Lihat semua produk terkait" : "Jelajahi produk",
        }}
        cards={commercialCards}
        description={
          trimmedSearch
            ? "Bagian ini mengangkat jalur bundle, kampanye, atau B2B saat kata kunci yang dicari mengarah ke kebutuhan tersebut."
            : "Mulai dari lini penawaran resmi atau langsung turun ke katalog, sesuai mode belanja yang sedang dicari."
        }
        eyebrow={trimmedSearch ? "Jalur yang cocok" : "Pintu masuk"}
        title={
          trimmedSearch
            ? "Pencarian mengangkat jalur yang paling masuk akal lebih dulu."
            : "Cari dari lini penawaran resmi, bukan hanya dari katalog."
        }
      />

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Produk terkait</span>
            <h2>{products.pagination.count} produk tersedia</h2>
            <p>
              Produk tetap muncul sebagai hasil akhir yang penting, tetapi sekarang datang bersama
              jalur bundle, campaign, dan B2B yang lebih cocok bila query-nya memang mengarah ke sana.
            </p>
          </div>
          <Link href={catalogHref}>Buka katalog penuh</Link>
        </div>

        {catalogUnavailable ? (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Katalog belum dapat dimuat</span>
            <h2>Daftar produk sementara belum bisa dimuat.</h2>
            <p>
              Search discovery tetap aktif. Anda masih bisa membuka bundle, campaign, atau jalur
              B2B dari hasil yang sudah ditampilkan.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Jelajahi produk
              </Link>
            </div>
          </article>
        ) : products.items.length ? (
          <div className="product-grid product-grid--catalog">
            {products.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <article className="empty-state empty-state--shopping">
            <span className="eyebrow-label">Belum ada produk yang cocok</span>
            <h2>Query ini belum menemukan produk aktif yang sesuai.</h2>
            <p>
              Coba buka bundle, campaign, atau inquiry B2B di atas bila kebutuhan Anda masih
              lebih dekat ke paket, momentum musiman, atau penawaran awal.
            </p>
            <div className="empty-state__actions">
              <Link className="btn btn-primary" href="/produk">
                Jelajahi produk
              </Link>
            </div>
          </article>
        )}
      </section>
    </section>
  );
}
