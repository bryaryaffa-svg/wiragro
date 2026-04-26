import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return <LoadingSkeleton cards={6} eyebrow="Memuat produk" title="Menyiapkan discovery produk berbasis solusi..." />;
}
