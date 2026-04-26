import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return <LoadingSkeleton cards={4} eyebrow="Memuat komoditas" title="Menyiapkan jalur komoditas yang terhubung ke solusi, edukasi, dan produk..." />;
}
