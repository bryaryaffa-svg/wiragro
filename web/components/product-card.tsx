"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RoleAwarePrice } from "@/components/ui/role-aware-price";
import { WishlistButton } from "@/components/wishlist-button";
import { trackUiEvent } from "@/lib/analytics";
import type { ProductSummary } from "@/lib/api";
import {
  getFallbackProductVisual,
  getProductCardBadge,
  getProductCardFit,
} from "@/lib/product-card-content";

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

function ProductFitGroup({ items, label }: { items: string[]; label: string }) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="product-card__fit-row">
      <span className="product-card__fit-label">{label}</span>
      <div className="product-card__fit-chips">
        {items.map((item) => (
          <span className="product-card__fit-chip" key={`${label}-${item}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
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
  const fit = getProductCardFit(product);
  const primaryBadge = getProductCardBadge(product);
  const totalReviews = product.review_summary?.total_reviews ?? 0;
  const averageRating = product.review_summary?.average_rating ?? null;
  const hasReviewSummary = totalReviews > 0 && averageRating !== null;
  const contextualBadge = contextBadge ?? null;

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
          <span>{fit.categoryLabel}</span>
          <span>{product.unit}</span>
        </div>

        <div className="product-card__state-row">
          <span className={`product-card__stock product-card__stock--${fit.stockState}`}>
            {fit.stockLabel}
          </span>
          {product.price.is_promo || product.badges.featured ? (
            <span className="product-card__state-pill product-card__state-pill--promo">
              Promo aktif
            </span>
          ) : null}
          {fit.needsConsultation ? (
            <span className="product-card__state-pill product-card__state-pill--consult">
              Butuh konsultasi
            </span>
          ) : null}
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

        <div className="product-card__fit" aria-label="Kecocokan produk">
          {fit.hasSpecificFit ? (
            <>
              <ProductFitGroup items={fit.cropLabels} label="Tanaman" />
              <ProductFitGroup items={fit.problemLabels} label="Masalah" />
            </>
          ) : (
            <ProductFitGroup items={[fit.categoryLabel]} label="Kategori" />
          )}
        </div>

        <p className="product-card__summary">
          {benefitOverride || fit.summary}
        </p>

        <RoleAwarePrice price={product.price} />

        <div className="product-card__actions product-card__actions--two">
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
            Lihat Detail
          </Link>
          <AddToCartButton
            buttonClassName="btn btn-primary btn-block"
            disabled={isOutOfStock}
            label="Tambah"
            productId={product.id}
          />
        </div>
      </div>
    </article>
  );
}
