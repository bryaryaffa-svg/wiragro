"use client";

import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import type { ProductSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product }: { product: ProductSummary }) {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
  const isOutOfStock = product.availability.state === "out_of_stock";
  const showAvailabilityBadge = product.availability.state !== "in_stock";
  const availabilityText =
    product.availability.state === "low_stock"
      ? "Stok menipis"
      : product.availability.state === "out_of_stock"
        ? "Stok habis"
        : null;

  return (
    <article className="product-card">
      <div className="product-card__media-shell">
        <Link className="product-card__media" href={`/produk/${product.slug}`}>
          {primaryImage ? (
            <Image
              alt={primaryImage.alt_text || product.name}
              fill
              sizes="(max-width: 640px) 48vw, (max-width: 1080px) 32vw, 25vw"
              src={primaryImage.url}
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
        <WishlistButton
          buttonClassName="wishlist-button wishlist-button--icon product-card__wish"
          product={product}
          variant="icon"
        />
      </div>

      <div className="product-card__body">
        <div className="product-card__header">
          <div className="product-card__badges">
            {product.badges.featured ? <span>Promo</span> : null}
            {product.badges.new_arrival ? <span>Baru</span> : null}
            {product.badges.best_seller ? <span>Terlaris</span> : null}
          </div>
          <div className="product-card__meta">
            <span>{product.category?.name ?? product.product_type}</span>
            <span>{product.unit}</span>
          </div>
        </div>

        <Link className="product-card__title" href={`/produk/${product.slug}`}>
          {product.name}
        </Link>

        <p className="product-card__summary">
          {product.summary || "Produk aktif dari katalog Sidomakmur dan siap diproses."}
        </p>

        <div className="product-card__price-block">
          <strong>{formatCurrency(product.price.amount)}</strong>
          {product.price.compare_at_amount ? (
            <small className="price-strike">
              {formatCurrency(product.price.compare_at_amount)}
            </small>
          ) : null}
          {availabilityText ? <small className="price-caption">{availabilityText}</small> : null}
          <small className="price-caption price-caption--secondary">
            {product.price.is_promo ? "Harga promo aktif" : "Harga toko saat ini"}
          </small>
        </div>

        <div className="product-card__actions">
          <AddToCartButton
            buttonClassName="btn btn-primary btn-block"
            disabled={isOutOfStock}
            label="Tambah ke keranjang"
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
