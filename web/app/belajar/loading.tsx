import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return <LoadingSkeleton cards={4} eyebrow="Memuat jalur edukasi" title="Menyiapkan panduan, studi kasus, dan video pembelajaran..." />;
}
