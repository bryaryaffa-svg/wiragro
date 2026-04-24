import type { Metadata } from "next";

import Link from "next/link";

import { CheckoutForm } from "@/components/checkout-form";
import { CommerceIntentGrid } from "@/components/commerce-intent-grid";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { buildCommerceIntentCards } from "@/lib/growth-commerce";
import { buildUtilityMetadata } from "@/lib/seo";

export const metadata: Metadata = buildUtilityMetadata(
  "Checkout",
  "Halaman checkout Wiragro untuk memilih pengiriman, pembayaran, dan menyelesaikan pesanan.",
  "/checkout",
);

export default async function CheckoutPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());
  const checkoutIntentCards = buildCommerceIntentCards({
    phone: store.whatsapp_number,
    storeName: store.name,
    includeCheckoutFollowUp: true,
    checkoutLabel: "checkout pesanan",
  }).filter((item) => item.title === "Follow-up checkout" || item.title === "Konsultasi cepat");

  return (
    <section className="page-stack">
      <CheckoutForm store={store} />
      {checkoutIntentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Checkout assist</span>
              <h2>Butuh bantuan sebelum order benar-benar dikirim?</h2>
              <p>
                Jika Anda sudah masuk ke checkout tetapi masih ragu soal stok, ongkir, atau
                metode pembayaran, lanjutkan lewat bantuan cepat tanpa keluar dari flow.
              </p>
            </div>
            <Link href="/pengiriman-pembayaran">Info pengiriman</Link>
          </div>
          <CommerceIntentGrid items={checkoutIntentCards} />
        </section>
      ) : null}
    </section>
  );
}
