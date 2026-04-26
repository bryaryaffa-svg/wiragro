"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { useCart } from "@/components/cart/cart-provider";
import { MinimumOrderNotice } from "@/components/minimum-order-notice";
import { TrustStrip } from "@/components/trust-strip";
import {
  GooglePlacesAddressAssist,
  type GoogleAddressSelection,
} from "@/components/google-places-address-assist";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PermissionCodeInput } from "@/components/ui/permission-code-input";
import { canUseCod, resolveAccountRole } from "@/lib/account-role";
import { trackUiEvent } from "@/lib/analytics";
import {
  addItemToCustomerCart,
  createDuitkuPayment,
  getCustomerAccount,
  getCustomerCart,
  getShippingRates,
  searchShippingDestinations,
  submitCustomerCheckout,
  type CartPayload,
  type CustomerAddressPayload,
  type ShippingDestination,
  type ShippingRateItem,
  type StoreProfile,
  updateCustomerCartItem,
} from "@/lib/api";
import {
  evaluateCheckoutEligibility,
  validateCheckoutPermissionCode,
} from "@/lib/distributor-checkout";
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
  customerPhone: string;
  nextAction: string;
  orderNumber: string;
  paymentSetupError?: string | null;
  paymentStatus: string;
  paymentUrl?: string | null;
  shippingService?: string | null;
  shippingTotal?: string | null;
  total: string;
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

async function syncCheckoutCartToAccount(
  accessToken: string,
  guestCart: CartPayload,
) {
  const customerCart = await getCustomerCart(accessToken);
  const guestItemsByProductId = new Map(
    guestCart.items.map((item) => [item.product_id, item]),
  );
  const customerItemsByProductId = new Map(
    customerCart.items.map((item) => [item.product_id, item]),
  );

  for (const guestItem of guestCart.items) {
    const existing = customerItemsByProductId.get(guestItem.product_id);

    if (!existing) {
      await addItemToCustomerCart(accessToken, guestItem.product_id, guestItem.qty);
      continue;
    }

    if (existing.qty !== guestItem.qty) {
      await updateCustomerCartItem(accessToken, existing.id, guestItem.qty);
    }
  }

  for (const customerItem of customerCart.items) {
    if (!guestItemsByProductId.has(customerItem.product_id)) {
      await updateCustomerCartItem(accessToken, customerItem.id, 0);
    }
  }

  return getCustomerCart(accessToken);
}

