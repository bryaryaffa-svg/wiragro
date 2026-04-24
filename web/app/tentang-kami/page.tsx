import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("tentang-kami", "/tentang-kami", {
    title: "Tentang Wiragro",
    description: "Profil Wiragro dan Kios Sidomakmur sebagai storefront pertanian modern.",
  });
}

export default function AboutPage() {
  return <StaticPageView slug="tentang-kami" />;
}
