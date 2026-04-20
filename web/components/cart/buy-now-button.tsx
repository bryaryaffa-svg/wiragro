"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";

export function BuyNowButton({
  productId,
  label = "Beli sekarang",
  qty = 1,
  buttonClassName,
  disabled = false,
  disabledLabel = "Stok habis",
}: {
  productId: string;
  label?: string;
  qty?: number;
  buttonClassName?: string;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="inline-action-stack">
      <button
        className={buttonClassName ?? "btn btn-secondary"}
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await addItem(productId, qty);
              router.push("/checkout");
            } catch {
              setMessage("Gagal membuka checkout");
            }
          });
        }}
        type="button"
      >
        {disabled ? disabledLabel : isPending ? "Menyiapkan..." : label}
      </button>
      {message ? (
        <span aria-live="polite" className="inline-note">
          {message}
        </span>
      ) : null}
    </div>
  );
}
