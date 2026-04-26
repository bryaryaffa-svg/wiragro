import Link from "next/link";

import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { GrowthBundleCard } from "@/components/growth-bundle-card";
import { JsonLd } from "@/components/json-ld";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import {
  buildCommerceIntentCards,
  getAllGrowthBundles,
} from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildCatalogMetadata,
  buildCollectionJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildCatalogMetadata({
  title: "Paket & Bundle Pertanian",
  description:
    "Hub bundle Wiragro untuk kebutuhan mulai tanam, proteksi, komoditas, dan pembelian rutin yang lebih praktis.",
  path: "/belanja/paket",
  canonicalPath: "/belanja/paket",
  keywords: [
    "bundle pertanian",
    "paket pertanian",
    "paket mulai tanam",
    "paket proteksi tanaman",
    "bundle komoditas",
  ],
});

export default async function BundleHubPage() {
  const bundles = getAllGrowthBundles();
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: "/belanja/paket",
    surface: "bundle-hub",
  });

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Paket & Bundle Pertanian",
            description:
              "Hub bundle pertanian Wiragro untuk kebutuhan yang lebih praktis, rapi, dan mudah diulang.",
            path: "/belanja/paket",
          }),
          buildCollectionJsonLd({
            title: "Bundle Pertanian Wiragro",
            description:
              "Kumpulan bundle pertanian untuk mulai tanam, proteksi, komoditas, dan belanja rutin.",
            path: "/belanja/paket",
            itemUrls: bundles.map((bundle) => bundle.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Belanja", path: "/belanja" },
            { name: "Paket", path: "/belanja/paket" },
          ]),
        ]}
        id="bundle-hub-jsonld"
      />

      <section className="hub-hero hub-hero--shop">
        <div className="hub-hero__copy">
          <span className="eyebrow-label">Bundle</span>
          <h1>Paket pertanian yang membantu keputusan belanja terasa lebih ringkas dan lebih terarah.</h1>
          <p>
            Di sini pengguna bisa mulai dari komoditas, fase tanam, atau masalah lapangan, lalu
            turun ke produk, artikel, solusi, dan jalur bantuan lanjutan tanpa harus merakit semuanya
            sendiri dari nol.
          </p>
          <div className="hub-hero__actions">
            <Link className="btn btn-primary" href="#bundle-grid">
              Jelajahi paket
            </Link>
            <Link className="btn btn-secondary" href="/solusi">
              Mulai dari solusi
            </Link>
          </div>
        </div>

        <div className="hub-hero__meta">
          <div>
            <span>Kegunaan</span>
            <strong>Memudahkan pembelian paket, pembelian rutin, dan diskusi kebutuhan volume</strong>
          </div>
          <div>
            <span>Cocok untuk</span>
            <strong>Pemula, pembeli rutin, komoditas intensif, dan toko pertanian</strong>
          </div>
          <div>
            <span>Jalur lanjut</span>
            <strong>Checkout, bantuan WhatsApp, atau inquiry B2B dari paket yang sama</strong>
          </div>
        </div>
      </section>

      <section className="section-block" id="bundle-grid">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Paket aktif</span>
            <h2>Pilih jalur bundle yang paling dekat dengan kebutuhan Anda.</h2>
            <p>
              Bundle membantu pembeli yang ingin jalur lebih ringkas daripada menyusun belanja
              satu-satu dari katalog.
            </p>
          </div>
          <Link href="/produk">Kembali ke halaman produk</Link>
        </div>
        <div className="growth-bundle-grid">
          {bundles.map((bundle) => (
            <GrowthBundleCard bundle={bundle} key={bundle.slug} />
          ))}
        </div>
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan WhatsApp</span>
              <h2>Butuh arahan cepat sebelum memilih paket yang tepat?</h2>
              <p>
                Di halaman bundle, jalur WhatsApp difokuskan untuk membantu memilih paket yang paling
                pas sebelum pengguna turun ke landing bundle yang lebih spesifik.
              </p>
            </div>
            <Link href="/kontak">Kontak tim</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}
    </section>
  );
}
