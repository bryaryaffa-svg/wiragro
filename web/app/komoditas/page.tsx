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
  title: "Komoditas Pertanian - Wiragro",
  description:
    "Hub komoditas Wiragro menghubungkan edukasi, solusi, dan produk berdasarkan tanaman yang sedang Anda tangani.",
  path: "/komoditas",
  canonicalPath: "/komoditas",
  section: "static",
  keywords: ["komoditas pertanian", "solusi berdasarkan tanaman", "padi", "cabai", "jagung"],
});

export default function CommodityIndexPage() {
  const commodities = getAllCommodityHubs();

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Komoditas Pertanian - Wiragro",
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

      <section className="hub-hero hub-hero--learn">
        <div className="hub-hero__copy">
          <span className="eyebrow-label">Komoditas</span>
          <h1>Masuk dari tanaman yang sedang Anda tangani, lalu lanjut ke solusi dan produk yang lebih tepat.</h1>
          <p>
            Hub komoditas membantu pengguna memulai dari konteks tanaman lebih dulu. Setelah itu,
            mereka bisa bergerak ke edukasi, solusi, bundle, dan produk tanpa terasa meloncat
            antarhalaman yang tidak saling terhubung.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="/solusi">
              Mulai dari solusi
            </Link>
            <Link className="btn btn-secondary" href="/artikel">
              Buka edukasi
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Masuk dari</span>
            <strong>Tanaman yang sedang ditanam, bukan dari nama produk yang belum tentu dikenal</strong>
          </div>
          <div>
            <span>Tujuan</span>
            <strong>Membuat alur belajar, solusi, dan belanja terasa lebih mudah dipahami</strong>
          </div>
          <div>
            <span>Jalur lanjut</span>
            <strong>Setiap komoditas selalu punya pintu ke produk, bundle, dan edukasi terkait</strong>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Pilih komoditas</span>
            <h2>Setiap komoditas punya ritme belajar, masalah, dan kebutuhan produk yang berbeda.</h2>
            <p>
              Gunakan jalur ini saat Anda lebih mudah mengenali tanaman dibanding nama produk atau
              istilah gejala yang spesifik.
            </p>
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
        action={{ href: "/artikel", label: "Mulai dari Edukasi" }}
        cards={getLearningHubCards()}
        description="Hub komoditas menjaga semua bagian website tetap bertemu dalam satu alur: pahami tanaman, cari solusi, lalu ambil keputusan produk yang lebih sehat."
        eyebrow="Ekosistem"
        title="Komoditas adalah pintu masuk konteks, bukan silo baru."
      />
    </section>
  );
}
