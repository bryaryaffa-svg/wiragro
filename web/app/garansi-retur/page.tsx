import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("garansi-retur", "/garansi-retur", {
    title: "Garansi dan Retur",
    description:
      "Informasi bantuan order, garansi operasional, dan alur retur yang berlaku di website Wiragro.",
  });
}

export default function WarrantyAndReturnPage() {
  return <StaticPageView slug="garansi-retur" />;
}
