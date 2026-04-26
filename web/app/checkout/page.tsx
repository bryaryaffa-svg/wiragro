import type { Metadata } from "next";

import { CheckoutForm } from "@/components/checkout-form";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Checkout - Wiragro",
  description:
    "Selesaikan checkout akun Anda di Wiragro dengan aturan pengiriman, pembayaran, dan validasi akun yang lebih jelas.",
  path: "/checkout",
  noIndex: true,
  section: "utility",
});

export default async function CheckoutPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());

  return (
    <section className="page-stack">
      <CheckoutForm store={store} />
    </section>
  );
}
