import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { ProductCard } from "@/components/product-card";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/section-header";
import { StickyMobileCTA } from "@/components/ui/sticky-mobile-cta";
import { TrustBadge } from "@/components/ui/trust-badge";
import { VideoCard } from "@/components/ui/video-card";
import { trackUiEvent } from "@/lib/analytics";
import type { ArticleSummaryPayload, ProductSummary } from "@/lib/api";
import type {
  SolutionCropOption,
  SolutionData,
  SolutionProblemOption,
  SolutionVideoResource,
} from "@/lib/solution-experience";

type RecommendedProduct = {
  badge: string;
  benefit: string;
  product: ProductSummary;
};

export function SolutionResult({
  aiHref = "/ai-chat",
  articles,
  crop,
  problem,
  products,
  solution,
  videos,
  whatsappHref,
}: {
  aiHref?: string;
  articles: ArticleSummaryPayload[];
  crop: SolutionCropOption;
  problem: SolutionProblemOption;
  products: RecommendedProduct[];
  solution: SolutionData;
  videos: SolutionVideoResource[];
  whatsappHref?: string | null;
}) {
  return (
    <section className="solution-result">
      <div className="solution-result__hero">
        <div className="solution-result__copy">
          <span className="eyebrow-label">State 3</span>
          <h2>{solution.title}</h2>
          <p>
            Hasil ini disusun untuk membantu Anda bergerak dari gejala ke tindakan awal
            yang lebih jelas, lalu turun ke edukasi dan produk yang memang relevan.
          </p>
          <div className="solution-result__chips">
            <span>{crop.label}</span>
            <span>{problem.label}</span>
            <span>Rekomendasi awal</span>
          </div>
        </div>

        <aside className="solution-result__meta">
          <div>
            <span>Fokus sekarang</span>
            <strong>{problem.label}</strong>
          </div>
          <div>
            <span>Tanaman</span>
            <strong>{crop.label}</strong>
          </div>
          <div>
            <span>Output</span>
            <strong>Langkah awal, edukasi, video, dan produk rekomendasi</strong>
          </div>
        </aside>
      </div>

      <div className="solution-result__layout">
        <article className="solution-panel">
          <span className="eyebrow-label">Ringkasan masalah</span>
          <h3>Mulai dari pemahaman yang sederhana</h3>
          {solution.summary.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </article>

        <article className="solution-panel">
          <span className="eyebrow-label">Langkah penanganan</span>
          <h3>Apa yang sebaiknya dilakukan lebih dulu?</h3>
          <ol className="solution-step-list">
            {solution.steps.map((item, index) => (
              <li className="solution-step-card" key={`${problem.id}-${index}`}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
        </article>
      </div>

      <section className="section-block" id="solution-products">
        <SectionHeader
          action={{ href: solution.productBrowseHref, label: "Lihat semua produk" }}
          description="Produk tetap hadir sebagai bagian dari solusi. Prioritas utamanya adalah pilihan yang paling masuk akal untuk masalah ini."
          eyebrow="Produk rekomendasi"
          title="Produk yang bisa dipertimbangkan"
        />
        {products.length ? (
          <div className="product-grid product-grid--catalog">
            {products.map((item) => (
              <ProductCard
                benefitOverride={item.benefit}
                contextBadge={item.badge}
                key={item.product.id}
                product={item.product}
                trackingContext="solution_recommendation"
              />
            ))}
          </div>
        ) : (
          <div className="solution-support-panel">
            <strong>Produk terkait belum tersedia</strong>
            <p>
              Anda tetap bisa melanjutkan ke katalog umum Wiragro atau bertanya ke AI agar
              arahan berikutnya tetap terasa jelas.
            </p>
            <div className="solution-support-panel__actions">
              <PrimaryButton href="/produk">Lihat semua produk</PrimaryButton>
              <SecondaryButton href={aiHref}>Tanya AI</SecondaryButton>
            </div>
          </div>
        )}
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/artikel", label: "Buka edukasi", variant: "secondary" }}
          description="Prioritas video mengikuti studi kasus lapangan, review produk, lalu edukasi umum."
          eyebrow="Video terkait"
          title="Belajar cepat sebelum mengambil keputusan berikutnya"
        />
        {videos.length ? (
          <div className="homepage-video-grid">
            {videos.map((video) => (
              <VideoCard
                category={video.category}
                description={video.description}
                href={video.href}
                key={video.id}
                thumbnail={video.thumbnail}
                title={video.title}
              />
            ))}
          </div>
        ) : (
          <div className="solution-support-panel">
            <strong>Video studi kasus sedang dilengkapi</strong>
            <p>
              Untuk saat ini, Anda tetap bisa belajar dari artikel terkait atau langsung
              masuk ke AI Pertanian Wiragro.
            </p>
          </div>
        )}
      </section>

      <section className="section-block">
        <SectionHeader
          action={{ href: "/artikel", label: "Lihat semua artikel" }}
          description="Artikel ini membantu Anda membaca konteks masalah sebelum membeli produk."
          eyebrow="Artikel terkait"
          title="Panduan yang paling relevan untuk langkah berikutnya"
        />
        {articles.length ? (
          <div className="article-grid article-grid--editorial">
            {articles.map((article) => (
              <ArticleCard article={article} href={`/artikel/${article.slug}`} key={article.slug} />
            ))}
          </div>
        ) : (
          <div className="solution-support-panel">
            <strong>Edukasi khusus belum tersedia</strong>
            <p>
              Saat artikel yang sangat spesifik belum ada, buka kanal edukasi umum atau
              gunakan AI untuk memperjelas kebutuhan tanaman Anda.
            </p>
          </div>
        )}
      </section>

      <section className="solution-ai-panel">
        <div className="solution-ai-panel__copy">
          <div className="homepage-ai-band__badge-row">
            <TrustBadge icon="ai" label="Premium Feature" tone="accent" />
          </div>
          <h3>Butuh analisis lebih detail?</h3>
          <p>
            Gunakan AI Pertanian Wiragro untuk konsultasi lanjutan berdasarkan tanaman,
            masalah, dan langkah yang sudah Anda lihat di halaman ini.
          </p>
        </div>
        <div className="solution-ai-panel__actions">
          <PrimaryButton
            href={aiHref}
            onClick={() =>
              trackUiEvent("ask_ai", {
                crop: crop.label,
                problem: problem.label,
                source: "solution_result",
              })
            }
          >
            Tanya AI
          </PrimaryButton>
          <SecondaryButton href="/artikel">Buka edukasi</SecondaryButton>
        </div>
      </section>

      <section className="solution-support-panel solution-support-panel--cta">
        <div>
          <span className="eyebrow-label">Konsultasi produk</span>
          <h3>Konsultasi produk via WhatsApp</h3>
          <p>
            Saat Anda ingin diskusi cepat, kirim konteks tanaman dan masalah ini ke tim
            Wiragro agar rekomendasinya bisa lebih terarah.
          </p>
        </div>
        <div className="solution-support-panel__actions">
          {whatsappHref ? (
            <a className="btn btn-secondary" href={whatsappHref} rel="noreferrer" target="_blank">
              Konsultasi via WhatsApp
            </a>
          ) : (
            <Link className="btn btn-secondary" href="/kontak">
              Hubungi tim Wiragro
            </Link>
          )}
          <SecondaryButton href={solution.productBrowseHref}>Lihat produk</SecondaryButton>
        </div>
      </section>

      <StickyMobileCTA
        primary={{ href: aiHref, label: "Tanya AI" }}
        secondary={{ href: solution.productBrowseHref, label: "Lihat Produk" }}
      />
    </section>
  );
}
