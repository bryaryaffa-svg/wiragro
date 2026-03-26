import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";

export const metadata: Metadata = {
  title: "Login Customer",
  description: "Masuk ke website Kios Sidomakmur dengan Google atau WhatsApp OTP.",
};

export default function LoginPage() {
  return <AccountPanel />;
}
