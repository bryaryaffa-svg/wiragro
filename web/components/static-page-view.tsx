import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/json-ld";
import { PathwaySection } from "@/components/pathway-section";
import { getStaticRelationCards } from "@/lib/hybrid-navigation";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo";
import { getStaticPageCached } from "@/lib/static-page-metadata";

function resolveStaticPagePath(slug: string) {
  return slug === "home" ? "/" : `/${slug}`;
}

export async function StaticPageView({ slug }: { slug: string }) {
  const page = await getStaticPageCached(slug).catch(() => null);

  if (!page) {
    notFound();
  }

  const path = resolveStaticPagePath(slug);

  return (
    <article className="content-shell">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: page.title,
            description: page.excerpt,
            path,
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: page.title, path },
          ]),
        ]}
        id={`static-page-jsonld-${slug}`}
      />
      <div className="page-intro">
        <span className="eyebrow-label">Informasi</span>
        <h1>{page.title}</h1>
        <p>
          {page.excerpt ??
            "Halaman informasi ini membantu Anda memahami layanan utama Wiragro dengan bahasa yang lebih ringkas dan jelas."}
        </p>
      </div>
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: page.body_html }}
      />
      <PathwaySection
        cards={getStaticRelationCards(page.title)}
        className="pathway-section--content"
        description="Halaman statis tetap perlu memberi jalan ke tiga mode utama agar discoverability tidak berhenti di informasi umum."
        eyebrow="Jalur lanjut"
        title="Bantu user pindah ke mode yang tepat setelah membaca halaman ini."
      />
      <div className="content-shell__cta">
        <Link className="btn btn-secondary" href="/">
          Kembali ke beranda
        </Link>
        <Link className="btn btn-primary" href="/produk">
          Jelajahi produk
        </Link>
        <Link className="btn btn-secondary" href="/belajar">
          Masuk ke Edukasi
        </Link>
      </div>
    </article>
  );
}
