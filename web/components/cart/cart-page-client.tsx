"use client";

import Image from "next/image";
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
          <p>Data belanja terakhir sedang dimuat dari browser dan layanan Wiragro.</p>
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
  const totalWeightKg = Number(cart.total_weight_grams ?? 0) / 1000;

  return (
    <section className="page-stack cart-page">
      <div className="cart-overview">
        <div className="cart-overview__copy">
          <span className="eyebrow-label">Keranjang</span>
          <h1>Tinjau produk sebelum masuk ke checkout.</h1>
          <p>
            Keranjang Anda disimpan di browser ini dan disinkronkan ke akun atau sesi aktif,
            jadi perubahan jumlah item akan langsung memengaruhi total pesanan.
          </p>
        </div>
        <div className="cart-overview__stats">
          <div>
            <span>Item</span>
            <strong>{itemCount}</strong>
          </div>
          <div>
            <span>Berat total</span>
            <strong>{totalWeightKg > 0 ? `${totalWeightKg.toFixed(2)} kg` : "-"}</strong>
          </div>
          <div>
            <span>Total sementara</span>
            <strong>{formatCurrency(cart.grand_total)}</strong>
          </div>
        </div>
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
            <article className="cart-line cart-line--enhanced" key={item.id}>
              <div className="cart-line__media">
                {item.product_image_url ? (
                  <Image
                    alt={item.product_name || "Produk"}
                    fill
                    sizes="96px"
                    src={item.product_image_url}
                  />
                ) : (
                  <div className="product-card__placeholder" />
                )}
              </div>

              <div className="cart-line__details">
                <div className="cart-line__headline">
                  <div className="cart-line__title-group">
                    {item.product_slug ? (
                      <Link className="cart-line__title" href={`/produk/${item.product_slug}`}>
                        {item.product_name || "Produk"}
                      </Link>
                    ) : (
                      <strong>{item.product_name || "Produk"}</strong>
                    )}
                    <div className="cart-line__meta">
                      <span>{item.product_unit || "Unit"}</span>
                      <span>{item.price_snapshot.price_type ?? "Harga aktif"}</span>
                      <span>{formatCurrency(item.price_snapshot.amount)}</span>
                    </div>
                  </div>
                  <div className="cart-line__summary">
                    <span>{isBusy && pendingItemId === item.id ? "Memproses..." : `${item.qty} item`}</span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </div>
                </div>

                {item.promotion_snapshot.matched_promotions?.length ? (
                  <div className="cart-line__note">
                    Promo aktif:{" "}
                    {item.promotion_snapshot.matched_promotions.map((promo) => promo.name).join(", ")}
                  </div>
                ) : (
                  <div className="cart-line__note">Belum ada promo tambahan pada item ini.</div>
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
                  {item.product_slug ? (
                    <Link className="ghost-action" href={`/produk/${item.product_slug}`}>
                      Detail produk
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="summary-card summary-card--cart">
          <span className="eyebrow-label">Ringkasan belanja</span>
          <h2>{itemCount} item siap diproses</h2>
          <div className="summary-card__lead">
            Lanjutkan ke checkout untuk memilih metode pengiriman dan pembayaran.
          </div>
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
          <div className="summary-card__snapshot">
            <span>Berat total</span>
            <strong>{totalWeightKg > 0 ? `${totalWeightKg.toFixed(2)} kg` : "-"}</strong>
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
