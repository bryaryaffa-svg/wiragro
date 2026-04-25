import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("kebijakan-privasi", "/kebijakan-privasi", {
    title: "Kebijakan Privasi Wiragro",
    description: "Kebijakan privasi Wiragro terkait data pengguna, layanan, dan aktivitas belanja.",
  });
}

export default function PrivacyPage() {
  return <StaticPageView slug="kebijakan-privasi" />;
}
