import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/cart-page-client";
import { buildUtilityMetadata } from "@/lib/seo";

export const metadata: Metadata = buildUtilityMetadata(
  "Keranjang belanja",
  "Keranjang belanja customer Wiragro sebelum lanjut checkout.",
  "/keranjang",
);

export default function CartPage() {
  return <CartPageClient />;
}
