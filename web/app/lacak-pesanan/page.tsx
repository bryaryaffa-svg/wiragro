import type { Metadata } from "next";

import { OrderTracker } from "@/components/order-tracker";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";
import { buildUtilityMetadata } from "@/lib/seo";

export const metadata: Metadata = buildUtilityMetadata(
  "Lacak pesanan",
  "Cek status pesanan Wiragro menggunakan nomor order dan data pengiriman.",
  "/lacak-pesanan",
);

export default async function TrackOrderPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());

  return <OrderTracker store={store} />;
}