export function CheckoutForm({ store }: { store?: StoreProfile | null }) {
  const router = useRouter();
  const { session, isReady: isAuthReady } = useAuth();
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
  const [savedAddresses, setSavedAddresses] = useState<CustomerAddressPayload[]>([]);
  const [savedAddressError, setSavedAddressError] = useState<string | null>(null);
  const [isLoadingSavedAddresses, setIsLoadingSavedAddresses] = useState(false);
  const [checkoutCartSnapshot, setCheckoutCartSnapshot] = useState<CartPayload | null>(null);
  const [checkoutSyncError, setCheckoutSyncError] = useState<string | null>(null);
  const [isSyncingCheckoutCart, setIsSyncingCheckoutCart] = useState(false);
  const [permissionCode, setPermissionCode] = useState("");
  const [permissionValidated, setPermissionValidated] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<"idle" | "invalid" | "valid" | "validating">("idle");
  const [permissionMessage, setPermissionMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const hasPrefilledCustomerRef = useRef(false);
  const hasAppliedDefaultAddressRef = useRef(false);
  const hasRedirectedRef = useRef(false);

  const isDelivery = form.shippingMethod === "delivery";
  const selectedShippingRate = useMemo(
    () => shippingRates.find((item) => item.id === selectedShippingRateId) ?? null,
    [shippingRates, selectedShippingRateId],
  );

  const validationErrors = buildValidationErrors(form, {
    selectedDestination,
    selectedRate: selectedShippingRate,
  });

  const effectiveProvince = isDelivery ? form.province : "Jawa Timur";
  const activeCheckoutCart = checkoutCartSnapshot ?? cart;
  const subtotalAmount = Number.parseFloat(activeCheckoutCart?.grand_total ?? "0");
  const eligibility = evaluateCheckoutEligibility({
    permissionValidated,
    province: effectiveProvince,
    session,
    subtotal: subtotalAmount,
  });
  const availablePaymentMethods = eligibility.allowedPaymentMethods;
  const canSubmit =
    Boolean(session) &&
    validationErrors.length === 0 &&
    !isPending &&
    !isLoadingRates &&
    !isSyncingCheckoutCart &&
    !checkoutSyncError &&
    eligibility.canCheckout;
  const submitLabel =
    form.paymentMethod === "COD" ? "Buat order COD" : "Bayar Sekarang";
  const shippingTotal = isDelivery ? selectedShippingRate?.cost ?? "0" : "0";
  const orderGrandTotal = subtotalAmount + Number.parseFloat(shippingTotal);
  const itemCount = cart?.items.reduce((total, item) => total + item.qty, 0) ?? 0;
  const totalWeightKg = Number(cart?.total_weight_grams ?? 0) / 1000;
  const pickupMapsUrl = store
    ? buildGoogleMapsStoreSearchUrl(store.name, store.address)
    : null;

  function applySavedAddress(address: CustomerAddressPayload) {
    setForm((current) => ({
      ...current,
      fullName: current.fullName || address.recipient_name,
      phone: current.phone || address.recipient_phone,
      addressLine: address.address_line || current.addressLine,
      district: address.district || current.district,
      city: address.city || current.city,
      province: address.province || current.province,
      postalCode: address.postal_code || current.postalCode,
    }));
    setDestinationQuery(
      [address.district, address.city, address.province].filter(Boolean).join(", "),
    );
    setSelectedDestination(null);
    setDestinationResults([]);
    setShippingRates([]);
    setSelectedShippingRateId(null);
    setDestinationError(null);
    setShippingRatesError(null);
  }

  useEffect(() => {
    if (!isAuthReady || session || hasRedirectedRef.current) {
      return;
    }

    hasRedirectedRef.current = true;
    router.replace("/masuk?next=/checkout");
  }, [isAuthReady, router, session]);

  useEffect(() => {
    if (!availablePaymentMethods.some((item) => item.code === form.paymentMethod)) {
      setForm((current) => ({
        ...current,
        paymentMethod: availablePaymentMethods[0]?.code ?? "duitku-va",
      }));
    }
  }, [availablePaymentMethods, form.paymentMethod]);

  useEffect(() => {
    if (!eligibility.requiresPermissionCode) {
      setPermissionCode("");
      setPermissionValidated(false);
      setPermissionStatus("idle");
      setPermissionMessage(null);
    }
  }, [eligibility.requiresPermissionCode]);

  useEffect(() => {
    if (!session) {
      setSavedAddresses([]);
      setSavedAddressError(null);
      hasPrefilledCustomerRef.current = false;
      hasAppliedDefaultAddressRef.current = false;
      return;
    }

    if (hasPrefilledCustomerRef.current) {
      return;
    }

    hasPrefilledCustomerRef.current = true;
    setForm((current) => ({
      ...current,
      fullName: current.fullName || session.customer.full_name || "",
      phone: current.phone || session.customer.phone || "",
      email: current.email || session.customer.email || "",
    }));
  }, [session]);

  useEffect(() => {
    if (!session?.access_token) {
      return;
    }

    let isCancelled = false;

    const loadSavedAddresses = async () => {
      setIsLoadingSavedAddresses(true);
      setSavedAddressError(null);

      try {
        const account = await getCustomerAccount(session.access_token);

        if (isCancelled) {
          return;
        }

        setSavedAddresses(account.addresses);

        const defaultAddress =
          account.addresses.find((item) => item.is_default) ?? account.addresses[0] ?? null;

        if (defaultAddress && !hasAppliedDefaultAddressRef.current) {
          hasAppliedDefaultAddressRef.current = true;
          applySavedAddress(defaultAddress);
        }
      } catch (accountError) {
        if (isCancelled) {
          return;
        }

        setSavedAddresses([]);
        setSavedAddressError(
          accountError instanceof Error
            ? accountError.message
            : "Alamat tersimpan belum berhasil dimuat.",
        );
      } finally {
        if (!isCancelled) {
          setIsLoadingSavedAddresses(false);
        }
      }
    };

    void loadSavedAddresses();

    return () => {
      isCancelled = true;
    };
  }, [session?.access_token]);

  useEffect(() => {
    if (!session?.access_token || !cart?.items.length) {
      setCheckoutCartSnapshot(null);
      setCheckoutSyncError(null);
      setIsSyncingCheckoutCart(false);
      return;
    }

    let isCancelled = false;

    const syncCart = async () => {
      setIsSyncingCheckoutCart(true);
      setCheckoutSyncError(null);

      try {
        const syncedCart = await syncCheckoutCartToAccount(session.access_token, cart);

        if (!isCancelled) {
          setCheckoutCartSnapshot(syncedCart);
        }
      } catch (syncError) {
        if (!isCancelled) {
          setCheckoutSyncError(
            syncError instanceof Error
              ? syncError.message
              : "Gagal memuat aturan akun untuk checkout.",
          );
          setCheckoutCartSnapshot(null);
        }
      } finally {
        if (!isCancelled) {
          setIsSyncingCheckoutCart(false);
        }
      }
    };

    void syncCart();

    return () => {
      isCancelled = true;
    };
  }, [cart, session?.access_token]);

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

  if (!isAuthReady) {
    return (
      <LoadingSkeleton
        cards={2}
        eyebrow="Checkout Wiragro"
        title="Memeriksa sesi akun Anda..."
      />
    );
  }

  if (!session) {
    return (
      <section className="empty-state empty-state--shopping">
        <span className="eyebrow-label">Checkout</span>
        <h1>Masuk untuk melanjutkan checkout</h1>
        <p>Checkout wajib login. Setelah masuk, Anda akan diarahkan kembali ke halaman checkout.</p>
        <div className="empty-state__actions">
          <Link className="btn btn-primary" href="/masuk?next=/checkout">
            Masuk / Daftar
          </Link>
          <Link className="btn btn-secondary" href="/keranjang">
            Kembali ke keranjang
          </Link>
        </div>
      </section>
    );
  }

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
              : "tunggu konfirmasi pembayaran dari tim Wiragro"}
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
          <span className="eyebrow-label">Checkout akun</span>
          <h1>Selesaikan pesanan dengan aturan akun yang lebih jelas.</h1>
          <p>
            Login sudah aktif. Harga akun, metode pembayaran, dan minimum pembelian akan
            menyesuaikan peran akun Anda saat checkout diproses.
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
            <span>Mode akun</span>
            <strong>{resolveAccountRole(session) === "distributor" ? "Akun khusus" : "Pelanggan"}</strong>
          </div>
        </div>
      </div>

      <div className="panel-card checkout-account-note">
        <strong>Akun Anda aktif di browser ini.</strong>
        <span>
          Checkout memeriksa ulang role, harga akun, minimum order, kode izin, dan metode
          pembayaran sebelum pesanan dibuat.
        </span>
      </div>

      <MinimumOrderNotice eligibility={eligibility} />

      {checkoutSyncError ? (
        <div className="panel-card panel-card--danger">
          <strong>Role akun belum berhasil dimuat.</strong>
          <p>
            {checkoutSyncError}. Untuk keamanan, UI sementara memakai mode pelanggan biasa dan
            checkout ditahan sampai sinkronisasi berhasil.
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => window.location.reload()}
            type="button"
          >
            Coba lagi
          </button>
        </div>
      ) : null}

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

            if (!eligibility.canCheckout) {
              setError(eligibility.summary);
              return;
            }

            startTransition(async () => {
              try {
                if (!session.access_token) {
                  throw new Error("Sesi akun tidak ditemukan.");
                }

                const syncedCart = await syncCheckoutCartToAccount(session.access_token, cart);
                setCheckoutCartSnapshot(syncedCart);

                trackUiEvent("checkout_started", {
                  item_count: cart.items.length,
                  region: eligibility.region,
                  role: resolveAccountRole(session),
                  subtotal: syncedCart.grand_total,
                });

                const checkout = await submitCustomerCheckout(session.access_token, {
                  shippingMethod: form.shippingMethod as "pickup" | "delivery",
                  fullName: form.fullName.trim(),
                  phone: form.phone.trim(),
                  email: form.email.trim(),
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
                      accessToken: session.access_token,
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
                <span>Lebih ringkas jika Anda mengambil pesanan sendiri di lokasi layanan.</span>
              </label>
            </div>

            <div className="panel-card checkout-address-book">
              <div className="checkout-address-book__header">
                <div>
                  <span className="eyebrow-label">Alamat tersimpan</span>
                  <strong>Gunakan alamat tersimpan agar form lebih cepat terisi.</strong>
                </div>
                <Link className="btn btn-secondary" href="/akun">
                  Kelola alamat
                </Link>
              </div>

              {isLoadingSavedAddresses ? <p className="inline-note">Memuat alamat tersimpan...</p> : null}
              {savedAddressError ? <p className="inline-note">{savedAddressError}</p> : null}

              {savedAddresses.length ? (
                <div className="checkout-address-book__grid">
                  {savedAddresses.map((address) => (
                    <article className="checkout-address-card" key={address.id}>
                      <div className="checkout-address-card__head">
                        <strong>{address.label}</strong>
                        {address.is_default ? <span>Default</span> : null}
                      </div>
                      <p>{address.recipient_name}</p>
                      <p>{address.recipient_phone}</p>
                      <p>
                        {[address.address_line, address.district, address.city, address.province]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                      <button
                        className="btn btn-secondary"
                        onClick={() => applySavedAddress(address)}
                        type="button"
                      >
                        Gunakan alamat ini
                      </button>
                    </article>
                  ))}
                </div>
              ) : !isLoadingSavedAddresses ? (
                <p className="inline-note">
                  Belum ada alamat tersimpan. Simpan alamat dari halaman akun untuk mempercepat
                  repeat order berikutnya.
                </p>
              ) : null}
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
                            {destination.district_name ?? "Kecamatan"} ·{" "}
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
                      Pilih tujuan pengiriman agar ongkir bisa dihitung dengan tepat.
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
                <strong>Ambil pesanan langsung di lokasi layanan</strong>
                <span>
                  {store?.name ?? "Wiragro"}
                  {store?.address ? ` - ${store.address}` : ""}
                </span>
                {store?.operational_hours ? (
                  <span>Jam layanan: {store.operational_hours}</span>
                ) : null}
                {pickupMapsUrl ? (
                  <a href={pickupMapsUrl} rel="noreferrer" target="_blank">
                    Buka lokasi di Google Maps
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
              {availablePaymentMethods.map((method) => (
                <label
                  className={`choice-card ${form.paymentMethod === method.code ? "is-selected" : ""}`}
                  key={method.code}
                >
                  <input
                    checked={form.paymentMethod === method.code}
                    name="paymentMethod"
                    onChange={() =>
                      setForm((current) => ({ ...current, paymentMethod: method.code }))
                    }
                    type="radio"
                  />
                  <strong>{method.label}</strong>
                  <span>
                    {method.code === "COD"
                      ? "COD hanya tersedia untuk akun yang memenuhi aturan checkout."
                      : "Pesanan dibuat lebih dulu, lalu Anda menerima link pembayaran."}
                  </span>
                </label>
              ))}
            </div>

            {!canUseCod(session) ? (
              <p className="inline-note">
                COD tidak muncul pada akun pelanggan biasa.
              </p>
            ) : null}

            {eligibility.requiresPermissionCode ? (
              <PermissionCodeInput
                helperText="Pembelian luar Jawa membutuhkan kode izin dari admin."
                isValidated={permissionValidated}
                isValidating={permissionStatus === "validating"}
                onChange={(value) => {
                  setPermissionCode(value);
                  setPermissionValidated(false);
                  setPermissionStatus("idle");
                  setPermissionMessage(null);
                }}
                onValidate={() => {
                  setPermissionStatus("validating");
                  void validateCheckoutPermissionCode(permissionCode).then((response) => {
                    setPermissionValidated(response.valid);
                    setPermissionStatus(response.valid ? "valid" : "invalid");
                    setPermissionMessage(response.message ?? null);
                  });
                }}
                statusMessage={permissionMessage ?? undefined}
                value={permissionCode}
              />
            ) : null}

            <label>
              Catatan order
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({ ...current, notes: event.target.value }))
                }
                placeholder="Opsional: catatan tambahan untuk tim Wiragro"
              />
            </label>
          </div>

          {error ? <p className="form-error">{error}</p> : null}
          {validationErrors.length > 0 && !error ? (
            <p className="inline-note">Lengkapi data wajib sebelum melanjutkan checkout.</p>
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
            <strong>{formatCurrency(activeCheckoutCart?.subtotal ?? cart.subtotal)}</strong>
          </div>
          <div className="summary-row">
            <span>Diskon</span>
            <strong>{formatCurrency(activeCheckoutCart?.discount_total ?? cart.discount_total)}</strong>
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
            {isSyncingCheckoutCart
              ? "Menyelaraskan keranjang ke akun Anda..."
              : "Harga akun, aturan COD, minimum order, dan kode izin akan dicek ulang saat checkout diproses."}
          </div>
        </aside>
      </div>

      <TrustStrip
        description="Checkout fokus pada pengiriman, pembayaran, dan aturan akun tanpa menambahkan jalur WhatsApp yang mengganggu tahap akhir transaksi."
        heading="Lapisan trust tetap terlihat tanpa mengalihkan perhatian dari penyelesaian order."
        store={store}
      />
    </section>
  );
}
