import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";
import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildUtilityMetadata(
  "Login Customer",
  "Masuk ke akun Wiragro dengan Google atau WhatsApp OTP.",
  "/login",
  "/masuk",
);

export default function LoginPage() {
  return <AccountPanel />;
}
