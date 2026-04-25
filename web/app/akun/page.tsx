import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";
import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildUtilityMetadata(
  "Akun Wiragro",
  "Halaman akun Wiragro untuk login, menyimpan wishlist, dan mengelola aktivitas belanja Anda.",
  "/akun",
);

export default function AccountPage() {
  return <AccountPanel />;
}
