import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ArticleDetailLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat panduan"
      title="Menyiapkan artikel, video terkait, dan rekomendasi produk..."
    />
  );
}
