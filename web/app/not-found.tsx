import { EmptyState } from "@/components/ui/state";

export default function NotFound() {
  return (
    <EmptyState
      actions={[
        { href: "/", label: "Kembali ke beranda" },
        { href: "/produk", label: "Buka produk", variant: "secondary" },
      ]}
      description="Beberapa halaman lama dari website sebelumnya sudah dipensiunkan. Gunakan navigasi utama atau lanjutkan ke halaman produk untuk menemukan konten dan penawaran terbaru."
      eyebrow="404 / Halaman tidak ditemukan"
      title="Alamat yang Anda buka tidak tersedia di Wiragro."
    />
  );
}
