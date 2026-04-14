"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";

import { useCart } from "@/components/cart/cart-provider";
import {
  GooglePlacesAddressAssist,
  type GoogleAddressSelection,
} from "@/components/google-places-address-assist";
import {
  createDuitkuPayment,
  getShippingRates,
  searchShippingDestinations,
  type StoreProfile,
  submitGuestCheckout,
  type ShippingDestination,
  type ShippingRateItem,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { buildGoogleMapsStoreSearchUrl } from "@/lib/maps";

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

type CheckoutResult = {
  orderNumber: string;
  paymentUrl?: string | null;
  paymentStatus: string;
  nextAction: string;
  total: string;
  customerPhone: string;
  shippingService?: string | null;
  shippingTotal?: string | null;
  paymentSetupError?: string | null;
};

function buildValidationErrors(
  form: typeof initialState,
  options: {
    selectedDestination: ShippingDestination | null;
    selectedRate: ShippingRateItem | null;
  },
) {
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
    if (!options.selectedDestination) {
      issues.push("Pilih tujuan pengiriman dari hasil pencarian ongkir.");
    }
    if (!form.city.trim()) {
      issues.push("Kota wajib diisi untuk pengiriman.");
    }
    if (!form.province.trim()) {
      issues.push("Provinsi wajib diisi untuk pengiriman.");
    }
    if (!options.selectedRate) {
      issues.push("Pilih layanan pengiriman sebelum checkout.");
    }
  }

  return issues;
}

function buildShippingServiceLabel(rate: ShippingRateItem) {
  return `${rate.courier_name} ${rate.service_code}`;
}

function buildShippingEtaLabel(rate: ShippingRateItem) {
  if (!rate.etd) {
    return "Estimasi mengikuti kurir";
  }

  return `Estimasi ${rate.etd}`;
}

