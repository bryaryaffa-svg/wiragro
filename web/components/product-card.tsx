"use client";

import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import type { ProductSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

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

export function ProductCard({ product }: { product: ProductSummary }) {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
  const isOutOfStock = product.availability.state === "out_of_stock";
  const showAvailabilityBadge = product.availability.state !== "in_stock";
  const useUnoptimizedImage = primaryImage?.url.startsWith("/") ?? false;
  const primaryBadge = product.badges.featured
    ? "Promo"
    : product.badges.new_arrival
      ? "Baru"
      : product.badges.best_seller
        ? "Terlaris"
        : null;
  const availabilityText =
    product.availability.state === "low_stock"
      ? "Stok menipis"
      : product.availability.state === "out_of_stock"
        ? "Stok habis"
        : null;

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
          style={PRODUCT_CARD_MEDIA_LINK_STYLE}
        >
          {primaryImage ? (
            <Image
              alt={primaryImage.alt_text || product.name}
              fill
              sizes="(max-width: 640px) 48vw, (max-width: 1080px) 32vw, 25vw"
              src={primaryImage.url}
              style={PRODUCT_CARD_IMAGE_STYLE}
              unoptimized={useUnoptimizedImage}
            />
          ) : (
            <div className="product-card__placeholder" />
          )}
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

        <Link className="product-card__title" href={`/produk/${product.slug}`}>
          {product.name}
        </Link>

        <p className="product-card__summary">
          {product.summary || "Produk aktif dari katalog Sidomakmur dan siap diproses."}
        </p>

        <div className="product-card__price-block">
          <div className="product-card__price-row">
            <strong>{formatCurrency(product.price.amount)}</strong>
            {product.price.compare_at_amount ? (
              <small className="price-strike">
                {formatCurrency(product.price.compare_at_amount)}
              </small>
            ) : null}
          </div>
          {availabilityText ? <small className="price-caption">{availabilityText}</small> : null}
          <small className="price-caption price-caption--secondary">
            {product.price.is_promo ? "Harga promo aktif" : "Harga toko saat ini"}
          </small>
        </div>

        <div className="product-card__actions">
          <AddToCartButton
            buttonClassName="btn btn-primary btn-block"
            disabled={isOutOfStock}
            label="Tambah"
            productId={product.id}
          />
          <BuyNowButton
            buttonClassName="btn btn-secondary btn-block"
            disabled={isOutOfStock}
            productId={product.id}
          />
        </div>
      </div>
    </article>
  );
}
