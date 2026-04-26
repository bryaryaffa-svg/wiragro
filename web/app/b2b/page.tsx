import Link from "next/link";

import { B2BInquiryForm } from "@/components/b2b-inquiry-form";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { JsonLd } from "@/components/json-ld";
import { ProofSignalGrid } from "@/components/proof-signal-grid";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import {
  B2B_OFFERS,
  buildCommerceIntentCards,
  getFeaturedGrowthBundles,
} from "@/lib/growth-commerce";
import {
  buildBreadcrumbJsonLd,
  buildCollectionJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = buildPageMetadata({
  title: "Kebutuhan Bisnis Pertanian - Wiragro",
  description:
    "Jalur kebutuhan bisnis Wiragro untuk toko pertanian, kebun, proyek, dan pembelian rutin yang ingin dibahas lebih terarah.",
  path: "/b2b",
  canonicalPath: "/b2b",
  section: "static",
  keywords: [
    "b2b pertanian",
    "pembelian volume pertanian",
    "toko pertanian",
    "pembelian volume besar",
    "kebutuhan bisnis pertanian",
  ],
});

export default async function B2BPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const featuredBundles = getFeaturedGrowthBundles(3);
  const intentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    sourcePath: "/b2b",
    surface: "b2b",
  });

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Kebutuhan Bisnis Pertanian - Wiragro",
            description:
              "Jalur B2B untuk kebutuhan volume besar, pembelian rutin, dan kebutuhan pertanian yang perlu dibahas lebih lanjut.",
            path: "/b2b",
          }),
          buildCollectionJsonLd({
            title: "Kebutuhan Bisnis Wiragro",
            description:
              "Entry point untuk kebutuhan toko pertanian, pembelian rutin, dan proyek pertanian.",
            path: "/b2b",
            itemUrls: featuredBundles.map((bundle) => bundle.href),
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "B2B", path: "/b2b" },
          ]),
        ]}
        id="b2b-page-jsonld"
      />

      <section className="bundle-hero bundle-hero--b2b">
        <div className="bundle-hero__copy">
          <span className="eyebrow-label">B2B</span>
          <h1>Jalur kebutuhan bisnis untuk pembelian volume besar dan kebutuhan rutin yang butuh penanganan lebih rapi.</h1>
          <p>
            Halaman ini membantu mengirim inquiry, menyimpan konteks kebutuhan, dan memudahkan
            tindak lanjut penawaran tanpa memecah pengalaman utama Wiragro.
          </p>
          <div className="bundle-hero__actions">
            <Link className="btn btn-primary" href="/belanja/paket">
              Lihat paket yang bisa diajukan
            </Link>
            <Link className="btn btn-secondary" href="/produk">
              Jelajahi produk
            </Link>
          </div>
        </div>

        <aside className="bundle-hero__aside">
          <span className="eyebrow-label">Kapan dipakai</span>
          <strong>Toko pertanian, proyek kebun, atau kebutuhan rutin yang terlalu berat jika disusun manual dari katalog.</strong>
          <p>
            Gunakan halaman ini saat kebutuhan sudah mulai menyentuh volume, ritme pembelian,
            atau kombinasi item yang lebih nyaman dibahas bersama tim Wiragro.
          </p>
        </aside>
      </section>

      <section className="section-block">
        <B2BInquiryForm
          description="Isi kebutuhan utama, item yang ingin dibahas, dan ritme pembeliannya. Jika login, status inquiry dan estimasi kebutuhan akan muncul lagi di akun Anda."
          heading="Kirim kebutuhan B2B dan pantau perkembangannya dari akun Anda."
          sourcePage="/b2b"
          submitLabel="Kirim inquiry & minta penawaran"
        />
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Use case</span>
            <h2>Skenario B2B yang paling realistis untuk diaktifkan sekarang.</h2>
          </div>
        </div>
        <ProofSignalGrid items={B2B_OFFERS.map((offer) => ({
          title: offer.title,
          body: `${offer.description} Fokus pembahasannya: ${offer.bullets.join(", ")}.`,
        }))} />
      </section>

      {intentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">WhatsApp B2B</span>
              <h2>Lanjutkan inquiry lewat jalur WhatsApp yang memang khusus B2B.</h2>
              <p>
                CTA WhatsApp di halaman ini dikhususkan untuk kebutuhan toko pertanian, proyek,
                dan pembelian rutin agar percakapannya tidak bercampur dengan intent retail umum.
              </p>
            </div>
            <Link href="/kontak">Kontak tim</Link>
          </div>
          <CommerceIntentGrid items={intentCards} />
        </section>
      ) : null}

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Bundle untuk inquiry</span>
            <h2>Mulai percakapan B2B dari paket yang paling mudah dipahami dulu.</h2>
          </div>
          <Link href="/belanja/paket">Semua paket</Link>
        </div>
        <div className="growth-bundle-grid">
          {featuredBundles.map((bundle) => (
            <article className="growth-bundle-card" key={bundle.slug}>
              <span className="eyebrow-label">Bundle siap ajukan</span>
              <strong>{bundle.title}</strong>
              <p>{bundle.description}</p>
              <div className="growth-bundle-card__links">
                {bundle.relatedCommoditySlugs.map((slug) => (
                  <Link href={`/komoditas/${slug}`} key={`${bundle.slug}-${slug}`}>
                    {slug.replace(/-/g, " ")}
                  </Link>
                ))}
              </div>
              <Link className="growth-bundle-card__action" href={bundle.href}>
                Buka landing bundle
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
