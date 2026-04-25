import Link from "next/link";

import {
  getGrowthBundleKindLabel,
  getGrowthBundlePricingPreview,
  type GrowthBundleDefinition,
} from "@/lib/growth-commerce";
import { formatCurrency } from "@/lib/format";

type GrowthBundleCardData = Pick<
  GrowthBundleDefinition,
  "kind" | "title" | "description" | "href" | "actionLabel" | "supportingLinks"
> &
  Partial<Pick<GrowthBundleDefinition, "sku" | "bundleItems" | "pricing">>;

export function GrowthBundleCard({
  bundle,
}: {
  bundle: GrowthBundleCardData;
}) {
  const pricingPreview =
    bundle.bundleItems && bundle.pricing
      ? getGrowthBundlePricingPreview({
          bundleItems: bundle.bundleItems,
          pricing: bundle.pricing,
        })
      : null;

  return (
    <article className={`growth-bundle-card growth-bundle-card--${bundle.kind}`}>
      <div className="growth-bundle-card__header">
        <span className="eyebrow-label">{getGrowthBundleKindLabel(bundle.kind)}</span>
        {bundle.sku ? <span className="growth-bundle-card__sku">{bundle.sku}</span> : null}
      </div>

      <strong>{bundle.title}</strong>
      <p>{bundle.description}</p>

      {pricingPreview ? (
        <>
          <div className="growth-bundle-card__stats">
            <span>{pricingPreview.skuCount} SKU tetap</span>
            <span>{pricingPreview.itemCount} item</span>
            <span>{bundle.pricing?.priceStatus === "mock" ? "Estimasi awal" : "Harga aktif"}</span>
          </div>

          <div className="growth-bundle-card__price">
            <small>Total normal {formatCurrency(pricingPreview.normalTotalAmount)}</small>
            <strong>{formatCurrency(pricingPreview.bundlePriceAmount)}</strong>
            <p>
              Hemat {formatCurrency(pricingPreview.savingsAmount)}
              {pricingPreview.savingsPercent > 0 ? ` (${pricingPreview.savingsPercent}%)` : ""}
            </p>
          </div>
        </>
      ) : null}

      {bundle.supportingLinks?.length ? (
        <div className="growth-bundle-card__links">
          {bundle.supportingLinks.map((item) => (
            <Link href={item.href} key={`${bundle.title}-${item.href}`}>
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}

      <Link className="growth-bundle-card__action" href={bundle.href}>
        {bundle.actionLabel}
      </Link>
    </article>
  );
}
