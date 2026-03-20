"use client";

import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";

export function AddToCartButton({
  productId,
  label = "Tambah ke Keranjang",
  qty = 1,
}: {
  productId: string;
  label?: string;
  qty?: number;
}) {
  const { addItem } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="inline-action-stack">
      <button
        className="btn btn-primary"
        disabled={isPending}
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
        {isPending ? "Menambah..." : label}
      </button>
      {message ? <span className="inline-note">{message}</span> : null}
    </div>
  );
}
