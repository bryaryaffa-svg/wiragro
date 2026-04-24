"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { ReorderOrderButton } from "@/components/reorder-order-button";
import type {
  CustomerAddressInput,
  CustomerAccountPayload,
  CustomerOrderSummaryPayload,
  CustomerSession,
} from "@/lib/api";
import {
  createCustomerAddress,
  deleteCustomerAddress,
  getCustomerAccount,
  getCustomerOrders,
  updateCustomerAddress,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

function buildAddressForm(customer: CustomerSession["customer"]): CustomerAddressInput {
  return {
    label: "",
    recipient_name: customer.full_name || "",
    recipient_phone: customer.phone || "",
    address_line: "",
    district: "",
    city: "",
    province: "Jawa Timur",
    postal_code: "",
    notes: "",
    is_default: false,
  };
}

function mapAddressToForm(
  customer: CustomerSession["customer"],
  address: CustomerAccountPayload["addresses"][number],
): CustomerAddressInput {
  return {
    label: address.label || "",
    recipient_name: address.recipient_name || customer.full_name || "",
    recipient_phone: address.recipient_phone || customer.phone || "",
    address_line: address.address_line || "",
    district: address.district || "",
    city: address.city || "",
    province: address.province || "Jawa Timur",
    postal_code: address.postal_code || "",
    notes: address.notes || "",
    is_default: address.is_default,
  };
}

function buildTrackingHref(orderNumber: string, phone?: string | null) {
  if (!phone) {
    return "/lacak-pesanan";
  }

  return `/lacak-pesanan?order=${encodeURIComponent(orderNumber)}&phone=${encodeURIComponent(phone)}`;
}

function addressSummary(address: CustomerAccountPayload["addresses"][number]) {
  return [address.address_line, address.district, address.city, address.province, address.postal_code]
    .filter(Boolean)
    .join(", ");
}

export function AccountDashboard({ session }: { session: CustomerSession }) {
  const [account, setAccount] = useState<CustomerAccountPayload | null>(null);
  const [orders, setOrders] = useState<CustomerOrderSummaryPayload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerAddressInput>(() => buildAddressForm(session.customer));
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  async function refreshDashboard() {
    setIsLoading(true);
    try {
      const [nextAccount, nextOrders] = await Promise.all([
        getCustomerAccount(session.access_token),
        getCustomerOrders(session.access_token, 8),
      ]);

      setAccount(nextAccount);
      setOrders(nextOrders.items);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Data akun customer belum berhasil dimuat.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.access_token]);

  const defaultAddress = useMemo(
    () => account?.addresses.find((item) => item.is_default) ?? null,
    [account?.addresses],
  );

  return (
    <section className="account-dashboard">
      <div className="section-heading">
        <div>
          <span className="eyebrow-label">Retention layer</span>
          <h2>Akun sekarang membantu order ulang, bukan hanya menyimpan login.</h2>
          <p>
            Fase ini mengaktifkan alamat tersimpan dan riwayat pesanan agar belanja berikutnya
            terasa lebih singkat dan lebih percaya diri.
          </p>
        </div>
        <div className="homepage-trust-panel__actions">
          <Link className="btn btn-secondary" href="/wishlist">
            Buka wishlist
          </Link>
          <Link className="btn btn-primary" href="/checkout">
            Lanjut ke checkout
          </Link>
        </div>
      </div>

      {error ? <div className="panel-card panel-card--danger">{error}</div> : null}

      <div className="account-dashboard__summary">
        <article className="panel-card">
          <span className="eyebrow-label">Alamat default</span>
          <strong>{defaultAddress?.label || "Belum ada alamat default"}</strong>
          <p>{defaultAddress ? addressSummary(defaultAddress) : "Simpan alamat pengiriman agar order berikutnya lebih cepat."}</p>
        </article>
        <article className="panel-card">
          <span className="eyebrow-label">Riwayat pesanan</span>
          <strong>{orders.length} order terbaru</strong>
          <p>
            {orders.length
              ? "Gunakan order history sebagai referensi repeat order dan validasi ritme belanja."
              : "Order history akan muncul di sini setelah customer menyelesaikan transaksi."}
          </p>
        </article>
        <article className="panel-card">
          <span className="eyebrow-label">Mode akun</span>
          <strong>{account?.pricing_mode || session.pricing_mode || "Customer"}</strong>
          <p>{account?.role || session.role || "Akun ini aktif untuk wishlist, pelacakan, dan pembelian ulang."}</p>
        </article>
      </div>

      <div className="account-dashboard__grid">
        <section className="panel-card account-panel-section">
          <div className="account-panel-section__header">
            <div>
              <span className="eyebrow-label">Saved address</span>
              <h3>Alamat pengiriman tersimpan</h3>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingAddressId(null);
                setForm(buildAddressForm(session.customer));
                setFormMessage(null);
              }}
              type="button"
            >
              Tambah alamat
            </button>
          </div>

          {isLoading && !account ? <p className="inline-note">Memuat alamat customer...</p> : null}

          <div className="account-address-grid">
            {account?.addresses.length ? (
              account.addresses.map((address) => (
                <article className="account-address-card" key={address.id}>
                  <div className="account-address-card__head">
                    <strong>{address.label}</strong>
                    {address.is_default ? <span>Default</span> : null}
                  </div>
                  <p>{address.recipient_name}</p>
                  <p>{address.recipient_phone}</p>
                  <p>{addressSummary(address)}</p>
                  {address.notes ? <p>{address.notes}</p> : null}
                  <div className="account-address-card__actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingAddressId(address.id);
                        setForm(mapAddressToForm(session.customer, address));
                        setFormMessage(`Mengedit alamat ${address.label}.`);
                      }}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-secondary"
                      disabled={busyAddressId === address.id}
                      onClick={async () => {
                        setBusyAddressId(address.id);
                        setFormMessage(null);

                        try {
                          await deleteCustomerAddress(session.access_token, address.id);
                          await refreshDashboard();
                          setFormMessage("Alamat berhasil dihapus.");
                          if (editingAddressId === address.id) {
                            setEditingAddressId(null);
                            setForm(buildAddressForm(session.customer));
                          }
                        } catch (deleteError) {
                          setFormMessage(
                            deleteError instanceof Error
                              ? deleteError.message
                              : "Alamat belum berhasil dihapus.",
                          );
                        } finally {
                          setBusyAddressId(null);
                        }
                      }}
                      type="button"
                    >
                      {busyAddressId === address.id ? "Menghapus..." : "Hapus"}
                    </button>
                    <Link className="btn btn-secondary" href="/checkout">
                      Pakai saat checkout
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="panel-card panel-card--inline">
                Belum ada alamat tersimpan. Tambahkan satu alamat agar checkout berikutnya lebih cepat.
              </div>
            )}
          </div>

          <form
            className="form-grid account-address-form"
            onSubmit={async (event) => {
              event.preventDefault();
              setIsSavingAddress(true);
              setFormMessage(null);

              try {
                const payload = {
                  ...form,
                  label: form.label.trim(),
                  recipient_name: form.recipient_name.trim(),
                  recipient_phone: form.recipient_phone.trim(),
                  address_line: form.address_line.trim(),
                  district: form.district?.trim() || "",
                  city: form.city.trim(),
                  province: form.province.trim(),
                  postal_code: form.postal_code?.trim() || "",
                  notes: form.notes?.trim() || "",
                };

                if (editingAddressId) {
                  await updateCustomerAddress(session.access_token, editingAddressId, payload);
                  setFormMessage("Alamat berhasil diperbarui.");
                } else {
                  await createCustomerAddress(session.access_token, payload);
                  setFormMessage("Alamat berhasil disimpan.");
                }

                setEditingAddressId(null);
                setForm(buildAddressForm(session.customer));
                await refreshDashboard();
              } catch (saveError) {
                setFormMessage(
                  saveError instanceof Error ? saveError.message : "Alamat belum berhasil disimpan.",
                );
              } finally {
                setIsSavingAddress(false);
              }
            }}
          >
            <div className="account-panel-section__header">
              <div>
                <span className="eyebrow-label">{editingAddressId ? "Edit alamat" : "Alamat baru"}</span>
                <h3>{editingAddressId ? "Perbarui alamat tersimpan" : "Simpan alamat untuk order berikutnya"}</h3>
              </div>
            </div>

            <label>
              Label alamat
              <input
                required
                value={form.label}
                onChange={(event) =>
                  setForm((current) => ({ ...current, label: event.target.value }))
                }
                placeholder="Rumah, kebun, gudang, atau kantor"
              />
            </label>
            <label>
              Nama penerima
              <input
                required
                value={form.recipient_name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, recipient_name: event.target.value }))
                }
              />
            </label>
            <label>
              Nomor WhatsApp
              <input
                required
                inputMode="tel"
                value={form.recipient_phone}
                onChange={(event) =>
                  setForm((current) => ({ ...current, recipient_phone: event.target.value }))
                }
              />
            </label>
            <label className="form-grid__full">
              Alamat lengkap
              <textarea
                required
                rows={4}
                value={form.address_line}
                onChange={(event) =>
                  setForm((current) => ({ ...current, address_line: event.target.value }))
                }
              />
            </label>
            <label>
              Kecamatan
              <input
                value={form.district}
                onChange={(event) =>
                  setForm((current) => ({ ...current, district: event.target.value }))
                }
              />
            </label>
            <label>
              Kota / Kabupaten
              <input
                required
                value={form.city}
                onChange={(event) =>
                  setForm((current) => ({ ...current, city: event.target.value }))
                }
              />
            </label>
            <label>
              Provinsi
              <input
                required
                value={form.province}
                onChange={(event) =>
                  setForm((current) => ({ ...current, province: event.target.value }))
                }
              />
            </label>
            <label>
              Kode pos
              <input
                inputMode="numeric"
                value={form.postal_code}
                onChange={(event) =>
                  setForm((current) => ({ ...current, postal_code: event.target.value }))
                }
              />
            </label>
            <label className="form-grid__full">
              Catatan alamat
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Patokan, jam terbaik, atau instruksi pickup"
              />
            </label>

            <label className="account-address-form__toggle">
              <input
                checked={form.is_default}
                onChange={(event) =>
                  setForm((current) => ({ ...current, is_default: event.target.checked }))
                }
                type="checkbox"
              />
              <span>Jadikan sebagai alamat default</span>
            </label>

            <div className="content-shell__cta">
              <button className="btn btn-primary" disabled={isSavingAddress} type="submit">
                {isSavingAddress ? "Menyimpan..." : editingAddressId ? "Perbarui alamat" : "Simpan alamat"}
              </button>
              {editingAddressId ? (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingAddressId(null);
                    setForm(buildAddressForm(session.customer));
                    setFormMessage(null);
                  }}
                  type="button"
                >
                  Batal edit
                </button>
              ) : null}
            </div>
            {formMessage ? <p className="inline-note">{formMessage}</p> : null}
          </form>
        </section>

        <section className="panel-card account-panel-section">
          <div className="account-panel-section__header">
            <div>
              <span className="eyebrow-label">Repeat order</span>
              <h3>Riwayat pesanan terbaru</h3>
            </div>
            <Link className="btn btn-secondary" href="/lacak-pesanan">
              Buka tracking
            </Link>
          </div>

          {isLoading && !orders.length ? <p className="inline-note">Memuat riwayat pesanan...</p> : null}

          <div className="account-order-grid">
            {orders.length ? (
              orders.map((order) => (
                <article className="account-order-card" key={order.id}>
                  <div className="account-order-card__head">
                    <div>
                      <span className="eyebrow-label">{order.order_number}</span>
                      <strong>{formatCurrency(order.grand_total)}</strong>
                    </div>
                    <span className="account-order-card__status">{order.status}</span>
                  </div>
                  <div className="account-order-card__meta">
                    <div>
                      <span>Dibuat</span>
                      <strong>{formatDate(order.created_at)}</strong>
                    </div>
                    <div>
                      <span>Pembayaran</span>
                      <strong>{order.payment_status}</strong>
                    </div>
                    <div>
                      <span>Fulfillment</span>
                      <strong>{order.fulfillment_status}</strong>
                    </div>
                    <div>
                      <span>Metode</span>
                      <strong>{[order.shipping_method, order.payment_method].filter(Boolean).join(" / ") || "-"}</strong>
                    </div>
                  </div>
                  <div className="account-order-card__actions">
                    <ReorderOrderButton orderId={order.id} />
                    <Link
                      className="btn btn-secondary"
                      href={buildTrackingHref(order.order_number, session.customer.phone)}
                    >
                      Lacak
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <div className="panel-card panel-card--inline">
                Belum ada riwayat pesanan. Setelah checkout pertama selesai, order history akan
                menjadi pintu paling cepat untuk repeat order.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
