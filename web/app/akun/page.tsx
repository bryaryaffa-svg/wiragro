import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Akun Customer",
  description: "Login customer Kios Sidomakmur dengan Google atau WhatsApp OTP.",
};

export default function AccountPage() {
  return <AccountPanel />;
}
