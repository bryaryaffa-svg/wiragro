import type { Metadata } from "next";

import { WishlistPageClient } from "@/components/wishlist-page-client";
import { buildUtilityMetadata } from "@/lib/seo";

export const metadata: Metadata = buildUtilityMetadata(
  "Wishlist",
  "Daftar produk favorit customer di Wiragro.",
  "/wishlist",
);

export default function WishlistPage() {
  return <WishlistPageClient />;
}
