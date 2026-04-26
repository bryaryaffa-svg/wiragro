import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function SolutionClusterLoading() {
  return (
    <LoadingSkeleton
      cards={5}
      eyebrow="Memuat detail cluster solusi"
      title="Menyiapkan halaman solusi, edukasi terkait, dan produk pendukung..."
    />
  );
}
