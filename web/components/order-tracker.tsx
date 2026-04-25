"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { useAuth } from "@/components/auth-provider";
import { OrderReviewActionGroup } from "@/components/order-review-action-group";
import { TrustStrip } from "@/components/trust-strip";
import {
  getCustomerOrders,
  trackOrder,
  type CustomerOrderSummaryPayload,
  type StoreProfile,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

export function OrderTracker({ store }: { store?: StoreProfile | null }) {
  const searchParams = useSearchParams();
  const { session, isReady } = useAuth();
  const queryOrder = searchParams.get("order") ?? "";
  const queryPhone = searchParams.get("phone") ?? "";
  const [orderNumber, setOrderNumber] = useState(queryOrder);
  const [phone, setPhone] = useState(queryPhone);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);
  const [matchedCustomerOrder, setMatchedCustomerOrder] = useState<CustomerOrderSummaryPayload | null>(null);
  const [reviewLookupError, setReviewLookupError] = useState<string | null>(null);
  const [isReviewLookupLoading, setIsReviewLookupLoading] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setOrderNumber(queryOrder);
    setPhone(queryPhone);
  }, [queryOrder, queryPhone]);

  useEffect(() => {
    if (!queryOrder || !queryPhone) {
      return;
    }

    startTransition(async () => {
      try {
        const nextResult = await trackOrder(queryOrder, queryPhone);
        setResult(nextResult);
        setError(null);
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : "Pesanan tidak dapat ditemukan",
        );
      }
    });
  }, [queryOrder, queryPhone]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!session?.access_token || !result?.order_number) {
      setMatchedCustomerOrder(null);
      setReviewLookupError(null);
      setIsReviewLookupLoading(false);
      return;
    }

    let isCancelled = false;
    setIsReviewLookupLoading(true);

    void getCustomerOrders(session.access_token, 50)
      .then((payload) => {
        if (isCancelled) {
          return;
        }

        setMatchedCustomerOrder(
          payload.items.find((item) => item.order_number === result.order_number) ?? null,
        );
        setReviewLookupError(null);
      })
      .catch((fetchError) => {
        if (isCancelled) {
          return;
        }

        setMatchedCustomerOrder(null);
        setReviewLookupError(
          fetchError instanceof Error
            ? fetchError.message
            : "Pesanan ini belum bisa dicocokkan untuk review.",
        );
      })
      .finally(() => {
        if (!isCancelled) {
          setIsReviewLookupLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isReady, result?.order_number, session?.access_token]);

  return (
    <section className="tracker-layout page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Tracking pesanan</span>
        <h1>Lacak order tanpa harus login</h1>
        <p>Masukkan nomor order dan WhatsApp yang dipakai saat checkout untuk melihat status terbaru.</p>
      </div>

      <div className="tracker-card">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            setError(null);

            startTransition(async () => {
              try {
                const nextResult = await trackOrder(orderNumber, phone);
                setResult(nextResult);
              } catch (fetchError) {
                setError(
                  fetchError instanceof Error
                    ? fetchError.message
                    : "Pesanan tidak dapat ditemukan",
                );
              }
            });
          }}
        >
          <label>
            Nomor order
            <input
              required
              value={orderNumber}
              onChange={(event) => setOrderNumber(event.target.value)}
            />
          </label>
          <label>
            No. WhatsApp
            <input required value={phone} onChange={(event) => setPhone(event.target.value)} />
          </label>
          <button className="btn btn-primary" disabled={isPending} type="submit">
            {isPending ? "Mencari..." : "Lacak pesanan"}
          </button>
        </form>

        {error ? <p className="form-error">{error}</p> : null}

        {result ? (
          <article className="tracking-result">
            <div className="tracking-result__headline">
              <span className="eyebrow-label">{result.order_number}</span>
              <h2>{result.status}</h2>
            </div>
            <div className="tracking-grid">
              <div>
                <span>Status pembayaran</span>
                <strong>{result.payment_status}</strong>
              </div>
              <div>
                <span>Status fulfillment</span>
                <strong>{result.fulfillment_status}</strong>
              </div>
              <div>
                <span>Nomor shipment</span>
                <strong>{result.shipment.shipment_number || "-"}</strong>
              </div>
              <div>
                <span>Resi</span>
                <strong>{result.shipment.tracking_number || "-"}</strong>
              </div>
            </div>
            <div className="tracking-timeline">
              <div>
                <span>Invoice tersedia</span>
                <strong>{result.invoices.length} dokumen</strong>
              </div>
              <div>
                <span>Pembaruan terakhir</span>
                <strong>{formatDate(new Date())}</strong>
              </div>
            </div>

            {result.payment_status === "PAID" ? (
              <div className="tracking-review-panel">
                {!isReady ? null : !session ? (
                  <div className="panel-card panel-card--inline">
                    <strong>Masuk untuk memberi review.</strong>
                    <p>
                      Review terverifikasi hanya tersedia dari akun yang terkait dengan
                      pembelian ini.
                    </p>
                    <Link className="btn btn-primary" href={`/akun?reviewOrder=${encodeURIComponent(result.order_number)}`}>
                      Login & buka order ini
                    </Link>
                  </div>
                ) : isReviewLookupLoading ? (
                  <div className="panel-card panel-card--inline">
                    Menyiapkan status review untuk pesanan ini...
                  </div>
                ) : matchedCustomerOrder ? (
                  <OrderReviewActionGroup
                    highlight
                    orderNumber={matchedCustomerOrder.order_number}
                    reviewSummary={matchedCustomerOrder.review_summary}
                  />
                ) : (
                  <div className="panel-card panel-card--inline">
                    <strong>Order ini belum tersambung ke akun aktif.</strong>
                    <p>
                      Masuk dengan akun yang sama seperti saat checkout, lalu buka halaman
                      akun untuk menulis review terverifikasi.
                    </p>
                    <div className="homepage-trust-panel__actions">
                      <Link className="btn btn-secondary" href={`/akun?reviewOrder=${encodeURIComponent(result.order_number)}`}>
                        Buka akun
                      </Link>
                    </div>
                    {reviewLookupError ? <small>{reviewLookupError}</small> : null}
                  </div>
                )}
              </div>
            ) : (
              <div className="panel-card panel-card--inline">
                Review terverifikasi aktif setelah pembayaran order ini lunas.
              </div>
            )}
          </article>
        ) : null}
      </div>

      <TrustStrip
        description="Sesudah pesanan dibuat, pembeli tetap perlu tahu bagaimana bantuan layanan, pengiriman, dan jalur komplain bekerja agar rasa aman tetap terjaga."
        heading="Tracking pesanan juga harus memperkuat trust, bukan hanya menampilkan status."
        store={store}
      />
    </section>
  );
}
