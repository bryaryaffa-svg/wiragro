"use client";

import { useState, useTransition } from "react";

import { trackOrder } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function OrderTracker() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <section className="tracker-layout">
      <div className="page-intro">
        <span className="eyebrow-label">Tracking Pesanan</span>
        <h1>Lacak order tanpa harus login</h1>
        <p>
          Masukkan nomor order dan nomor WhatsApp yang dipakai saat checkout guest.
        </p>
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
    </section>
  );
}
