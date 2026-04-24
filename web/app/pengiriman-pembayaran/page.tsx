import type { Metadata } from "next";

import { StaticPageView } from "@/components/static-page-view";
import { generateStaticPageMetadata } from "@/lib/static-page-metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return generateStaticPageMetadata("pengiriman-pembayaran", "/pengiriman-pembayaran", {
    title: "Pengiriman dan Pembayaran",
    description:
      "Informasi pengiriman, pickup, dan metode pembayaran yang berlaku di website Wiragro.",
  });
}

export default function ShippingAndPaymentPage() {
  return <StaticPageView slug="pengiriman-pembayaran" />;
}
