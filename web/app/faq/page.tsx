import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("faq", "/faq", {
    title: "FAQ Wiragro",
    description: "Pertanyaan umum tentang belanja, layanan, dan penggunaan storefront pertanian Wiragro.",
  });
}

export default function FaqPage() {
  return <StaticPageView slug="faq" />;
}
