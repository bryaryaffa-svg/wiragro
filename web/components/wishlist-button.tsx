"use client";

import { useState, useTransition, type CSSProperties } from "react";

import { useWishlist } from "@/components/wishlist-provider";
import type { ProductSummary } from "@/lib/api";

const ICON_ACTION_STACK_STYLE = {
  position: "relative",
  display: "inline-flex",
  width: "auto",
  alignSelf: "flex-start",
} as const;

const ICON_BUTTON_STYLE = {
  minWidth: "44px",
  minHeight: "44px",
  padding: 0,
  borderRadius: "999px",
  border: "1px solid rgba(255, 248, 236, 0.76)",
  background: "rgba(255, 252, 245, 0.9)",
  color: "#33452c",
  boxShadow: "0 14px 28px rgba(31, 33, 23, 0.12)",
  backdropFilter: "blur(12px)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  appearance: "none",
} as const;

const ICON_HEART_STYLE = {
  display: "inline-flex",
  width: "20px",
  height: "20px",
} as const;

const ICON_MESSAGE_STYLE = {
  position: "absolute",
  top: "calc(100% + 0.35rem)",
  right: 0,
  zIndex: 4,
  minWidth: "8.5rem",
  maxWidth: "12rem",
  padding: "0.45rem 0.65rem",
  borderRadius: "12px",
  background: "rgba(24, 40, 23, 0.92)",
  color: "#f9f7f0",
  boxShadow: "0 16px 30px rgba(15, 24, 14, 0.18)",
  lineHeight: 1.35,
} as const;

export function WishlistButton({
  product,
  buttonClassName,
  variant = "button",
  buttonStyle,
  messageStyle,
  wrapperStyle,
}: {
  product: ProductSummary;
  buttonClassName?: string;
  variant?: "button" | "icon";
  buttonStyle?: CSSProperties;
  messageStyle?: CSSProperties;
  wrapperStyle?: CSSProperties;
}) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const saved = isWishlisted(product.id);
  const isIcon = variant === "icon";
  const iconLabel = saved ? "Hapus dari wishlist" : "Simpan ke wishlist";

  return (
    <div
      className={`inline-action-stack ${isIcon ? "inline-action-stack--icon" : ""}`}
      style={isIcon ? { ...ICON_ACTION_STACK_STYLE, ...wrapperStyle } : wrapperStyle}
    >
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
        style={isIcon ? { ...ICON_BUTTON_STYLE, ...buttonStyle } : buttonStyle}
      >
        {isIcon ? (
          <span
            aria-hidden="true"
            className={`wishlist-button__heart ${saved ? "is-saved" : ""}`}
            style={{ ...ICON_HEART_STYLE, color: saved ? "#cf466c" : undefined }}
          >
            <svg
              fill={saved ? "currentColor" : "none"}
              style={{ width: "100%", height: "100%", overflow: "visible" }}
              viewBox="0 0 24 24"
            >
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
          style={isIcon ? { ...ICON_MESSAGE_STYLE, ...messageStyle } : messageStyle}
        >
          {message}
        </span>
      ) : null}
    </div>
  );
}
