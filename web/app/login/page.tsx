import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";
import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildUtilityMetadata(
  "Masuk ke Wiragro",
  "Masuk ke Wiragro untuk mengakses akun, wishlist, checkout, dan pesanan Anda.",
  "/login",
  "/masuk",
);

export default function LoginPage() {
  return <AccountPanel />;
}
