import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function SolutionDetailLoading() {
  return (
    <LoadingSkeleton
      cards={5}
      eyebrow="Memuat solusi masalah"
      title="Menyiapkan langkah penanganan, edukasi terkait, dan rekomendasi produk..."
    />
  );
}
