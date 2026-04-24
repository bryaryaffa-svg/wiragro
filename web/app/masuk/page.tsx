import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";
import { buildUtilityMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildUtilityMetadata(
  "Masuk ke akun",
  "Masuk ke akun Wiragro dengan Google atau WhatsApp OTP.",
  "/masuk",
);

export default function SignInPage() {
  return <AccountPanel />;
}
