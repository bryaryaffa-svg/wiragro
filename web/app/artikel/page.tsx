import { ArticleCard } from "@/components/article-card";
import { getArticles } from "@/lib/api";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const query = typeof resolved.q === "string" ? resolved.q : undefined;
  const articles = await getArticles({ q: query, page_size: 9 });
  const editorialPillars = [
    {
      title: "Pemupukan & Nutrisi",
      body: "Panduan memilih pupuk, nutrisi, dan pendekatan aplikasi yang lebih relevan dengan kebutuhan lapangan.",
    },
    {
      title: "Benih & Input Dasar",
      body: "Materi dasar untuk membantu user membandingkan pilihan input sebelum membeli dari katalog.",
    },
    {
      title: "Belanja Toko yang Efisien",
      body: "Tips menyusun ritme belanja kebutuhan kios dan pertanian agar pembelian terasa lebih terarah.",
    },
  ];

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Edukasi / Insight</span>
        <h1>Ruang edukasi yang terhubung langsung dengan keputusan belanja.</h1>
        <p>
          Halaman ini dirancang sebagai pendamping katalog: user bisa memahami konteks,
          membandingkan pilihan, lalu kembali ke produk dengan rasa yang lebih yakin.
        </p>
      </div>

      <form action="/artikel" className="filter-form filter-form--inline">
        <input
          defaultValue={query}
          name="q"
          placeholder="Cari panduan pupuk, benih, stok toko, atau topik lapangan..."
        />
        <button className="btn btn-primary" type="submit">
          Cari
        </button>
      </form>

      <section className="feature-grid feature-grid--paths">
        {editorialPillars.map((pillar) => (
          <article className="feature-card feature-card--path" key={pillar.title}>
            <span className="eyebrow-label">Pilar edukasi</span>
            <strong>{pillar.title}</strong>
            <p>{pillar.body}</p>
          </article>
        ))}
      </section>

      {articles.items.length ? (
        <div className="article-grid article-grid--editorial">
          {articles.items.map((article) => (
            <ArticleCard article={article} key={article.slug} />
          ))}
        </div>
      ) : (
        <article className="empty-state">
          <span className="eyebrow-label">Konten belum tersedia</span>
          <h2>Ruang edukasi siap dipakai, tetapi artikel dari SiGe Manager belum dipublikasikan.</h2>
          <p>
            Struktur UX-nya sudah disiapkan agar storefront Sidomakmur bisa berjalan seperti
            pusat produk sekaligus edukasi. Begitu artikel tersedia, konten akan langsung
            mengisi area ini.
          </p>
        </article>
      )}
    </section>
  );
}
