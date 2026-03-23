"use client";

import { useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { createDuitkuPayment, submitGuestCheckout } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

const initialState = {
  fullName: "",
  phone: "",
  email: "",
  shippingMethod: "delivery",
  addressLine: "",
  district: "",
  city: "",
  province: "Jawa Timur",
  postalCode: "",
  paymentMethod: "duitku-va",
  notes: "",
};

export function CheckoutForm() {
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState(initialState);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    orderNumber: string;
    paymentUrl?: string | null;
    paymentStatus: string;
    nextAction: string;
    total: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!cart || cart.items.length === 0) {
    return (
      <section className="empty-state">
        <span className="eyebrow-label">Checkout</span>
        <h1>Belum ada item untuk diproses</h1>
        <p>Tambahkan produk ke keranjang terlebih dahulu.</p>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <div className="page-intro">
        <span className="eyebrow-label">Checkout Guest</span>
        <h1>Selesaikan order dengan alur sederhana</h1>
        <p>
          Form ini mengirim guest checkout ke backend, lalu membuat transaksi Duitku dari
          server.
        </p>
      </div>

      <div className="checkout-grid">
        <form
          className="form-card"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            startTransition(async () => {
              try {
                const checkout = await submitGuestCheckout({
                  cartId: cart.id,
                  guestToken: cart.guest_token ?? "",
                  fullName: form.fullName,
                  phone: form.phone,
                  email: form.email,
                  shippingMethod: form.shippingMethod as "pickup" | "delivery",
                  addressLine: form.addressLine,
                  district: form.district,
                  city: form.city,
                  province: form.province,
                  postalCode: form.postalCode,
                  paymentMethod: form.paymentMethod,
                  notes: form.notes,
                });
                if (checkout.next_action === "OPEN_PAYMENT") {
                  const payment = await createDuitkuPayment(checkout.order.id, {
                    customerPhone: form.phone,
                  });
                  setResult({
                    orderNumber: checkout.order.order_number,
                    paymentUrl: payment.payment_url,
                    paymentStatus: checkout.order.payment_status,
                    nextAction: checkout.next_action,
                    total: checkout.order.grand_total,
                  });
                } else {
                  setResult({
                    orderNumber: checkout.order.order_number,
                    paymentStatus: checkout.order.payment_status,
                    nextAction: checkout.next_action,
                    total: checkout.order.grand_total,
                  });
                }
                clearCart();
              } catch (submitError) {
                setError(
                  submitError instanceof Error
                    ? submitError.message
                    : "Checkout gagal diproses",
                );
              }
            });
          }}
        >
          <label>
            Nama lengkap
            <input
              required
              value={form.fullName}
              onChange={(event) =>
                setForm((current) => ({ ...current, fullName: event.target.value }))
              }
            />
          </label>
          <label>
            No. WhatsApp
            <input
              required
              value={form.phone}
              onChange={(event) =>
                setForm((current) => ({ ...current, phone: event.target.value }))
              }
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({ ...current, email: event.target.value }))
              }
            />
          </label>
          <label>
            Metode pengiriman
            <select
              value={form.shippingMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  shippingMethod: event.target.value,
                }))
              }
            >
              <option value="delivery">Pengiriman mandiri</option>
              <option value="pickup">Ambil di toko</option>
            </select>
          </label>
          {form.shippingMethod === "delivery" ? (
            <>
              <label>
                Alamat lengkap
                <textarea
                  required
                  rows={4}
                  value={form.addressLine}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      addressLine: event.target.value,
                    }))
                  }
                />
              </label>
              <div className="grid-two">
                <label>
                  Kecamatan
                  <input
                    value={form.district}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        district: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Kota
                  <input
                    required
                    value={form.city}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, city: event.target.value }))
                    }
                  />
                </label>
              </div>
              <div className="grid-two">
                <label>
                  Provinsi
                  <input
                    required
                    value={form.province}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        province: event.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  Kode pos
                  <input
                    value={form.postalCode}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        postalCode: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>
            </>
          ) : null}

          <label>
            Metode pembayaran
            <select
              value={form.paymentMethod}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  paymentMethod: event.target.value,
                }))
              }
            >
              <option value="duitku-va">Duitku Virtual Account</option>
              <option value="COD">COD / nota merah</option>
            </select>
          </label>
          <label>
            Catatan order
            <textarea
              rows={3}
              value={form.notes}
              onChange={(event) =>
                setForm((current) => ({ ...current, notes: event.target.value }))
              }
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}
          {result ? (
            <div className="success-card">
              <strong>Order {result.orderNumber} sudah dibuat</strong>
              <p>Total: {formatCurrency(result.total)}</p>
              <p>Status pembayaran: {result.paymentStatus}</p>
              {result.paymentUrl ? (
                <a
                  className="btn btn-primary btn-block"
                  href={result.paymentUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Buka halaman pembayaran
                </a>
              ) : (
                <p className="inline-note">
                  Order diterima dan menunggu konfirmasi toko.
                </p>
              )}
            </div>
          ) : null}

          <button className="btn btn-primary btn-block" disabled={isPending} type="submit">
            {isPending ? "Memproses..." : "Buat order dan lanjut ke pembayaran"}
          </button>
        </form>

        <aside className="summary-card">
          <h2>Ringkasan belanja</h2>
          {cart.items.map((item) => (
            <div className="summary-row" key={item.id}>
              <span>{item.qty} item</span>
              <strong>{formatCurrency(item.total)}</strong>
            </div>
          ))}
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(cart.grand_total)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
