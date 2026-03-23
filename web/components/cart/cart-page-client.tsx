"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartPageClient() {
  const { cart, error, isBusy, isReady, refreshCart, removeItem, setItemQty } = useCart();
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
    return (
      <section className="page-stack">
        <article className="panel-card panel-card--loading">
          <span className="eyebrow-label">Keranjang</span>
          <h1>Menyiapkan keranjang Anda...</h1>
          <p>Data belanja terakhir sedang dimuat dari browser dan backend storefront.</p>
        </article>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="empty-state empty-state--shopping">
        <span className="eyebrow-label">Keranjang</span>
        <h1>Keranjang masih kosong</h1>
        <p>Tambahkan produk dari katalog untuk mulai checkout dengan lebih cepat.</p>
        <div className="empty-state__actions">
          <Link className="btn btn-primary" href="/produk">
            Lihat katalog
          </Link>
          <Link className="btn btn-secondary" href="/">
            Kembali ke beranda
          </Link>
        </div>
      </section>
    );
  }

  const itemCount = cart.items.reduce((total, item) => total + item.qty, 0);

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Keranjang</span>
        <h1>Periksa pesanan sebelum checkout</h1>
        <p>
          Keranjang guest tetap tersimpan di browser ini dan disinkronkan ke backend agar
          jumlah item, subtotal, dan perubahan quantity tetap konsisten.
        </p>
      </div>

      {message ? <div className="panel-card panel-card--inline">{message}</div> : null}
      {error ? (
        <div className="panel-card panel-card--inline panel-card--danger">
          <div className="panel-card__row">
            <div>
              <strong>Keranjang belum tersinkron sempurna</strong>
              <p>{error}</p>
            </div>
            <button className="btn btn-secondary" onClick={() => void refreshCart()} type="button">
              Muat ulang
            </button>
          </div>
        </div>
      ) : null}

      <div className="cart-layout">
        <div className="stack-list">
          {cart.items.map((item) => (
            <article className="cart-line" key={item.id}>
              <div className="cart-line__details">
                <div className="cart-line__headline">
                  <strong>{item.product_name || "Produk"}</strong>
                  <span className="status-badge status-badge--neutral">
                    {item.price_snapshot.price_type ?? "Harga toko"}
                  </span>
                </div>
                <small>Harga satuan: {formatCurrency(item.price_snapshot.amount)}</small>
                {item.promotion_snapshot.matched_promotions?.length ? (
                  <small>
                    Promo aktif:{" "}
                    {item.promotion_snapshot.matched_promotions
                      .map((promo) => promo.name)
                      .join(", ")}
                  </small>
                ) : (
                  <small>Belum ada promo tambahan pada item ini.</small>
                )}

                <div className="cart-line__actions">
                  <div className="qty-stepper" role="group" aria-label={`Ubah jumlah ${item.product_name}`}>
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
              </div>

              <div className="cart-line__summary">
                <span>{isBusy && pendingItemId === item.id ? "Memproses..." : `${item.qty} item`}</span>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card summary-card--cart">
          <span className="eyebrow-label">Ringkasan belanja</span>
          <h2>{itemCount} item siap diproses</h2>
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
          <div className="stack-list stack-list--compact">
            <Link className="btn btn-primary btn-block" href="/checkout">
              Lanjut checkout
            </Link>
            <Link className="btn btn-secondary btn-block" href="/produk">
              Tambah produk lagi
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
