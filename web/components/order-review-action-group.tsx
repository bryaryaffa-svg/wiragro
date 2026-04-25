"use client";

import Link from "next/link";

import type {
  CustomerOrderReviewItemPayload,
  CustomerOrderReviewSummaryPayload,
} from "@/lib/api";

type OrderReviewActionGroupProps = {
  reviewSummary?: CustomerOrderReviewSummaryPayload | null;
  orderNumber?: string;
  highlight?: boolean;
  compact?: boolean;
};

function buildReviewHref(item: CustomerOrderReviewItemPayload) {
  if (!item.product_slug) {
    return "/produk";
  }

  return `/produk/${item.product_slug}#review-terverifikasi`;
}

function getReviewStateMeta(item: CustomerOrderReviewItemPayload) {
  switch (item.state) {
    case "approved":
      return {
        badge: "Sudah tayang",
        tone: "approved",
        actionLabel: "Lihat review",
        description:
          item.existing_review?.title || "Review produk ini sudah tampil di halaman produk.",
      };
    case "pending":
      return {
        badge: "Menunggu moderasi",
        tone: "pending",
        actionLabel: item.can_write_review ? "Perbarui review" : null,
        description:
          item.existing_review?.title ||
          "Review sudah dikirim dan sedang menunggu moderasi ringan.",
      };
    case "needs_update":
      return {
        badge: "Perlu revisi",
        tone: "needs-update",
        actionLabel: "Perbarui review",
        description:
          item.existing_review?.moderation_note ||
          "Review bisa diperbarui lalu dikirim ulang untuk moderasi.",
      };
    case "awaiting_payment":
      return {
        badge: "Aktif setelah lunas",
        tone: "awaiting-payment",
        actionLabel: null,
        description: "Review baru dibuka setelah pembayaran order ini lunas.",
      };
    default:
      return {
        badge: "Siap direview",
        tone: "ready",
        actionLabel: "Beri review",
        description: "Pembelian ini sudah memenuhi syarat review terverifikasi.",
      };
  }
}

function buildSummaryCopy(
  reviewSummary: CustomerOrderReviewSummaryPayload,
  orderNumber?: string,
  compact?: boolean,
) {
  const prefix = orderNumber ? `Order ${orderNumber}` : "Order ini";

  if (!reviewSummary.items.length) {
    return {
      title: "Belum ada item reviewable",
      body: `${prefix} belum punya item produk yang bisa dipakai untuk review.`,
    };
  }

  if (!reviewSummary.order_eligible) {
    return {
      title: "Review aktif setelah pembayaran lunas",
      body: compact
        ? `${prefix} belum bisa direview karena pembayaran belum lunas.`
        : `${prefix} baru membuka review setelah pembayaran lunas, supaya social proof tetap berasal dari pembelian terverifikasi.`,
    };
  }

  if (reviewSummary.ready_item_count > 0) {
    return {
      title: `${reviewSummary.ready_item_count} produk siap direview`,
      body: compact
        ? `${prefix} sudah punya produk yang bisa langsung diberi review.`
        : `${prefix} sudah punya produk yang memenuhi syarat review. Buka produk terkait untuk menulis pengalaman pakai Anda.`,
    };
  }

  if (reviewSummary.needs_update_item_count > 0) {
    return {
      title: `${reviewSummary.needs_update_item_count} review perlu diperbarui`,
      body: `${prefix} punya review yang bisa disunting lalu dikirim ulang ke moderasi.`,
    };
  }

  if (reviewSummary.pending_item_count > 0) {
    return {
      title: `${reviewSummary.pending_item_count} review sedang dimoderasi`,
      body: `${prefix} sudah mengirim review dan sedang menunggu moderasi ringan.`,
    };
  }

  return {
    title: `${reviewSummary.approved_item_count} review sudah tayang`,
    body: `${prefix} sudah punya review yang tayang di halaman produk.`,
  };
}

export function OrderReviewActionGroup({
  reviewSummary,
  orderNumber,
  highlight = false,
  compact = false,
}: OrderReviewActionGroupProps) {
  if (!reviewSummary?.items.length) {
    return null;
  }

  const summaryCopy = buildSummaryCopy(reviewSummary, orderNumber, compact);

  return (
    <div className={`order-review-panel${highlight ? " order-review-panel--highlight" : ""}`}>
      <div className="order-review-panel__header">
        <div>
          <span className="eyebrow-label">Review terverifikasi</span>
          <strong>{summaryCopy.title}</strong>
          <p>{summaryCopy.body}</p>
        </div>
      </div>

      <div className="order-review-panel__items">
        {reviewSummary.items.map((item) => {
          const stateMeta = getReviewStateMeta(item);
          const href = buildReviewHref(item);

          return (
            <article className="order-review-item" key={`${orderNumber ?? "order"}-${item.product_id}`}>
              <div className="order-review-item__copy">
                <div className="order-review-item__head">
                  <strong>{item.product_name || "Produk dari order ini"}</strong>
                  <span className={`order-review-item__badge order-review-item__badge--${stateMeta.tone}`}>
                    {stateMeta.badge}
                  </span>
                </div>
                <p>{stateMeta.description}</p>
                {item.existing_review?.moderation_note && item.state !== "needs_update" ? (
                  <small>{item.existing_review.moderation_note}</small>
                ) : null}
              </div>

              {stateMeta.actionLabel ? (
                <Link className="order-review-item__action" href={href}>
                  {stateMeta.actionLabel}
                </Link>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
