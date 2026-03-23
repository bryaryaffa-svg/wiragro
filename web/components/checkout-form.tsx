"use client";

import Link from "next/link";
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

function buildValidationErrors(form: typeof initialState) {
  const issues: string[] = [];

  if (!form.fullName.trim()) {
    issues.push("Nama lengkap wajib diisi.");
  }
  if (!form.phone.trim()) {
    issues.push("Nomor WhatsApp wajib diisi.");
  }
  if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
    issues.push("Format email belum valid.");
  }
  if (form.shippingMethod === "delivery") {
    if (!form.addressLine.trim()) {
      issues.push("Alamat lengkap wajib diisi untuk pengiriman.");
    }
    if (!form.city.trim()) {
      issues.push("Kota wajib diisi untuk pengiriman.");
    }
    if (!form.province.trim()) {
      issues.push("Provinsi wajib diisi untuk pengiriman.");
    }
  }

  return issues;
}

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
    customerPhone: string;
    paymentSetupError?: string | null;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!cart || cart.items.length === 0) {
    return (
      <section className="empty-state empty-state--shopping">
        <span className="eyebrow-label">Checkout</span>
        <h1>Belum ada item untuk diproses</h1>
        <p>Tambahkan produk ke keranjang terlebih dahulu sebelum melanjutkan checkout.</p>
        <div className="empty-state__actions">
          <Link className="btn btn-primary" href="/produk">
            Pilih produk
          </Link>
          <Link className="btn btn-secondary" href="/keranjang">
            Kembali ke keranjang
          </Link>
        </div>
      </section>
    );
  }

  const isDelivery = form.shippingMethod === "delivery";
  const validationErrors = buildValidationErrors(form);
  const canSubmit = validationErrors.length === 0 && !isPending;
  const submitLabel =
    form.paymentMethod === "COD" ? "Buat order COD" : "Buat order dan lanjut bayar";

  return (
    <section className="page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Checkout guest</span>
        <h1>Selesaikan pesanan tanpa alur yang membingungkan</h1>
        <p>
          Isi data pelanggan, pilih pengiriman dan pembayaran, lalu storefront akan
          meneruskan order ke backend yang sama dengan katalog publik.
        </p>
      </div>

      <div className="checkout-grid">
        <form
          className="form-card form-card--checkout"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            const issues = buildValidationErrors(form);
            if (issues.length > 0) {
              setError(issues[0]);
              return;
            }

            startTransition(async () => {
              try {
                const checkout = await submitGuestCheckout({
                  cartId: cart.id,
                  guestToken: cart.guest_token ?? "",
                  fullName: form.fullName.trim(),
                  phone: form.phone.trim(),
                  email: form.email.trim(),
                  shippingMethod: form.shippingMethod as "pickup" | "delivery",
                  addressLine: form.addressLine.trim(),
                  district: form.district.trim(),
                  city: form.city.trim(),
                  province: form.province.trim(),
                  postalCode: form.postalCode.trim(),
                  paymentMethod: form.paymentMethod,
                  notes: form.notes.trim(),
                });

                const baseResult = {
                  orderNumber: checkout.order.order_number,
                  paymentStatus: checkout.order.payment_status,
                  nextAction: checkout.next_action,
                  total: checkout.order.grand_total,
                  customerPhone: form.phone.trim(),
                  paymentUrl: null,
                  paymentSetupError: null,
                };

                clearCart();

                if (checkout.next_action === "OPEN_PAYMENT") {
                  try {
                    const payment = await createDuitkuPayment(checkout.order.id, {
                      customerPhone: form.phone.trim(),
                    });
                    setResult({
                      ...baseResult,
                      paymentUrl: payment.payment_url,
                    });
                  } catch (paymentError) {
                    setResult({
                      ...baseResult,
                      paymentSetupError:
                        paymentError instanceof Error
                          ? paymentError.message
                          : "Link pembayaran belum berhasil dibuat.",
                    });
                  }
                } else {
                  setResult(baseResult);
                }
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
          <div className="form-section">
            <div className="form-section__header">
              <span className="eyebrow-label">Data pelanggan</span>
              <h2>Info penerima</h2>
            </div>
            <label>
              Nama lengkap
              <input
                required
                value={form.fullName}
                onChange={(event) =>
                  setForm((current) => ({ ...current, fullName: event.target.value }))
                }
                placeholder="Nama yang menerima pesanan"
              />
            </label>
            <div className="grid-two">
              <label>
                No. WhatsApp
                <input
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="08xxxxxxxxxx"
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
                  placeholder="opsional@contoh.com"
                />
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <span className="eyebrow-label">Pengiriman</span>
              <h2>Pilih metode kirim</h2>
            </div>
            <div className="choice-grid">
              <label className={`choice-card ${isDelivery ? "is-selected" : ""}`}>
                <input
                  checked={isDelivery}
                  name="shippingMethod"
                  onChange={() =>
                    setForm((current) => ({ ...current, shippingMethod: "delivery" }))
                  }
                  type="radio"
                />
                <strong>Pengiriman</strong>
                <span>Isi alamat lengkap agar toko bisa memproses order.</span>
              </label>
              <label className={`choice-card ${!isDelivery ? "is-selected" : ""}`}>
                <input
                  checked={!isDelivery}
                  name="shippingMethod"
                  onChange={() =>
                    setForm((current) => ({ ...current, shippingMethod: "pickup" }))
                  }
                  type="radio"
                />
                <strong>Ambil di toko</strong>
                <span>Lebih ringkas jika Anda mengambil pesanan sendiri.</span>
              </label>
            </div>

            {isDelivery ? (
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
                    placeholder="Nama jalan, nomor, patokan, dan detail alamat"
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
                      inputMode="numeric"
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
            ) : (
              <div className="panel-card panel-card--inline">
                Alamat pengiriman tidak diperlukan. Anda akan mengambil pesanan langsung di
                toko.
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <span className="eyebrow-label">Pembayaran</span>
              <h2>Tentukan cara bayar</h2>
            </div>
            <div className="choice-grid">
              <label className={`choice-card ${form.paymentMethod === "duitku-va" ? "is-selected" : ""}`}>
                <input
                  checked={form.paymentMethod === "duitku-va"}
                  name="paymentMethod"
                  onChange={() =>
                    setForm((current) => ({ ...current, paymentMethod: "duitku-va" }))
                  }
                  type="radio"
                />
                <strong>Duitku VA</strong>
                <span>Order dibuat dulu, lalu storefront menyiapkan link pembayaran.</span>
              </label>
              <label className={`choice-card ${form.paymentMethod === "COD" ? "is-selected" : ""}`}>
                <input
                  checked={form.paymentMethod === "COD"}
                  name="paymentMethod"
                  onChange={() =>
                    setForm((current) => ({ ...current, paymentMethod: "COD" }))
                  }
                  type="radio"
                />
                <strong>COD / nota merah</strong>
                <span>Pembayaran ditangani saat pesanan diterima atau dikonfirmasi toko.</span>
              </label>
            </div>
            <label>
              Catatan order
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Opsional: catatan tambahan untuk toko"
              />
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {validationErrors.length > 0 && !error ? (
            <p className="inline-note">Lengkapi data wajib sebelum submit order.</p>
          ) : null}

          {result ? (
            <div className="success-card">
              <strong>Order {result.orderNumber} berhasil dibuat</strong>
              <p>Total: {formatCurrency(result.total)}</p>
              <p>Status pembayaran: {result.paymentStatus}</p>
              {result.paymentSetupError ? (
                <p className="form-error">
                  Link pembayaran belum siap: {result.paymentSetupError}
                </p>
              ) : null}
              <div className="success-card__actions">
                {result.paymentUrl ? (
                  <a
                    className="btn btn-primary"
                    href={result.paymentUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Buka halaman pembayaran
                  </a>
                ) : null}
                <Link
                  className="btn btn-secondary"
                  href={`/lacak-pesanan?order=${encodeURIComponent(result.orderNumber)}&phone=${encodeURIComponent(result.customerPhone)}`}
                >
                  Lacak pesanan
                </Link>
              </div>
            </div>
          ) : null}

          <button className="btn btn-primary btn-block" disabled={!canSubmit} type="submit">
            {isPending ? "Memproses..." : submitLabel}
          </button>
        </form>

        <aside className="summary-card summary-card--checkout">
          <span className="eyebrow-label">Ringkasan</span>
          <h2>{cart.items.length} produk di order ini</h2>
          <div className="stack-list stack-list--compact">
            {cart.items.map((item) => (
              <div className="summary-row" key={item.id}>
                <span>
                  {item.qty}x {item.product_name || "Produk"}
                </span>
                <strong>{formatCurrency(item.total)}</strong>
              </div>
            ))}
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
          <div className="panel-card panel-card--inline">
            Tombol submit hanya aktif jika data inti pelanggan dan pengiriman sudah lengkap.
          </div>
        </aside>
      </div>
    </section>
  );
}
