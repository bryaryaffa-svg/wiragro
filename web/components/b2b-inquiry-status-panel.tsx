"use client";

import Link from "next/link";

import type { CustomerB2BInquiryPayload } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";

function buildInquiryContext(item: CustomerB2BInquiryPayload) {
  return [
    item.product_name ? `Produk: ${item.product_name}` : null,
    item.bundle_slug ? `Paket: ${item.bundle_slug}` : null,
    item.campaign_slug ? `Program: ${item.campaign_slug}` : null,
  ].filter(Boolean);
}

export function B2BInquiryStatusPanel({
  items,
  isLoading = false,
}: {
  items: CustomerB2BInquiryPayload[];
  isLoading?: boolean;
}) {
  return (
    <section className="panel-card account-panel-section">
      <div className="account-panel-section__header">
        <div>
          <span className="eyebrow-label">Inquiry & quote B2B</span>
          <h3>Perkembangan inquiry B2B</h3>
        </div>
        <Link className="btn btn-secondary" href="/b2b">
          Ajukan inquiry baru
        </Link>
      </div>

      {isLoading && !items.length ? <p className="inline-note">Memuat inquiry B2B...</p> : null}

      <div className="account-b2b-grid">
        {items.length ? (
          items.map((item) => {
            const contextLines = buildInquiryContext(item);

            return (
              <article className="account-b2b-card" key={item.id}>
                <div className="account-b2b-card__head">
                  <div>
                    <span className="eyebrow-label">{item.inquiry_number}</span>
                    <strong>{item.status_label}</strong>
                  </div>
                  <span className="account-b2b-card__status">{item.buyer_type_label}</span>
                </div>

                <p>{item.status_description}</p>

                <div className="account-b2b-card__meta">
                  <div>
                    <span>Dibuat</span>
                    <strong>{item.created_at ? formatDate(item.created_at) : "-"}</strong>
                  </div>
                  <div>
                    <span>Follow-up</span>
                    <strong>{item.preferred_follow_up}</strong>
                  </div>
                  <div>
                    <span>Komoditas</span>
                    <strong>{item.commodity_focus || "-"}</strong>
                  </div>
                  <div>
                    <span>Estimasi</span>
                    <strong>
                      {item.quote.total_amount ? formatCurrency(item.quote.total_amount) : "Belum ada"}
                    </strong>
                  </div>
                </div>

                {contextLines.length ? (
                  <div className="account-b2b-card__context">
                    {contextLines.map((line) => (
                      <small key={`${item.id}-${line}`}>{line}</small>
                    ))}
                  </div>
                ) : null}

                <div className="account-b2b-card__items">
                  <strong>Item kebutuhan</strong>
                  <ul className="plain-list">
                    {item.requested_items.slice(0, 3).map((requestedItem, requestedItemIndex) => (
                      <li key={`${item.id}-${requestedItemIndex}-${requestedItem.label}`}>
                        {requestedItem.label}
                        {requestedItem.qty ? ` (${requestedItem.qty}` : ""}
                        {requestedItem.unit ? ` ${requestedItem.unit}` : requestedItem.qty ? ")" : ""}
                        {requestedItem.qty && !requestedItem.unit ? ")" : ""}
                      </li>
                    ))}
                  </ul>
                </div>

                {item.quote.has_estimate ? (
                  <div className="account-b2b-card__quote">
                    {item.quote.items.length ? (
                      <div className="account-b2b-card__items">
                        <strong>Draft item quote</strong>
                        <ul className="plain-list">
                          {item.quote.items.slice(0, 3).map((quoteItem, quoteItemIndex) => (
                            <li key={`${item.id}-quote-${quoteItemIndex}-${quoteItem.label}`}>
                              {quoteItem.label}
                              {quoteItem.line_estimate_amount
                                ? ` - ${formatCurrency(quoteItem.line_estimate_amount)}`
                                : quoteItem.unit_estimate_amount
                                  ? ` - ${formatCurrency(quoteItem.unit_estimate_amount)}/item`
                                  : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    <div>
                      <span>Subtotal estimasi</span>
                      <strong>
                        {item.quote.subtotal_amount
                          ? formatCurrency(item.quote.subtotal_amount)
                          : "-"}
                      </strong>
                    </div>
                    <div>
                      <span>Ongkir estimasi</span>
                      <strong>
                        {item.quote.shipping_amount
                          ? formatCurrency(item.quote.shipping_amount)
                          : "-"}
                      </strong>
                    </div>
                    {item.quote.sales_note ? <p>{item.quote.sales_note}</p> : null}
                  </div>
                ) : (
                  <div className="panel-card panel-card--inline">
                    Estimasi awal belum tersedia. Tim Wiragro masih meninjau inquiry ini.
                  </div>
                )}
              </article>
            );
          })
        ) : (
          <div className="panel-card panel-card--inline">
            Belum ada inquiry B2B di akun ini. Saat Anda mengirim inquiry sambil login, status
            dan estimasi kebutuhan akan muncul di sini.
          </div>
        )}
      </div>
    </section>
  );
}
