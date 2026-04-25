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
    sourcePath: "/checkout",
    surface: "checkout",
    checkoutLabel: "checkout pesanan",
  });

  return (
    <section className="page-stack">
      <CheckoutForm store={store} />
      {checkoutIntentCards.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Bantuan checkout</span>
              <h2>Butuh bantuan sebelum order benar-benar dikirim?</h2>
              <p>
                Halaman checkout hanya menampilkan satu jalur bantuan WhatsApp yang paling
                relevan agar tim layanan segera memahami bahwa Anda sudah berada di tahap akhir
                penyelesaian pesanan.
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
