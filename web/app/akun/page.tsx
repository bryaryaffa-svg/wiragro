import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = {
  title: "Akun Customer",
  description: "Login Google demo dan WhatsApp OTP untuk customer Kios Sidomakmur.",
};

export default function AccountPage() {
  return <AccountPanel />;
}
