import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function LearningClusterLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat cluster edukasi"
      title="Menyiapkan artikel terkait, jalur solusi, dan konteks lanjutan..."
    />
  );
}
