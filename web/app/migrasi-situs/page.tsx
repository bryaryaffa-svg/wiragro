import type { Metadata } from "next";
import Link from "next/link";

import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-static";
export const metadata: Metadata = buildUtilityMetadata(
  "Migrasi situs lama",
  "Informasi migrasi dari URL lama ke storefront Wiragro yang baru.",
  "/migrasi-situs",
);

export default function SiteMigrationPage() {
  return (
    <section className="empty-state empty-state--404">
      <span className="eyebrow-label">Migrasi platform</span>
      <h1>Halaman WordPress lama sudah dipindahkan ke storefront baru.</h1>
      <p>
        Route admin atau URL WordPress lama tidak lagi aktif di domain ini. Website sekarang
        berjalan di platform Next.js baru untuk pengalaman belanja yang lebih rapi, cepat,
        dan konsisten.
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
