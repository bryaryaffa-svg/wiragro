import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function SolutionTaxonomyLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat cluster solusi"
      title="Menyiapkan jalur solusi berdasarkan konteks yang Anda pilih..."
    />
  );
}
