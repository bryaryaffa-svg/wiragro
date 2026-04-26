"use client";

import { useAuth } from "@/components/auth-provider";
import { getRoleAwarePrice } from "@/lib/account-role";
import type { ProductSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export function RoleAwarePrice({
  availabilityText,
  compact = false,
  price,
}: {
  availabilityText?: string | null;
  compact?: boolean;
  price: ProductSummary["price"];
}) {
  const { session } = useAuth();
  const resolvedPrice = getRoleAwarePrice(price, session);

  return (
    <div className={`role-aware-price${compact ? " role-aware-price--compact" : ""}`}>
      <div className="role-aware-price__primary">
        <strong>{formatCurrency(resolvedPrice.value)}</strong>
        {resolvedPrice.isRoleAware ? (
          <span className="role-aware-price__eyebrow">{resolvedPrice.label}</span>
        ) : resolvedPrice.referenceAmount ? (
          <small className="price-strike">{formatCurrency(resolvedPrice.referenceAmount)}</small>
        ) : null}
      </div>
      {availabilityText ? <small className="price-caption">{availabilityText}</small> : null}
      {resolvedPrice.isRoleAware ? (
        resolvedPrice.referenceAmount ? (
          <small className="price-caption price-caption--secondary">
            Harga normal {formatCurrency(resolvedPrice.referenceAmount)}
          </small>
        ) : null
      ) : (
        <small className="price-caption price-caption--secondary">
          {price.is_promo ? "Harga promo aktif" : "Harga aktif saat ini"}
        </small>
      )}
    </div>
  );
}
