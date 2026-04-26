import { LoadingSkeleton } from "@/components/ui/loading-skeleton";

export default function Loading() {
  return (
    <LoadingSkeleton
      cards={2}
      eyebrow="Menyiapkan AI Pertanian"
      title="Menyiapkan halaman AI premium Wiragro..."
    />
  );
}
