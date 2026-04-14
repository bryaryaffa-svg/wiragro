import type { Metadata } from "next";

import { AccountPanel } from "@/components/account-panel";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Masuk Customer",
  description: "Masuk ke website Kios Sidomakmur dengan Google atau WhatsApp OTP.",
};

export default function SignInPage() {
  return <AccountPanel />;
}
