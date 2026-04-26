import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function LearningTaxonomyLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat jalur edukasi"
      title="Menyiapkan cluster edukasi berdasarkan topik yang Anda pilih..."
    />
  );
}
