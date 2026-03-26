"use client";

import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({
  productId,
  label = "Tambah ke Keranjang",
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
  const { addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="inline-action-stack">
      <button
        className={buttonClassName ?? "btn btn-primary"}
        disabled={disabled || isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await addItem(productId, qty);
              setMessage("Masuk ke keranjang");
            } catch {
              setMessage("Gagal menambah produk");
            }
          });
        }}
        type="button"
      >
        {disabled ? disabledLabel : isPending ? "Menambah..." : label}
      </button>
      {message ? (
        <span aria-live="polite" className="inline-note">
          {message}
        </span>
      ) : null}
    </div>
  );
}
