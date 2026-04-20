"use client";

import { useState, useTransition } from "react";

import { useWishlist } from "@/components/wishlist-provider";
import type { ProductSummary } from "@/lib/api";

export function WishlistButton({
  product,
  buttonClassName,
  variant = "button",
}: {
  product: ProductSummary;
  buttonClassName?: string;
  variant?: "button" | "icon";
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saved = isWishlisted(product.id);
  const isIcon = variant === "icon";
  const iconLabel = saved ? "Hapus dari wishlist" : "Simpan ke wishlist";

  return (
    <div className={`inline-action-stack ${isIcon ? "inline-action-stack--icon" : ""}`}>
      <button
        aria-label={iconLabel}
        className={
          buttonClassName ??
          (isIcon ? "wishlist-button wishlist-button--icon" : "btn btn-secondary")
        }
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
        title={iconLabel}
        type="button"
      >
        {isIcon ? (
          <span aria-hidden="true" className={`wishlist-button__heart ${saved ? "is-saved" : ""}`}>
            <svg fill={saved ? "currentColor" : "none"} viewBox="0 0 24 24">
              <path
                d="M12 20.4 5.65 14.3C2.4 11.19 2.12 6.2 5.1 3.4C6.61 1.98 8.74 1.55 10.63 2.13C11.15 2.29 11.63 2.53 12.05 2.84C12.47 2.53 12.95 2.29 13.47 2.13C15.36 1.55 17.49 1.98 19 3.4C21.98 6.2 21.7 11.19 18.45 14.3L12 20.4Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
              />
            </svg>
          </span>
        ) : isPending ? (
          "Menyimpan..."
        ) : saved ? (
          "Tersimpan"
        ) : (
          "Simpan"
        )}
      </button>
      {message ? (
        <span
          aria-live="polite"
          className={`inline-note ${isIcon ? "inline-note--floating" : ""}`}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
