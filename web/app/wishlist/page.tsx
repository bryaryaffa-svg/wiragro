import type { Metadata } from "next";

import { WishlistPageClient } from "@/components/wishlist-page-client";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Daftar produk favorit customer di Kios Sidomakmur.",
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
