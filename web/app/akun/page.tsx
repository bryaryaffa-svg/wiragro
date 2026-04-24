import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";
import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildUtilityMetadata(
  "Akun Customer",
  "Halaman akun customer Wiragro untuk login dan mengelola akses belanja.",
  "/akun",
);

export default function AccountPage() {
  return <AccountPanel />;
}
