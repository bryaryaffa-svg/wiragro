import type { Metadata } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import { SearchResultTabs } from "@/components/search-result-tabs";
import { SearchSuggestionGroups } from "@/components/search-suggestion-groups";
import { SearchInput } from "@/components/ui/search-input";
import { SectionHeader } from "@/components/ui/section-header";
import {
  searchGlobalContent,
} from "@/lib/global-search";
import { buildWhatsAppConsultationUrl } from "@/lib/homepage-content";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const resolved = await searchParams;
  const search = typeof resolved.q === "string" ? resolved.q.trim() : "";

  return buildCatalogMetadata({
    title: search ? `Hasil pencarian "${search}" - Wiragro` : "Cari di Wiragro",
    description: search
      ? "Temukan solusi, produk, artikel, dan video pertanian dari satu pencarian Wiragro."
      : "Cari solusi, produk, artikel, dan video pertanian dari satu tempat di Wiragro.",
    path: "/cari",
    canonicalPath: "/cari",
    noIndex: Boolean(search),
    keywords: ["cari solusi tanaman", "cari produk pertanian", "cari artikel pertanian", "video pertanian"],
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
  const [results, store] = await Promise.all([
    searchGlobalContent(trimmedSearch, { limitPerGroup: 10 }),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
  ]);
  const consultationHref =
    buildWhatsAppConsultationUrl(store.whatsapp_number, store.name) ?? "/kontak";

  return (
    <section className="page-stack search-page">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: trimmedSearch ? `Hasil pencarian "${trimmedSearch}"` : "Cari di Wiragro",
            description:
              "Pencarian lintas solusi, produk, artikel, dan video pertanian di Wiragro.",
            path: "/cari",
          }),
          buildCollectionJsonLd({
            title: "Hasil pencarian Wiragro",
            description: "Hasil pencarian global Wiragro untuk solusi, produk, artikel, dan video.",
            path: "/cari",
            itemUrls: results.groups.all.slice(0, 8).map((item) => item.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Cari", path: "/cari" },
          ]),
        ]}
        id="search-page-jsonld"
      />

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Global Search</span>
        <h1>
          {trimmedSearch ? `Hasil pencarian untuk "${trimmedSearch}"` : "Cari di Wiragro"}
        </h1>
        <p>
          Temukan solusi, produk, artikel, dan video pertanian dari satu pencarian yang
          lebih dekat dengan masalah lapangan.
        </p>
      </div>

      <div className="search-page__shell">
        <SearchInput
          action="/cari"
          buttonLabel="Cari"
          defaultValue={trimmedSearch}
          inputLabel="Cari produk, tanaman, hama, gejala, atau artikel"
          placeholder="Cari produk, tanaman, hama, gejala, atau artikel..."
          size="large"
        />

        {!trimmedSearch ? <SearchSuggestionGroups /> : null}
      </div>

      {trimmedSearch ? (
        <section className="section-block">
          <SectionHeader
            description="Hasil dibagi menjadi solusi, produk, edukasi, dan video agar user cepat masuk ke pintu yang paling relevan."
            eyebrow="Hasil pencarian"
            title="Masuk ke hasil yang paling relevan lebih dulu."
          />
          <SearchResultTabs consultationHref={consultationHref} results={results} />
        </section>
      ) : null}

      <section className="section-block">
        <SectionHeader
          eyebrow="Langkah berikutnya"
          title="Belum menemukan yang Anda cari?"
          description="Pindah ke jalur berikut jika pencarian masih terlalu umum atau gejalanya belum jelas."
        />
        <div className="search-page__next-grid">
          <article className="panel-card">
            <strong>Buka Solusi</strong>
            <p>Pilih tanaman dan masalah agar rekomendasinya lebih terarah.</p>
            <Link className="btn btn-primary" href="/solusi">
              Buka Solusi
            </Link>
          </article>
          <article className="panel-card">
            <strong>Tanya AI Pertanian</strong>
            <p>Gunakan AI premium untuk arahan awal saat gejalanya masih membingungkan.</p>
            <Link className="btn btn-secondary" href="/ai-chat">
              Tanya AI
            </Link>
          </article>
          <article className="panel-card">
            <strong>Lihat semua produk</strong>
            <p>Masuk ke katalog jika Anda sudah tahu produk atau kategori yang dicari.</p>
            <Link className="btn btn-secondary" href="/produk">
              Jelajahi produk
            </Link>
          </article>
        </div>
      </section>
    </section>
  );
}
