import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("syarat-dan-ketentuan", "/syarat-dan-ketentuan", {
    title: "Syarat dan Ketentuan Wiragro",
    description: "Syarat dan ketentuan penggunaan website, layanan, dan transaksi di Wiragro.",
  });
}

export default function TermsPage() {
  return <StaticPageView slug="syarat-dan-ketentuan" />;
}
