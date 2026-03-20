"use client";

import { useState, useTransition } from "react";

import { useWishlist } from "@/components/wishlist-provider";
import type { ProductSummary } from "@/lib/api";

export function WishlistButton({ product }: { product: ProductSummary }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saved = isWishlisted(product.id);

  return (
    <div className="inline-action-stack">
      <button
        className="btn btn-secondary"
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              await toggleWishlist(product);
              setMessage(saved ? "Dihapus dari wishlist" : "Disimpan ke wishlist");
            } catch (toggleError) {
              setMessage(
                toggleError instanceof Error
                  ? toggleError.message
                  : "Wishlist tidak dapat diproses",
              );
            }
          });
        }}
        type="button"
      >
        {isPending ? "Menyimpan..." : saved ? "Tersimpan" : "Simpan"}
      </button>
      {message ? <span className="inline-note">{message}</span> : null}
    </div>
  );
}
