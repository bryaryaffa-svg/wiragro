import Link from "next/link";

import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "AI Chat Pertanian Premium",
  description:
    "Pendamping AI pertanian premium dari Wiragro untuk membantu membaca gejala, merangkum pilihan tindakan, dan menyiapkan langkah berikutnya.",
  path: "/ai-chat",
  keywords: [
    "ai chat pertanian",
    "ai pertanian premium",
    "asisten pertanian digital",
    "wiragro ai",
  ],
  section: "static",
});

const AI_FEATURES = [
  {
    title: "Baca gejala lebih cepat",
    body: "Mulai dari masalah tanaman, lalu dapatkan arahan awal yang lebih terstruktur sebelum lanjut ke solusi atau produk.",
  },
  {
    title: "Rangkum pilihan tindakan",
    body: "AI membantu menyederhanakan informasi agar keputusan lapangan terasa lebih tenang dan tidak terlalu teknis.",
  },
  {
    title: "Terhubung ke alur Wiragro",
    body: "Setelah mendapat arahan, Anda bisa lanjut ke edukasi, solusi, produk, atau hubungi tim untuk tindak lanjut.",
  },
];

export default function AIChatPage() {
  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "AI Chat Pertanian Premium | Wiragro",
            description:
              "Pendamping AI pertanian premium dari Wiragro untuk membantu membaca gejala, merangkum pilihan tindakan, dan menyiapkan langkah berikutnya.",
            path: "/ai-chat",
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "AI Chat", path: "/ai-chat" },
          ]),
        ]}
        id="ai-chat-page-jsonld"
      />

      <section className="page-intro">
        <span className="eyebrow-label">AI premium</span>
        <h1>AI Chat Pertanian Premium untuk keputusan yang lebih cepat dan tetap mudah dipahami.</h1>
        <p>
          AI Chat Wiragro dirancang sebagai pendamping digital untuk membantu membaca
          gejala, menyusun pertanyaan, dan menyiapkan langkah berikutnya tanpa
          menghilangkan konteks lapangan.
        </p>
        <div className="content-shell__cta">
          <Link className="btn btn-primary" href="/masuk?next=%2Fai-chat">
            Masuk untuk akses
          </Link>
          <Link className="btn btn-secondary" href="/solusi">
            Mulai dari solusi
          </Link>
          <Link className="btn btn-secondary" href="/kontak">
            Hubungi tim Wiragro
          </Link>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Yang disiapkan</span>
            <h2>AI ini dibuat untuk membantu, bukan menggantikan pertimbangan lapangan.</h2>
            <p>
              Fokus utamanya adalah merapikan proses tanya jawab, mempercepat pemetaan
              masalah, dan membantu pengguna melanjutkan ke jalur yang tepat.
            </p>
          </div>
        </div>

        <div className="homepage-trust-grid">
          {AI_FEATURES.map((item) => (
            <article className="homepage-trust-card" key={item.title}>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <span className="eyebrow-label">Akses bertahap</span>
        <h2>Fitur ini sedang dibuka bertahap untuk pengalaman premium.</h2>
        <p>
          Halaman ini sengaja tampil publik agar arah produknya jelas. Jika akses penuh
          belum tersedia untuk akun Anda, gunakan jalur solusi, edukasi, atau kontak
          resmi sambil menunggu pembukaan akses berikutnya.
        </p>
      </section>
    </section>
  );
}
