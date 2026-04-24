"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";

type BundleCartLine = {
  productId: string;
  qty: number;
};

export function BundlePurchaseActions({
  bundleTitle,
  items,
  disabledReason,
}: {
  bundleTitle: string;
  items: BundleCartLine[];
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const { addItems, isBusy } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isDisabled = isBusy || isPending || !items.length || Boolean(disabledReason);

  function handleAction(mode: "stay" | "cart") {
    startTransition(async () => {
      try {
        await addItems(items);
        setMessage(
          mode === "cart"
            ? `${bundleTitle} dimasukkan ke keranjang.`
            : `${bundleTitle} berhasil ditambahkan ke keranjang.`,
        );

        if (mode === "cart") {
          router.push("/keranjang");
        }
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Bundle belum berhasil dimasukkan ke keranjang.",
        );
      }
    });
  }

  return (
    <div className="bundle-purchase-actions">
      <div className="bundle-purchase-actions__buttons">
        <button
          className="btn btn-primary"
          disabled={isDisabled}
          onClick={() => handleAction("stay")}
          type="button"
        >
          {isPending ? "Menambahkan..." : "Tambah bundle ke keranjang"}
        </button>
        <button
          className="btn btn-secondary"
          disabled={isDisabled}
          onClick={() => handleAction("cart")}
          type="button"
        >
          {isPending ? "Menyiapkan..." : "Tambah semua item"}
        </button>
      </div>
      {disabledReason ? <p className="bundle-purchase-actions__note">{disabledReason}</p> : null}
      {message ? (
        <span aria-live="polite" className="inline-note">
          {message}
        </span>
      ) : null}
    </div>
  );
}
