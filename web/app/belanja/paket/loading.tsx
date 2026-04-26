import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function BundleHubLoading() {
  return (
    <LoadingSkeleton
      cards={4}
      eyebrow="Memuat bundle"
      title="Menyiapkan paket pilihan dan jalur belanja yang lebih ringkas..."
    />
  );
}
