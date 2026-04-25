import Link from "next/link";

import { CommodityHubCard } from "@/components/commodity-hub-card";
import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { getAllCommodityHubs } from "@/lib/commodity-content";
import { getLearningHubCards } from "@/lib/hybrid-navigation";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildPageMetadata({
  title: "Komoditas Pertanian",
  description:
    "Hub komoditas Wiragro menghubungkan artikel edukasi, solusi lapangan, produk, dan konsultasi dalam satu konteks tanaman yang lebih jelas.",
  path: "/komoditas",
  canonicalPath: "/komoditas",
  section: "static",
  keywords: ["komoditas pertanian", "hub komoditas", "padi", "cabai", "jagung"],
});

export default function CommodityIndexPage() {
  const commodities = getAllCommodityHubs();

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Komoditas Pertanian",
            description:
              "Pusat komoditas Wiragro untuk menyatukan edukasi, solusi, produk, dan konsultasi per tanaman.",
            path: "/komoditas",
          }),
          buildCollectionJsonLd({
            title: "Hub Komoditas Wiragro",
            description:
              "Kumpulan halaman komoditas untuk membantu pengguna masuk dari tanaman yang sedang dibudidayakan.",
            path: "/komoditas",
            itemUrls: commodities.map((commodity) => `/komoditas/${commodity.slug}`),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Komoditas", path: "/komoditas" },
          ]),
        ]}
        id="commodity-index-jsonld"
      />

      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Komoditas</span>
        <h1>Masuk dari tanaman yang sedang dibudidayakan, bukan dari silo edukasi dan jualan yang terpisah.</h1>
        <p>
          Hub komoditas ini menjadi jembatan praktis antara artikel, solusi, produk, bundle,
          dan konsultasi. User bisa memulai dari konteks tanamnya dulu, lalu bergerak ke langkah
          berikutnya dengan lebih percaya diri.
        </p>
      </div>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pilih komoditas</span>
            <h2>Setiap komoditas punya jalur belajar, solusi, dan belanja yang sedikit berbeda.</h2>
          </div>
          <Link href="/solusi">Lihat semua solusi</Link>
        </div>
        <div className="commodity-hub-grid">
          {commodities.map((commodity) => (
            <CommodityHubCard commodity={commodity} key={commodity.slug} />
          ))}
        </div>
      </section>

      <PathwaySection
        action={{ href: "/belajar", label: "Mulai dari Edukasi" }}
        cards={getLearningHubCards()}
        description="Komoditas hanyalah pintu masuk konteks. Setelah itu, pengguna tetap harus bisa bergerak ke edukasi, solusi, dan belanja tanpa kehilangan arah."
        eyebrow="Ekosistem"
        title="Hub komoditas membantu semua bagian website bertemu dalam satu alur."
      />
    </section>
  );
}
