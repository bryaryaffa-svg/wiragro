import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return <LoadingSkeleton cards={5} eyebrow="Memuat pencarian" title="Menyiapkan hasil pencarian solusi, produk, artikel, dan video..." />;
}
