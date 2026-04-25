import type { Metadata } from "next";
import Link from "next/link";

import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const metadata: Metadata = buildUtilityMetadata(
  "Migrasi situs lama",
  "Informasi migrasi dari URL lama ke platform digital Wiragro yang baru.",
  "/migrasi-situs",
);

export default function SiteMigrationPage() {
  return (
    <section className="empty-state empty-state--404">
      <span className="eyebrow-label">Migrasi platform</span>
      <h1>Halaman WordPress lama sudah dipindahkan ke platform Wiragro.</h1>
      <p>
        URL lama tidak lagi aktif di domain ini. Website sekarang
        berjalan sebagai platform solusi pertanian digital dengan pengalaman yang lebih rapi,
        cepat, dan konsisten.
      </p>
      <div className="empty-state__actions">
        <Link className="btn btn-primary" href="/">
          Buka beranda
        </Link>
        <Link className="btn btn-secondary" href="/produk">
          Jelajahi produk
        </Link>
      </div>
    </section>
  );
}
