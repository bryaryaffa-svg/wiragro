"use client";

import Link from "next/link";

import type { CheckoutEligibility } from "@/lib/distributor-checkout";
import { formatCurrency } from "@/lib/format";

function noticeClassName(tone: CheckoutEligibility["statusTone"]) {
  switch (tone) {
    case "error":
      return "panel-card panel-card--danger minimum-order-notice minimum-order-notice--error";
    case "warning":
      return "panel-card panel-card--warning minimum-order-notice minimum-order-notice--warning";
    case "success":
      return "panel-card minimum-order-notice minimum-order-notice--success";
    default:
      return "panel-card minimum-order-notice";
  }
}

export function MinimumOrderNotice({
  eligibility,
}: {
  eligibility: CheckoutEligibility;
}) {
  if (!eligibility.isDistributorAccount) {
    return null;
  }

  return (
    <section
      aria-live="polite"
      className={noticeClassName(eligibility.statusTone)}
    >
      <div className="minimum-order-notice__header">
        <div>
          <span className="eyebrow-label">Aturan akun Anda</span>
          <strong>{eligibility.statusTitle}</strong>
        </div>
        <span className="minimum-order-notice__region">{eligibility.regionLabel}</span>
      </div>

      <p>{eligibility.summary}</p>

      {eligibility.minimumAmount > 0 ? (
        <div className="minimum-order-notice__progress">
          <div className="minimum-order-notice__progress-meta">
            <span>Minimum wilayah ini</span>
            <strong>{formatCurrency(eligibility.minimumAmount)}</strong>
          </div>
          <div
            aria-hidden="true"
            className="minimum-order-notice__progress-track"
          >
            <span
              className="minimum-order-notice__progress-fill"
              style={{ width: `${eligibility.progress ?? 0}%` }}
            />
          </div>
          {eligibility.progressMessage ? (
            <small>{eligibility.progressMessage}</small>
          ) : (
            <small>Subtotal akun Anda sudah cukup untuk wilayah ini.</small>
          )}
        </div>
      ) : null}

      {eligibility.requiresPermissionCode ? (
        <p className="minimum-order-notice__helper">
          Hubungi admin untuk mendapatkan kode izin checkout.
          {" "}
          <Link href="/kontak">Buka kontak resmi</Link>
        </p>
      ) : null}
    </section>
  );
}
