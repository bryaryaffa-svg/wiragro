"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { RoleAwarePrice } from "@/components/ui/role-aware-price";
import { WishlistButton } from "@/components/wishlist-button";
import { trackUiEvent } from "@/lib/analytics";
import type { ProductSummary } from "@/lib/api";
import { getProductCatalogContext } from "@/lib/solution-experience";

const PRODUCT_CARD_MEDIA_SHELL_STYLE = {
  position: "relative",
} as const;

const PRODUCT_CARD_MEDIA_LINK_STYLE = {
  display: "block",
  width: "100%",
  lineHeight: 0,
  background:
    "radial-gradient(circle at top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.1) 38%), linear-gradient(145deg, #dcc7aa 0%, #f2ebdf 48%, #e8ddca 100%)",
} as const;

const PRODUCT_CARD_IMAGE_STYLE = {
  objectFit: "contain",
  padding: "1rem 1rem 0.6rem",
  transform: "scale(1.01)",
} as const;

const PRODUCT_CARD_WISHLIST_SLOT_STYLE = {
  position: "absolute",
  top: "0.9rem",
  right: "0.9rem",
  zIndex: 3,
} as const;

function getFallbackProductVisual(product: ProductSummary) {
  const haystack = `${product.name} ${product.category?.name ?? ""} ${product.product_type}`.toLowerCase();

  if (haystack.includes("benih") || haystack.includes("bibit")) {
    return "/wiragro-illustrations/wiragro_produk_benih_transparent.png";
  }
  if (
    haystack.includes("pestisida") ||
    haystack.includes("insektisida") ||
    haystack.includes("fungisida") ||
    haystack.includes("herbisida")
  ) {
    return "/wiragro-illustrations/wiragro_produk_herbisida_transparent.png";
  }
  if (haystack.includes("nutrisi") || haystack.includes("booster") || haystack.includes("kalium")) {
    return "/wiragro-illustrations/wiragro_produk_nutrisi_transparent.png";
  }
  if (haystack.includes("alat") || haystack.includes("sprayer") || haystack.includes("semprot")) {
    return "/wiragro-illustrations/wiragro_icon_alat_pertanian_transparent.png";
  }

  return "/wiragro-illustrations/wiragro_produk_pupuk_transparent.png";
}

export function ProductCard({
  benefitOverride,
  contextBadge,
  product,
  trackingContext,
}: {
  benefitOverride?: string;
  contextBadge?: string;
  product: ProductSummary;
  trackingContext?: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
  const fallbackImage = getFallbackProductVisual(product);
  const hasPrimaryImage = Boolean(primaryImage?.url);
  const resolvedImageUrl = hasPrimaryImage && primaryImage && !imageFailed ? primaryImage.url : fallbackImage;
  const isOutOfStock = product.availability.state === "out_of_stock";
  const showAvailabilityBadge = product.availability.state !== "in_stock";
  const useUnoptimizedImage = resolvedImageUrl.startsWith("/");
  const context = getProductCatalogContext(product);
  const primaryBadge = product.badges.featured
    ? "Promo"
    : product.badges.new_arrival
      ? "Baru"
      : product.badges.best_seller
        ? "Terlaris"
        : null;
  const totalReviews = product.review_summary?.total_reviews ?? 0;
  const averageRating = product.review_summary?.average_rating ?? null;
  const hasReviewSummary = totalReviews > 0 && averageRating !== null;
  const availabilityText =
    product.availability.state === "low_stock"
      ? "Stok menipis"
      : product.availability.state === "out_of_stock"
        ? "Stok habis"
        : "Siap dipesan";
  const contextualBadge = contextBadge ?? context.quickBadge;

  useEffect(() => {
    setImageFailed(false);
  }, [primaryImage?.url, product.id]);

  return (
    <article className="product-card">
      <div className="product-card__media-shell" style={PRODUCT_CARD_MEDIA_SHELL_STYLE}>
        {primaryBadge ? (
          <div className="product-card__floating-badges">
            <span>{primaryBadge}</span>
          </div>
        ) : null}
        <Link
          className="product-card__media"
          href={`/produk/${product.slug}`}
          onClick={() =>
            trackingContext
              ? trackUiEvent("recommended_product_clicked", {
                  product_id: product.id,
                  product_name: product.name,
                  source: trackingContext,
                })
              : undefined
          }
          style={PRODUCT_CARD_MEDIA_LINK_STYLE}
        >
          <Image
            alt={primaryImage?.alt_text || product.name}
            fill
            onError={() => setImageFailed(true)}
            sizes="(max-width: 640px) 48vw, (max-width: 1080px) 32vw, 25vw"
            src={resolvedImageUrl}
            style={PRODUCT_CARD_IMAGE_STYLE}
            unoptimized={useUnoptimizedImage}
          />
          {!hasPrimaryImage || imageFailed ? (
            <span className="product-card__fallback-note">
              {product.category?.name ?? "Produk"}
            </span>
          ) : null}
          {showAvailabilityBadge ? (
            <div className="product-card__overlay">
              <span className={`status-badge status-badge--${product.availability.state}`}>
                {product.availability.label}
              </span>
            </div>
          ) : null}
        </Link>
        <div style={PRODUCT_CARD_WISHLIST_SLOT_STYLE}>
          <WishlistButton
            buttonClassName="wishlist-button wishlist-button--icon"
            product={product}
            variant="icon"
          />
        </div>
      </div>

        <div className="product-card__body">
          <div className="product-card__meta">
            <span>{product.category?.name ?? product.product_type}</span>
            <span>{product.unit}</span>
          </div>

          {contextualBadge ? (
            <div className="product-card__context-hint">
              <span>{contextualBadge}</span>
            </div>
          ) : null}

          <Link
            className="product-card__title"
            href={`/produk/${product.slug}`}
          onClick={() =>
            trackingContext
              ? trackUiEvent("recommended_product_clicked", {
                  product_id: product.id,
                  product_name: product.name,
                  source: trackingContext,
                })
              : undefined
          }
        >
          {product.name}
        </Link>

        {hasReviewSummary ? (
          <div
            aria-label={`Rating ${averageRating.toFixed(1)} dari ${totalReviews} review terverifikasi`}
            className="product-card__rating"
          >
            <strong>{averageRating.toFixed(1)}</strong>
            <span className="product-card__rating-stars">{`\u2605`}</span>
            <small className="product-card__rating-count">{totalReviews} review</small>
          </div>
        ) : null}

        <p className="product-card__summary">
          {benefitOverride ||
            context.benefit ||
            product.summary ||
            "Produk pertanian aktif dari Wiragro yang siap dipilih sesuai kebutuhan Anda."}
        </p>

        <RoleAwarePrice availabilityText={availabilityText} price={product.price} />

        <div className="product-card__actions">
          <AddToCartButton
            buttonClassName="btn btn-secondary btn-block"
            disabled={isOutOfStock}
            label="Tambah"
            productId={product.id}
          />
          <BuyNowButton
            buttonClassName="btn btn-primary btn-block"
            disabled={isOutOfStock}
            label="Beli sekarang"
            productId={product.id}
          />
          <Link
            className="btn btn-secondary btn-block product-card__detail-link"
            href={`/produk/${product.slug}`}
            onClick={() =>
              trackingContext
                ? trackUiEvent("recommended_product_clicked", {
                    product_id: product.id,
                    product_name: product.name,
                    source: trackingContext,
                  })
                : undefined
            }
          >
            Detail
          </Link>
        </div>
      </div>
    </article>
  );
}
