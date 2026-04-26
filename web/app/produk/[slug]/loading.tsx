import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function ProductDetailLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat detail produk"
      title="Menyiapkan produk, edukasi terkait, dan rekomendasi pelengkap..."
    />
  );
}
