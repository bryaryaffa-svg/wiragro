import type { Metadata } from "next";
import Link from "next/link";

import { CropSelector } from "@/components/crop-selector";
import { JsonLd } from "@/components/json-ld";
import { ProblemSelector } from "@/components/problem-selector";
import { SolutionResult } from "@/components/solution-result";
import { FilterChip } from "@/components/ui/filter-chip";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";
import { StepWizard } from "@/components/ui/step-wizard";
import { getArticles, getFallbackProductList, getProducts, getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import {
  buildSolutionData,
  buildSolutionHref,
  buildSolutionResetHref,
  buildSolutionWhatsAppUrl,
  getRecommendedProductsForSolution,
  getSolutionArticles,
  getSolutionCropOptions,
  getSolutionProblemOptions,
  getSolutionVideos,
  resolveSolutionSelection,
} from "@/lib/solution-experience";
import {
  buildBreadcrumbJsonLd,
  buildPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
type PopularSymptom = {
  label: string;
  problemId: ReturnType<typeof getSolutionProblemOptions>[number]["id"];
};

const POPULAR_SYMPTOMS: PopularSymptom[] = [
  { label: "Daun kuning", problemId: "daun-kuning" },
  { label: "Daun keriting", problemId: "hama" },
  { label: "Hama", problemId: "hama" },
  { label: "Jamur", problemId: "bercak-daun" },
  { label: "Busuk buah", problemId: "buah-rontok" },
  { label: "Pertumbuhan lambat", problemId: "pertumbuhan-lambat" },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Solusi Masalah Tanaman - Wiragro",
  description:
    "Pilih tanaman dan masalah untuk mendapatkan rekomendasi solusi, edukasi, dan produk pertanian dari Wiragro.",
  path: "/solusi",
  section: "static",
  keywords: [
    "solusi masalah tanaman",
    "pilih tanaman",
    "rekomendasi produk pertanian",
    "edukasi pertanian",
    "masalah tanaman",
  ],
});

export default async function SolusiPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const selection = resolveSolutionSelection(resolved);
  const cropOptions = getSolutionCropOptions();
  const problemOptions = getSolutionProblemOptions();
  const selectedCrop = cropOptions.find((item) => item.id === selection.cropId) ?? null;
  const selectedProblem = problemOptions.find((item) => item.id === selection.problemId) ?? null;
  const solution =
    selectedCrop && selectedProblem
      ? buildSolutionData(selectedCrop.id, selectedProblem.id)
      : null;

  const [productsResult, articlesResult, store] = await Promise.all([
    getProducts({ page_size: 48, sort: "best_seller" }).catch(() =>
      getFallbackProductList({ page_size: 48, sort: "best_seller" }),
    ),
    getArticles({ page_size: 18 }).catch(() => ({
      items: [],
      pagination: { page: 1, page_size: 18, count: 0 },
    })),
    getStoreProfile().catch(() => getFallbackStoreProfile()),
  ]);

  const recommendedProducts =
    solution && selectedCrop && selectedProblem
      ? getRecommendedProductsForSolution(productsResult.items, selectedCrop.id, selectedProblem.id, 4)
      : [];
  const relatedArticles =
    selectedCrop && selectedProblem
      ? getSolutionArticles(selectedCrop.id, selectedProblem.id, articlesResult.items)
      : [];
  const relatedVideos =
    selectedCrop && selectedProblem
      ? getSolutionVideos(selectedCrop.id, selectedProblem.id)
      : [];
  const whatsappHref =
    selectedCrop && selectedProblem
      ? buildSolutionWhatsAppUrl(store.whatsapp_number, store.name, selectedCrop.id, selectedProblem.id)
      : null;
  const aiHref =
    selectedCrop && selectedProblem
      ? `/ai-chat?crop=${selectedCrop.id}&problem=${selectedProblem.id}`
      : "/ai-chat";
  const backHref = selectedCrop && selectedProblem ? buildSolutionHref(selectedCrop.id) : buildSolutionResetHref();
  const cropCards = cropOptions.map((item) => ({
    ...item,
    href: buildSolutionHref(item.id, selection.problemId),
    selected: item.id === selectedCrop?.id,
  }));
  const problemCards = problemOptions.map((item) => ({
    ...item,
    href: buildSolutionHref(selectedCrop?.id ?? null, item.id),
    selected: item.id === selectedProblem?.id,
  }));

  return (
    <section className="page-stack">
      <JsonLd
        data={[
          buildWebPageJsonLd({
            title: "Solusi Masalah Tanaman - Wiragro",
            description:
              "Pilih tanaman dan masalah untuk mendapatkan rekomendasi solusi, edukasi, dan produk pertanian dari Wiragro.",
            path: "/solusi",
          }),
          buildBreadcrumbJsonLd([
            { name: "Beranda", path: "/" },
            { name: "Solusi", path: "/solusi" },
          ]),
        ]}
        id="solution-experience-jsonld"
      />

      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <span>Solusi</span>
      </div>

      <section className="solution-experience-hero">
        <div className="solution-experience-hero__copy">
          <span className="eyebrow-label">Core experience Wiragro</span>
          <h1>Cari Solusi Tanaman</h1>
          <p>
            Pilih tanaman dan masalah yang terlihat di lapangan. Wiragro bantu
            arahkan ke edukasi dan produk yang relevan.
          </p>
          <p className="solution-experience-hero__disclaimer">
            Arahan ini bersifat panduan awal. Kondisi lapangan bisa berbeda.
          </p>
          <div className="solution-experience-hero__actions">
            <PrimaryButton href={selectedCrop ? "#wizard-solusi" : buildSolutionHref("cabai")}>
              Mulai Langkah 1
            </PrimaryButton>
            {solution ? <SecondaryButton href="#hasil-solusi">Lihat rekomendasi</SecondaryButton> : null}
          </div>
        </div>

        <div className="solution-flow-map" aria-label="Alur Cari Solusi Tanaman">
          <div className={`solution-flow-card${selectedCrop ? " is-complete" : " is-current"}`}>
            <span>Langkah 1</span>
            <strong>Pilih tanaman</strong>
            <p>{selectedCrop ? selectedCrop.label : "Mulai dari komoditas yang sedang ditangani."}</p>
          </div>
          <div className={`solution-flow-card${selectedCrop ? (selectedProblem ? " is-complete" : " is-current") : ""}`}>
            <span>Langkah 2</span>
            <strong>Pilih masalah/gejala</strong>
            <p>{selectedProblem ? selectedProblem.label : "Cocokkan dengan kondisi yang terlihat di lapangan."}</p>
          </div>
          <div className={`solution-flow-card${solution ? " is-current" : ""}`}>
            <span>Langkah 3</span>
            <strong>Lihat rekomendasi</strong>
            <p>Masuk ke penyebab, langkah awal, produk, dan artikel terkait.</p>
          </div>
        </div>
      </section>

      <section className="solution-wizard-shell" id="wizard-solusi">
        <StepWizard
          steps={[
            {
              description: selectedCrop ? selectedCrop.label : "Pilih komoditas yang sedang Anda tangani.",
              label: "Langkah 1: Pilih tanaman",
              status: selectedCrop ? "complete" : "current",
            },
            {
              description: selectedProblem ? selectedProblem.label : "Pilih gejala atau masalah utama.",
              label: "Langkah 2: Pilih masalah/gejala",
              status: selectedCrop ? (selectedProblem ? "complete" : "current") : "upcoming",
            },
            {
              description: solution ? "Rekomendasi solusi, edukasi, video, dan produk." : "Hasil akan muncul setelah pilihan lengkap.",
              label: "Langkah 3: Lihat rekomendasi",
              status: solution ? "current" : "upcoming",
            },
          ]}
        />

        <div className="solution-popular-symptoms">
          <div>
            <span className="eyebrow-label">Gejala populer</span>
            <strong>Pilih gejala yang paling dekat dengan kondisi tanaman.</strong>
          </div>
          <div className="solution-popular-symptoms__chips" aria-label="Gejala populer">
            {POPULAR_SYMPTOMS.map((item) => (
              <FilterChip
                active={selectedProblem?.id === item.problemId && item.label === selectedProblem.label}
                href={buildSolutionHref(selectedCrop?.id ?? null, item.problemId)}
                key={item.label}
              >
                {item.label}
              </FilterChip>
            ))}
          </div>
        </div>

        {(selectedCrop || selectedProblem) ? (
          <div className="solution-wizard-toolbar">
            <div className="solution-wizard-toolbar__chips">
              {selectedCrop ? <FilterChip active href={buildSolutionHref(selectedCrop.id)}>{selectedCrop.label}</FilterChip> : null}
              {selectedProblem ? (
                <FilterChip active href={buildSolutionHref(selectedCrop?.id ?? null, selectedProblem.id)}>
                  {selectedProblem.label}
                </FilterChip>
              ) : null}
            </div>
            <div className="solution-wizard-toolbar__actions">
              <SecondaryButton href={backHref}>Kembali</SecondaryButton>
              <SecondaryButton href={buildSolutionResetHref()}>Reset pilihan</SecondaryButton>
            </div>
          </div>
        ) : null}

        {!selectedCrop ? <CropSelector items={cropCards} /> : null}
        {selectedCrop && !selectedProblem ? <ProblemSelector items={problemCards} /> : null}

        <div id="hasil-solusi">
          {solution && selectedCrop && selectedProblem ? (
            <SolutionResult
              aiHref={aiHref}
              articles={relatedArticles}
              crop={selectedCrop}
              problem={selectedProblem}
              products={recommendedProducts}
              solution={solution}
              videos={relatedVideos}
              whatsappHref={whatsappHref}
            />
          ) : null}
        </div>
      </section>
    </section>
  );
}
