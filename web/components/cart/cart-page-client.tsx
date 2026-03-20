"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartPageClient() {
  const { cart, error, isBusy, isReady, removeItem, setItemQty } = useCart();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleQtyChange(itemId: string, nextQty: number) {
    setMessage(null);
    setPendingItemId(itemId);
    try {
      await setItemQty(itemId, nextQty);
      setMessage(nextQty === 0 ? "Item dihapus dari keranjang" : "Jumlah item diperbarui");
    } catch (updateError) {
      setMessage(
        updateError instanceof Error ? updateError.message : "Keranjang tidak dapat diperbarui",
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleRemove(itemId: string) {
    setMessage(null);
    setPendingItemId(itemId);
    try {
      await removeItem(itemId);
      setMessage("Item dihapus dari keranjang");
    } catch (removeError) {
      setMessage(removeError instanceof Error ? removeError.message : "Item gagal dihapus");
    } finally {
      setPendingItemId(null);
    }
  }

  if (!isReady) {
    return <div className="panel-card">Menyiapkan keranjang...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="empty-state">
        <span className="eyebrow-label">Keranjang</span>
        <h1>Keranjang masih kosong</h1>
        <p>Tambahkan produk dari katalog untuk mulai checkout.</p>
        <Link className="btn btn-primary" href="/produk">
          Lihat katalog
        </Link>
      </section>
    );
  }

  return (
    <section className="page-stack">
      <div className="page-intro">
        <span className="eyebrow-label">Keranjang</span>
        <h1>Ringkasan belanja Anda</h1>
        <p>
          Keranjang guest disimpan lokal di browser dan disinkronkan ke backend storefront.
        </p>
      </div>
      {message ? <div className="panel-card">{message}</div> : null}
      {error ? <div className="panel-card">{error}</div> : null}

      <div className="cart-layout">
        <div className="stack-list">
          {cart.items.map((item) => (
            <article className="cart-line" key={item.id}>
              <div className="cart-line__details">
                <strong>{item.product_name || "Produk"}</strong>
                <p>{item.price_snapshot.price_type ?? "Harga toko"}</p>
                <small>Harga satuan: {formatCurrency(item.price_snapshot.amount)}</small>
                <div className="cart-line__actions">
                  <div className="qty-stepper">
                    <button
                      disabled={isBusy}
                      onClick={() => void handleQtyChange(item.id, Math.max(item.qty - 1, 0))}
                      type="button"
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      disabled={isBusy}
                      onClick={() => void handleQtyChange(item.id, item.qty + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="ghost-action ghost-action--danger"
                    disabled={isBusy}
                    onClick={() => void handleRemove(item.id)}
                    type="button"
                  >
                    Hapus
                  </button>
                </div>
                {item.promotion_snapshot.matched_promotions?.length ? (
                  <small>
                    Promo:{" "}
                    {item.promotion_snapshot.matched_promotions
                      .map((promo) => promo.name)
                      .join(", ")}
                  </small>
                ) : null}
              </div>
              <div className="cart-line__summary">
                <span>{isBusy && pendingItemId === item.id ? "Memproses..." : `${item.qty} item`}</span>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card">
          <h2>Ringkasan</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <strong>{formatCurrency(cart.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Diskon</span>
            <strong>{formatCurrency(cart.discount_total)}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(cart.grand_total)}</strong>
          </div>
          <Link className="btn btn-primary btn-block" href="/checkout">
            Lanjut checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}
