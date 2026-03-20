import Link from "next/link";
import { notFound } from "next/navigation";

import { getStaticPage } from "@/lib/api";

export async function StaticPageView({ slug }: { slug: string }) {
  const page = await getStaticPage(slug);
  if ("detail" in (page as unknown as { detail?: string })) {
    notFound();
  }

  return (
    <article className="content-shell">
      <div className="page-intro">
        <span className="eyebrow-label">Informasi</span>
        <h1>{page.title}</h1>
        <p>
          {page.excerpt ??
            "Halaman informasi ini ditampilkan dari konten pusat dan dirapikan agar tetap konsisten dengan storefront utama."}
        </p>
      </div>
      <div
        className="rich-content"
        dangerouslySetInnerHTML={{ __html: page.body_html }}
      />
      <div className="content-shell__cta">
        <Link className="btn btn-secondary" href="/">
          Kembali ke beranda
        </Link>
        <Link className="btn btn-primary" href="/produk">
          Lihat katalog
        </Link>
      </div>
    </article>
  );
}
