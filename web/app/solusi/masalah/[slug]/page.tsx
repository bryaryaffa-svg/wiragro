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
  getArticles,
  getFallbackProductList,
  getFallbackStoreProfile,
  getProducts,
  getStoreProfile,
} from "@/lib/api";
import { getCampaignLandingsForSolution } from "@/lib/campaign-content";
import { getGrowthBundlesForContext } from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";
import {
  buildSolutionTaxonomyLinks,
  getAllSolutions,
  getRelatedSolutions,
  getSolutionBySlug,
} from "@/lib/solution-content";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

function buildConsultationUrl(
  phone?: string | null,
  storeName = "Wiragro",
  solutionTitle?: string,
) {
  const normalized = (phone ?? "").replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  const formatted = normalized.startsWith("0")
    ? `62${normalized.slice(1)}`
    : normalized;
  const message = encodeURIComponent(
    `Halo ${storeName}, saya ingin konsultasi tentang masalah "${solutionTitle ?? "tanaman"}" dan langkah yang paling aman untuk dilakukan.`,
  );

  return `https://wa.me/${formatted}?text=${message}`;
}

function dedupeProducts<T extends { id: string; slug: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    const key = `${item.id}:${item.slug}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function buildHowToJsonLd(slug: string, title: string, steps: string[]) {
  const url = `/solusi/masalah/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "@id": `${url}#howto`,
    name: title,
    inLanguage: "id-ID",
    step: steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: `Langkah ${index + 1}`,
      text,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    return buildPageMetadata({
      title: "Halaman solusi tidak tersedia",
      description: "Halaman solusi yang Anda cari tidak ditemukan atau belum aktif.",
      path: `/solusi/masalah/${slug}`,
      canonicalPath: "/solusi",
      noIndex: true,
      section: "static",
    });
  }

  return buildPageMetadata({
    title: solution.title,
    description: solution.excerpt,
    path: `/solusi/masalah/${slug}`,
    canonicalPath: `/solusi/masalah/${slug}`,
    section: "static",
    keywords: [
      "solusi tanaman",
      "masalah tanaman",
      "gejala tanaman",
      ...solution.taxonomy_labels,
    ],
  });
}

