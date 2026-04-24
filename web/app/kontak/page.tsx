import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("kontak", "/kontak", {
    title: "Kontak Wiragro",
    description: "Hubungi Wiragro dan Kios Sidomakmur untuk informasi toko, alamat, dan layanan.",
  });
}

export default function ContactPage() {
  return <StaticPageView slug="kontak" />;
}
