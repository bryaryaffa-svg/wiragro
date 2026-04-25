"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { getCustomerOrderDetail } from "@/lib/api";

export function ReorderOrderButton({
  orderId,
  buttonClassName,
  label = "Order lagi",
  redirectTo = "/keranjang",
}: {
  orderId: string;
  buttonClassName?: string;
  label?: string;
  redirectTo?: string;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const { addItems } = useCart();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="inline-action-stack">
      <button
        className={buttonClassName ?? "btn btn-secondary"}
        disabled={isPending}
        onClick={() => {
          if (!session?.access_token) {
            setMessage("Login dulu untuk membuka riwayat order.");
            router.push("/akun");
            return;
          }

          startTransition(async () => {
            try {
              const detail = await getCustomerOrderDetail(session.access_token, orderId);

              if (!detail.items.length) {
                setMessage("Order ini belum punya item yang bisa diulang.");
                return;
              }

              await addItems(
                detail.items.map((item) => ({
                  productId: item.product_id,
                  qty: item.qty,
                })),
              );

              setMessage("Item dari order sebelumnya dimasukkan ke keranjang.");
              router.push(redirectTo);
            } catch (error) {
              setMessage(
                error instanceof Error ? error.message : "Order ulang belum berhasil diproses.",
              );
            }
          });
        }}
        type="button"
      >
        {isPending ? "Menyiapkan..." : label}
      </button>
      {message ? (
        <span aria-live="polite" className="inline-note">
          {message}
        </span>
      ) : null}
    </div>
  );
}