export function CheckoutForm({ store }: { store?: StoreProfile | null }) {
  const { cart, clearCart } = useCart();
  const [form, setForm] = useState(initialState);
  const [destinationQuery, setDestinationQuery] = useState("");
  const deferredDestinationQuery = useDeferredValue(destinationQuery.trim());
  const [destinationResults, setDestinationResults] = useState<ShippingDestination[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<ShippingDestination | null>(null);
  const [shippingRates, setShippingRates] = useState<ShippingRateItem[]>([]);
  const [selectedShippingRateId, setSelectedShippingRateId] = useState<string | null>(null);
  const [isSearchingDestinations, setIsSearchingDestinations] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [destinationError, setDestinationError] = useState<string | null>(null);
  const [shippingRatesError, setShippingRatesError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const isDelivery = form.shippingMethod === "delivery";
  const selectedShippingRate = useMemo(
    () => shippingRates.find((item) => item.id === selectedShippingRateId) ?? null,
    [shippingRates, selectedShippingRateId],
  );

  const validationErrors = buildValidationErrors(form, {
    selectedDestination,
    selectedRate: selectedShippingRate,
  });
  const canSubmit = validationErrors.length === 0 && !isPending && !isLoadingRates;
  const submitLabel =
    form.paymentMethod === "COD" ? "Buat order COD" : "Buat order dan lanjut bayar";
  const shippingTotal = isDelivery ? selectedShippingRate?.cost ?? "0" : "0";
  const orderGrandTotal =
    Number.parseFloat(cart?.grand_total ?? "0") + Number.parseFloat(shippingTotal);
  const itemCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const totalWeightKg = Number(cart?.total_weight_grams ?? 0) / 1000;
  const pickupMapsUrl = store
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;

  useEffect(() => {
    if (!isDelivery) {
      setDestinationResults([]);
      setDestinationError(null);
      setShippingRatesError(null);
      return;
    }

    if (
      selectedDestination &&
      deferredDestinationQuery !== "" &&
      deferredDestinationQuery === selectedDestination.label
    ) {
      setDestinationResults([]);
      setDestinationError(null);
      return;
    }

    if (deferredDestinationQuery.length < 3) {
      setDestinationResults([]);
      if (deferredDestinationQuery.length === 0) {
        setDestinationError(null);
      }
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsSearchingDestinations(true);
      setDestinationError(null);

      try {
        const response = await searchShippingDestinations(deferredDestinationQuery);
        if (isCancelled) {
          return;
        }

        setDestinationResults(response.items);
        if (response.items.length === 0) {
          setDestinationError("Tujuan belum ditemukan. Coba kata kunci kecamatan atau kota lain.");
        }
      } catch (searchError) {
        if (isCancelled) {
          return;
        }

        setDestinationResults([]);
        setDestinationError(
          searchError instanceof Error
            ? searchError.message
            : "Pencarian tujuan belum berhasil.",
        );
      } finally {
        if (!isCancelled) {
          setIsSearchingDestinations(false);
        }
      }
    }, 260);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [deferredDestinationQuery, isDelivery, selectedDestination]);

  useEffect(() => {
    if (!isDelivery || !selectedDestination || !cart?.guest_token) {
      setShippingRates([]);
      setSelectedShippingRateId(null);
      setShippingRatesError(null);
      setIsLoadingRates(false);
      return;
    }

    let isCancelled = false;

    const loadRates = async () => {
      setIsLoadingRates(true);
      setShippingRatesError(null);

      try {
        const response = await getShippingRates(
          cart.id,
          cart.guest_token ?? "",
          selectedDestination.id,
        );

        if (isCancelled) {
          return;
        }

        setShippingRates(response.items);
        setSelectedShippingRateId((current) => {
          if (current && response.items.some((item) => item.id === current)) {
            return current;
          }

          return response.items[0]?.id ?? null;
        });

        if (response.items.length === 0) {
          setShippingRatesError("Belum ada layanan kirim yang tersedia untuk tujuan ini.");
        }
      } catch (ratesError) {
        if (isCancelled) {
          return;
        }

        setShippingRates([]);
        setSelectedShippingRateId(null);
        setShippingRatesError(
          ratesError instanceof Error
            ? ratesError.message
            : "Tarif pengiriman belum bisa dihitung.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingRates(false);
        }
      }
    };

    void loadRates();

    return () => {
      isCancelled = true;
    };
  }, [cart?.guest_token, cart?.id, isDelivery, selectedDestination]);

  if (result) {
    return (
      <section className="page-stack checkout-page">
        <div className="checkout-overview">
          <div className="checkout-overview__copy">
            <span className="eyebrow-label">Checkout selesai</span>
            <h1>Order {result.orderNumber} sudah tercatat.</h1>
            <p>
              Checkout berhasil diproses. Lanjutkan ke pembayaran online atau pantau status
              pesanan dari halaman lacak pesanan.
            </p>
          </div>
        </div>

        <div className="success-card">
          <span className="eyebrow-label">Ringkasan order</span>
          <strong>Total order: {formatCurrency(result.total)}</strong>
          {result.shippingService ? <p>Layanan kirim: {result.shippingService}</p> : null}
          {result.shippingTotal ? <p>Ongkir: {formatCurrency(result.shippingTotal)}</p> : null}
          <p>Status pembayaran: {result.paymentStatus}</p>
          <p>
            Langkah berikutnya:{" "}
            {result.nextAction === "OPEN_PAYMENT"
              ? "buka halaman pembayaran"
              : "tunggu konfirmasi pembayaran dari toko"}
          </p>
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
            <Link className="btn btn-secondary" href="/produk">
              Belanja lagi
            </Link>
          </div>
        </div>
      </section>
    );
  }

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

  const handleDestinationSelect = (destination: ShippingDestination) => {
    setSelectedDestination(destination);
    setDestinationQuery(destination.label);
    setDestinationResults([]);
    setDestinationError(null);
    setForm((current) => ({
      ...current,
      district: destination.district_name ?? current.district,
      city: destination.city_name ?? current.city,
      province: destination.province_name ?? current.province,
      postalCode: destination.zip_code ?? current.postalCode,
    }));
  };

  const handleGoogleAddressSelect = (selection: GoogleAddressSelection) => {
    setSelectedDestination(null);
    setDestinationResults([]);
    setShippingRates([]);
    setSelectedShippingRateId(null);
    setShippingRatesError(null);
    setDestinationError(null);
    setDestinationQuery(selection.destinationQuery);
    setForm((current) => ({
      ...current,
      addressLine: selection.addressLine || current.addressLine,
      district: selection.district || current.district,
      city: selection.city || current.city,
      province: selection.province || current.province,
      postalCode: selection.postalCode || current.postalCode,
    }));
  };

  return (
    <section className="page-stack checkout-page">
      <div className="checkout-overview">
        <div className="checkout-overview__copy">
          <span className="eyebrow-label">Checkout guest</span>
          <h1>Selesaikan pesanan dengan alur kirim dan bayar yang lebih jelas.</h1>
          <p>
            Isi data penerima, tentukan metode pengiriman, lalu review total order sebelum
            membuat pesanan ke backend yang sama dengan katalog publik.
          </p>
        </div>
        <div className="checkout-overview__stats">
          <div>
            <span>Produk</span>
            <strong>{itemCount}</strong>
          </div>
          <div>
            <span>Berat total</span>
            <strong>{totalWeightKg > 0 ? `${totalWeightKg.toFixed(2)} kg` : "-"}</strong>
          </div>
          <div>
            <span>Status checkout</span>
            <strong>{isDelivery ? "Delivery" : "Pickup toko"}</strong>
          </div>
        </div>
      </div>

      <div className="checkout-grid">
        <form
          className="form-card form-card--checkout"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            const issues = buildValidationErrors(form, {
              selectedDestination,
              selectedRate: selectedShippingRate,
            });
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
                  shippingSelection:
                    isDelivery && selectedDestination && selectedShippingRate
                      ? {
                          destinationId: selectedDestination.id,
                          destinationLabel: selectedDestination.label,
                          provinceName: selectedDestination.province_name ?? null,
                          cityName: selectedDestination.city_name ?? null,
                          districtName: selectedDestination.district_name ?? null,
                          subdistrictName: selectedDestination.subdistrict_name ?? null,
                          zipCode: selectedDestination.zip_code ?? null,
                          courierCode: selectedShippingRate.courier_code,
                          courierName: selectedShippingRate.courier_name,
                          serviceCode: selectedShippingRate.service_code,
                          serviceName: selectedShippingRate.service_name,
                          description: selectedShippingRate.description ?? null,
                          cost: selectedShippingRate.cost,
                          etd: selectedShippingRate.etd ?? null,
                        }
                      : undefined,
                  paymentMethod: form.paymentMethod,
                  notes: form.notes.trim(),
                });

                const baseResult: CheckoutResult = {
                  orderNumber: checkout.order.order_number,
                  paymentStatus: checkout.order.payment_status,
                  nextAction: checkout.next_action,
                  total: checkout.order.grand_total,
                  customerPhone: form.phone.trim(),
                  paymentUrl: null,
                  paymentSetupError: null,
                  shippingService: checkout.order.shipping_service ?? null,
                  shippingTotal: checkout.order.shipping_total ?? null,
                };

                let nextResult = baseResult;

                if (checkout.next_action === "OPEN_PAYMENT") {
                  try {
                    const payment = await createDuitkuPayment(checkout.order.id, {
                      customerPhone: form.phone.trim(),
                    });
                    nextResult = {
                      ...baseResult,
                      paymentUrl: payment.payment_url,
                    };
                  } catch (paymentError) {
                    nextResult = {
                      ...baseResult,
                      paymentSetupError:
                        paymentError instanceof Error
                          ? paymentError.message
                          : "Link pembayaran belum berhasil dibuat.",
                    };
                  }
                }

                setResult(nextResult);
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
          <div className="form-section">
            <div className="form-section__header">
              <span className="eyebrow-label">Data pelanggan</span>
              <h2>Informasi penerima</h2>
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
              <h2>Metode pengiriman</h2>
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
                <span>Isi alamat lengkap, pilih tujuan, lalu cek layanan kurir yang tersedia.</span>
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
                <span>Lebih ringkas jika Anda mengambil pesanan sendiri di toko.</span>
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

                <GooglePlacesAddressAssist
                  disabled={!isDelivery}
                  onSelect={handleGoogleAddressSelect}
                />

                <div className="destination-search">
                  <label className="catalog-search-card__field">
                    <span>Cari tujuan pengiriman</span>
                    <input
                      value={destinationQuery}
                      onChange={(event) => {
                        const nextValue = event.target.value;

                        setDestinationQuery(nextValue);
                        setSelectedDestination(null);
                        setShippingRates([]);
                        setSelectedShippingRateId(null);
                        setShippingRatesError(null);
                        if (nextValue.trim().length < 3) {
                          setDestinationResults([]);
                        }
                      }}
                      placeholder="Cari kecamatan, kota, atau kode pos"
                    />
                  </label>

                  {isSearchingDestinations ? (
                    <p className="inline-note">Mencari tujuan pengiriman...</p>
                  ) : null}

                  {destinationError ? <p className="form-error">{destinationError}</p> : null}

                  {destinationResults.length > 0 ? (
                    <div className="destination-results">
                      {destinationResults.map((destination) => (
                        <button
                          className={`destination-option ${
                            selectedDestination?.id === destination.id ? "is-selected" : ""
                          }`}
                          key={destination.id}
                          onClick={(event) => {
                            event.preventDefault();
                            handleDestinationSelect(destination);
                          }}
                          type="button"
                        >
                          <strong>{destination.label}</strong>
                          <span>
                            {destination.district_name ?? "Kecamatan"} •{" "}
                            {destination.city_name ?? "Kota"}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

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

                <div className="form-section">
                  <div className="form-section__header">
                    <span className="eyebrow-label">Ongkir</span>
                    <h2>Pilih layanan kirim</h2>
                  </div>

                  {selectedDestination ? (
                    <div className="panel-card panel-card--inline">
                      Tujuan terpilih: <strong>{selectedDestination.label}</strong>
                    </div>
                  ) : (
                    <div className="panel-card panel-card--inline">
                      Pilih tujuan pengiriman agar storefront bisa menghitung tarif ongkir.
                    </div>
                  )}

                  {isLoadingRates ? (
                    <p className="inline-note">Menghitung tarif pengiriman...</p>
                  ) : null}

                  {shippingRatesError ? <p className="form-error">{shippingRatesError}</p> : null}

                  {shippingRates.length > 0 ? (
                    <div className="shipping-rate-grid">
                      {shippingRates.map((rate) => (
                        <button
                          className={`shipping-rate-card ${
                            selectedShippingRateId === rate.id ? "is-selected" : ""
                          }`}
                          key={rate.id}
                          onClick={(event) => {
                            event.preventDefault();
                            setSelectedShippingRateId(rate.id);
                          }}
                          type="button"
                        >
                          <div>
                            <strong>{buildShippingServiceLabel(rate)}</strong>
                            <span>{rate.service_name}</span>
                          </div>
                          <div>
                            <strong>{formatCurrency(rate.cost)}</strong>
                            <span>{buildShippingEtaLabel(rate)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="panel-card panel-card--inline panel-card--store-pickup">
                <strong>Ambil pesanan langsung di toko</strong>
                <span>
                  {store?.name ?? "Kios Sidomakmur"}
                  {store?.address ? ` · ${store.address}` : ""}
                </span>
                {store?.operational_hours ? (
                  <span>Jam operasional: {store.operational_hours}</span>
                ) : null}
                {pickupMapsUrl ? (
                  <a href={pickupMapsUrl} rel="noreferrer" target="_blank">
                    Buka lokasi toko di Google Maps
                  </a>
                ) : null}
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="form-section__header">
              <span className="eyebrow-label">Pembayaran</span>
              <h2>Metode pembayaran</h2>
            </div>
            <div className="choice-grid">
              <label
                className={`choice-card ${form.paymentMethod === "duitku-va" ? "is-selected" : ""}`}
              >
                <input
                  checked={form.paymentMethod === "duitku-va"}
                  name="paymentMethod"
                  onChange={() =>
                    setForm((current) => ({ ...current, paymentMethod: "duitku-va" }))
                  }
                  type="radio"
                />
                <strong>Duitku VA</strong>
                <span>Pesanan dibuat dulu, lalu storefront menyiapkan link pembayaran.</span>
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
                <span>Pembayaran ditangani saat pesanan diterima atau setelah konfirmasi toko.</span>
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

          <button className="btn btn-primary btn-block" disabled={!canSubmit} type="submit">
            {isPending ? "Memproses..." : submitLabel}
          </button>
        </form>

        <aside className="summary-card summary-card--checkout">
          <span className="eyebrow-label">Ringkasan</span>
          <h2>{itemCount} item di order ini</h2>
          <div className="checkout-summary-list">
            {cart.items.map((item) => (
              <div className="checkout-summary-item" key={item.id}>
                <div className="checkout-summary-item__media">
                  {item.product_image_url ? (
                    <Image
                      alt={item.product_name || "Produk"}
                      fill
                      sizes="72px"
                      src={item.product_image_url}
                    />
                  ) : (
                    <div className="product-card__placeholder" />
                  )}
                </div>
                <div className="checkout-summary-item__copy">
                  {item.product_slug ? (
                    <Link href={`/produk/${item.product_slug}`}>{item.product_name || "Produk"}</Link>
                  ) : (
                    <strong>{item.product_name || "Produk"}</strong>
                  )}
                  <span>
                    {item.qty}x {item.product_unit || "unit"}
                  </span>
                </div>
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
          <div className="summary-row">
            <span>Ongkir</span>
            <strong>{isDelivery ? formatCurrency(shippingTotal) : "Diambil di toko"}</strong>
          </div>
          <div className="summary-row summary-row--total">
            <span>Total</span>
            <strong>{formatCurrency(orderGrandTotal)}</strong>
          </div>
          <div className="checkout-status-note">
            {isDelivery
              ? "Tombol submit aktif setelah data penerima, tujuan, dan layanan kirim sudah lengkap."
              : "Untuk pickup, cukup lengkapi data penerima lalu lanjutkan checkout."}
          </div>
        </aside>
      </div>
    </section>
  );
}
