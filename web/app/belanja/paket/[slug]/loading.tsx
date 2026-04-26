import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function BundleDetailLoading() {
  return (
    <LoadingSkeleton
      cards={5}
      eyebrow="Memuat detail bundle"
      title="Menyiapkan komposisi paket, edukasi terkait, dan jalur pembelian..."
    />
  );
}
