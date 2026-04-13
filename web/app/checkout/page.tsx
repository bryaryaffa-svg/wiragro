import { CheckoutForm } from "@/components/checkout-form";
import { getFallbackStoreProfile, getStoreProfile } from "@/lib/api";

export default async function CheckoutPage() {
  const store = await getStoreProfile().catch(() => getFallbackStoreProfile());

  return <CheckoutForm store={store} />;
}