export default async function SolutionDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const solution = getSolutionBySlug(slug);

  if (!solution) {
    notFound();
  }

  const allSolutions = getAllSolutions();
  const relatedSolutions = getRelatedSolutions(solution, allSolutions, 3);
  const taxonomyLinks = buildSolutionTaxonomyLinks(solution);
  const primaryCommodity = solution.taxonomy.commodities[0];

  const [articleFeed, store, productGroups] = await Promise.all([
    getArticles({ page_size: 40 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 40, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
    Promise.all(
      solution.related_product_queries.slice(0, 3).map((query) =>
        getProducts({ q: query, page_size: 4 }).catch(() =>
          getFallbackProductList({ q: query, page_size: 4 }),
        ),
      ),
    ),
  ]);

  const relatedArticles = solution.related_article_slugs
    .map((slugItem) => articleFeed.items.find((article) => article.slug === slugItem))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedProducts = dedupeProducts(productGroups.flatMap((group) => group.items)).slice(0, 4);
  const consultationUrl = buildConsultationUrl(store.whatsapp_number, store.name, solution.title);
  const relatedBundles = getGrowthBundlesForContext(
    {
      solutionSlug: solution.slug,
      commoditySlug: primaryCommodity ?? null,
    },
    3,
  );
  const relatedCampaigns = getCampaignLandingsForSolution(
    {
      solutionSlug: solution.slug,
      commoditySlugs: solution.taxonomy.commodities,
    },
    2,
  );

  return (
    <article className="content-shell solution-detail-shell">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: solution.title,
            description: solution.excerpt,
            path: `/solusi/masalah/${solution.slug}`,
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari Solusi", path: "/solusi" },
            { name: solution.title, path: `/solusi/masalah/${solution.slug}` },
          ]),
          buildHowToJsonLd(solution.slug, solution.title, solution.action_steps),
        ]}
        id={`solution-${solution.slug}-jsonld`}
      />

      <header className="solution-detail-hero">
        <div className="solution-detail-hero__copy">
          <div className="breadcrumbs">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/solusi">Cari Solusi</Link>
            <span>/</span>
            <span>{solution.title}</span>
          </div>
          <span className="eyebrow-label">Masalah tanaman</span>
          <h1>{solution.title}</h1>
          <p>{solution.excerpt}</p>
          {taxonomyLinks.length ? (
            <div className="solution-card__chips">
              {taxonomyLinks.map((item) => (
                <Link href={item.href} key={`${solution.slug}-${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="solution-detail-hero__aside">
          <span className="eyebrow-label">Pembacaan awal</span>
          <strong>{solution.symptom_summary}</strong>
          <p>{solution.caution_note}</p>
        </aside>
      </header>

      <div className="solution-detail-grid">
        <div className="rich-content solution-detail-content">
          <section className="solution-detail-section">
            <span className="eyebrow-label">Gejala / masalah</span>
            <h2>Apa yang biasanya user lihat di lapangan</h2>
            <p>{solution.symptom_summary}</p>
          </section>

          <section className="solution-detail-section">
            <span className="eyebrow-label">Kemungkinan penyebab</span>
            <h2>Beberapa penyebab yang paling masuk akal untuk diperiksa lebih dulu</h2>
            <ul className="plain-list">
              {solution.probable_causes.map((item) => (
                <li key={`${solution.slug}-${item}`}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="solution-detail-section">
            <span className="eyebrow-label">Cara verifikasi</span>
            <h2>Urutan cek lapangan sebelum mengambil tindakan</h2>
            <ol className="plain-list">
              {solution.verification_steps.map((item) => (
                <li key={`${solution.slug}-${item}`}>{item}</li>
              ))}
            </ol>
          </section>

          <section className="solution-detail-section">
            <span className="eyebrow-label">Solusi tindakan</span>
            <h2>Langkah awal yang lebih aman sebelum user langsung belanja</h2>
            <ol className="plain-list">
              {solution.action_steps.map((item) => (
                <li key={`${solution.slug}-${item}`}>{item}</li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="solution-detail-sidebar">
          <section className="solution-detail-sidebar__card">
            <span className="eyebrow-label">CTA konsultasi</span>
            <strong>Masih ragu membaca gejalanya sendiri?</strong>
            <p>Bawa konteks masalah ini ke konsultasi toko agar user tidak salah langkah atau salah beli.</p>
            {consultationUrl ? (
              <a className="btn btn-primary" href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi via WhatsApp
              </a>
            ) : (
              <Link className="btn btn-secondary" href="/kontak">
                Hubungi toko
              </Link>
            )}
          </section>

          <section className="solution-detail-sidebar__card">
            <span className="eyebrow-label">Komoditas terkait</span>
            <strong>{primaryCommodity ? "Lanjutkan dari komoditas yang sedang dibudidayakan" : "Jelajahi komoditas"}</strong>
            <p>
              {primaryCommodity
                ? "Masalah ini sering perlu dibaca bersama konteks komoditas agar tindakan dan produk lebih relevan."
                : "Gunakan jalur komoditas untuk mempersempit solusi yang paling dekat dengan konteks user."}
            </p>
            <Link
              className="btn btn-secondary"
              href={primaryCommodity ? `/komoditas/${primaryCommodity}` : "/komoditas"}
            >
              Buka hub komoditas
            </Link>
          </section>

          <section className="solution-detail-sidebar__card">
            <span className="eyebrow-label">Edukasi terkait</span>
            <strong>Butuh konteks yang lebih lengkap sebelum memilih produk?</strong>
            <p>Pindahkan user ke artikel edukasi agar problem-solving tetap terasa meyakinkan, bukan sekadar hard sell.</p>
            <Link className="btn btn-secondary" href="/belajar">
              Masuk ke Belajar
            </Link>
          </section>
        </aside>
      </div>

      {relatedSolutions.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Solusi terkait</span>
              <h2>Masalah lain yang sering berdekatan dengan kasus ini.</h2>
            </div>
            <Link href="/solusi">Lihat semua solusi</Link>
          </div>
          <div className="solution-grid">
            {relatedSolutions.map((item) => (
              <SolutionCard key={item.slug} solution={item} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedArticles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Artikel edukasi terkait</span>
              <h2>Konten yang membantu user memahami kenapa langkahnya seperti ini.</h2>
            </div>
            <Link href="/artikel">Buka artikel</Link>
          </div>
          <div className="article-grid article-grid--editorial">
            {relatedArticles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Produk relevan</span>
              <h2>Produk tampil setelah user punya cukup konteks untuk membandingkan pilihan.</h2>
            </div>
            <Link href="/belanja">Masuk ke Belanja</Link>
          </div>
          <div className="product-grid product-grid--catalog">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedBundles.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bundle terkait</span>
              <h2>Masalah ini sekarang punya jalur bundle yang lebih siap dikonversi.</h2>
              <p>
                Bundle resmi membantu user yang sudah paham masalahnya tetapi masih ingin
                dibantu menyusun langkah belanjanya dengan lebih cepat.
              </p>
            </div>
            <Link href="/belanja/paket">Semua bundle</Link>
          </div>
          <div className="growth-bundle-grid">
            {relatedBundles.map((bundle) => (
              <GrowthBundleCard bundle={bundle} key={bundle.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {relatedCampaigns.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Campaign terkait</span>
              <h2>Landing komersial yang cocok untuk problem ini saat momentumnya sedang tinggi.</h2>
            </div>
            <Link href="/kampanye">Lihat campaign</Link>
          </div>
          <div className="campaign-grid">
            {relatedCampaigns.map((campaign) => (
              <CampaignSpotlightCard campaign={campaign} key={campaign.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
