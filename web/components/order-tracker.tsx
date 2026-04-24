"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { TrustStrip } from "@/components/trust-strip";
import { trackOrder, type StoreProfile } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function OrderTracker({ store }: { store?: StoreProfile | null }) {
  const searchParams = useSearchParams();
  const queryOrder = searchParams.get("order") ?? "";
  const queryPhone = searchParams.get("phone") ?? "";
  const [orderNumber, setOrderNumber] = useState(queryOrder);
  const [phone, setPhone] = useState(queryPhone);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);
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

  return (
    <section className="tracker-layout page-stack">
      <div className="page-intro page-intro--compact">
        <span className="eyebrow-label">Tracking pesanan</span>
        <h1>Lacak order tanpa harus login</h1>
        <p>Masukkan nomor order dan WhatsApp yang dipakai saat checkout guest.</p>
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
          </article>
        ) : null}
      </div>

      <TrustStrip
        description="Sesudah order dibuat, user tetap perlu tahu bagaimana bantuan toko, pengiriman, dan jalur komplain bekerja agar rasa aman tidak hilang setelah checkout."
        heading="Tracking pesanan juga harus memperkuat trust, bukan hanya menampilkan status."
        store={store}
      />
    </section>
  );
}
