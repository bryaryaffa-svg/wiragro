"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import type { ProductDetailPayload } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { ProductPageEnrichment } from "@/lib/product-content";

function clampQty(value: number) {
  return Math.max(1, Math.min(value, 99));
}

const PRODUCT_SHOWCASE_MAIN_STYLE = {
  position: "relative",
  minHeight: "480px",
  overflow: "hidden",
} as const;

const PRODUCT_SHOWCASE_IMAGE_STYLE = {
  objectFit: "contain",
  padding: "1.2rem",
} as const;

const PRODUCT_SHOWCASE_WISHLIST_SLOT_STYLE = {
  position: "absolute",
  top: "0.9rem",
  right: "0.9rem",
  zIndex: 3,
} as const;

export function ProductDetailView({
  product,
  enrichment,
  consultationUrl,
}: {
  product: ProductDetailPayload;
  enrichment: ProductPageEnrichment;
  consultationUrl?: string | null;
}) {
  const defaultImage = product.images.find((image) => image.is_primary) ?? product.images[0] ?? null;
  const [selectedImageId, setSelectedImageId] = useState<string | null>(defaultImage?.id ?? null);
  const [qty, setQty] = useState(1);

  const selectedImage =
    product.images.find((image) => image.id === selectedImageId) ?? defaultImage ?? null;
  const isOutOfStock = product.availability.state === "out_of_stock";
  const itemWeightKg = Number(product.weight_grams || "0") / 1000;
  const hasPromo = Boolean(product.price.compare_at_amount);
  const useUnoptimizedSelectedImage = selectedImage?.url.startsWith("/") ?? false;

  return (
    <section className="product-showcase product-showcase--editorial">
      <div className="product-showcase__media">
        <div className="product-showcase__main" style={PRODUCT_SHOWCASE_MAIN_STYLE}>
          {selectedImage ? (
            <Image
              alt={selectedImage.alt_text || product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 54vw"
              src={selectedImage.url}
              style={PRODUCT_SHOWCASE_IMAGE_STYLE}
              unoptimized={useUnoptimizedSelectedImage}
            />
          ) : (
            <div className="product-card__placeholder" />
          )}
          <div style={PRODUCT_SHOWCASE_WISHLIST_SLOT_STYLE}>
            <WishlistButton
              buttonClassName="wishlist-button wishlist-button--icon"
              product={product}
              variant="icon"
            />
          </div>
        </div>

        {product.images.length > 1 ? (
          <div className="product-showcase__thumbs">
            {product.images.map((image) => {
              const isActive = image.id === selectedImage?.id;

              return (
                <button
                  className={`product-showcase__thumb ${isActive ? "is-active" : ""}`}
                  key={image.id}
                  onClick={() => setSelectedImageId(image.id)}
                  type="button"
                >
                  <Image
                    alt={image.alt_text || product.name}
                    fill
                    sizes="96px"
                    src={image.url}
                  />
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      <div className="product-showcase__summary">
        <div className="product-showcase__header">
          <div className="product-card__badges">
            {product.badges.featured ? <span>Promo</span> : null}
            {product.badges.new_arrival ? <span>Baru</span> : null}
            {product.badges.best_seller ? <span>Terlaris</span> : null}
          </div>
          <span className="eyebrow-label">
            {enrichment.useCaseLabel} · {product.category?.name || product.product_type}
          </span>
          <h1>{product.name}</h1>
          <p>{product.description || product.summary}</p>
          <p className="product-showcase__purpose">{enrichment.purpose}</p>

          <div className="product-pill-row">
            {enrichment.quickMeta.map((item) => (
              <span key={`${product.slug}-${item}`}>{item}</span>
            ))}
          </div>
        </div>

        <div className="product-detail-benefits">
          {enrichment.primaryBenefits.map((item) => (
            <article className="product-detail-benefits__card" key={`${product.slug}-${item}`}>
              <strong>{item}</strong>
            </article>
          ))}
        </div>

        <div className="product-purchase-panel product-purchase-panel--editorial">
          <div className="product-purchase-panel__heading">
            <span className="eyebrow-label">CTA beli</span>
            <strong>Beli saat konteksnya sudah tepat, bukan karena produknya terlihat familiar.</strong>
          </div>
          <div className="product-purchase-panel__price">
            <strong>{formatCurrency(product.price.amount)}</strong>
            {hasPromo ? (
              <small className="price-strike">
                {formatCurrency(product.price.compare_at_amount)}
              </small>
            ) : null}
          </div>
          <span className={`status-badge status-badge--${product.availability.state}`}>
            {product.availability.label}
          </span>
          <div className="product-purchase-panel__meta">
            <div>
              <span>Stok</span>
              <strong>{product.stock_badge.message}</strong>
            </div>
            <div>
              <span>Satuan</span>
              <strong>{product.unit}</strong>
            </div>
            <div>
              <span>Berat</span>
              <strong>{itemWeightKg > 0 ? `${itemWeightKg.toFixed(2)} kg` : "-"}</strong>
            </div>
            <div>
              <span>SKU</span>
              <strong>{product.sku}</strong>
            </div>
          </div>

          <div className="product-purchase-panel__qty">
            <span>Jumlah</span>
            <div className="qty-stepper" role="group" aria-label={`Jumlah ${product.name}`}>
              <button onClick={() => setQty((current) => clampQty(current - 1))} type="button">
                -
              </button>
              <span>{qty}</span>
              <button onClick={() => setQty((current) => clampQty(current + 1))} type="button">
                +
              </button>
            </div>
          </div>

          <div className="product-detail__actions">
            <AddToCartButton
              buttonClassName="btn btn-primary btn-block"
              disabled={isOutOfStock}
              label={enrichment.primaryCtaLabel}
              productId={product.id}
              qty={qty}
            />
            <BuyNowButton
              buttonClassName="btn btn-secondary btn-block"
              disabled={isOutOfStock}
              label={enrichment.secondaryCtaLabel}
              productId={product.id}
              qty={qty}
            />
            {consultationUrl ? (
              <a className="btn btn-secondary btn-block" href={consultationUrl} rel="noreferrer" target="_blank">
                Konsultasi sebelum beli
              </a>
            ) : (
              <Link className="btn btn-secondary btn-block" href="/kontak">
                Tanya ke toko
              </Link>
            )}
            <Link className="btn btn-secondary btn-block" href="/keranjang">
              Buka keranjang
            </Link>
          </div>

          <div className="product-purchase-panel__support">
            <p>{enrichment.consultationPrompt}</p>
          </div>
        </div>

        <div className="product-showcase__context">
          <article className="product-context-card">
            <span className="eyebrow-label">Cocok untuk komoditas</span>
            <div className="product-chip-links">
              {enrichment.commodityLinks.map((item) => (
                <Link href={item.href} key={`${product.slug}-${item.slug}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </article>

          <article className="product-context-card">
            <span className="eyebrow-label">Dipakai pada fase</span>
            <div className="product-chip-links">
              {enrichment.stageLinks.map((item) => (
                <Link href={item.href} key={`${product.slug}-${item.slug}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </article>

          <article className="product-context-card">
            <span className="eyebrow-label">Masalah yang bisa dibantu</span>
            <div className="product-chip-links">
              {enrichment.problemLinks.map((item) => (
                <Link href={item.href} key={`${product.slug}-${item.slug}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </article>
        </div>

        <div className="product-trust-strip">
          <strong>{enrichment.guidanceNote}</strong>
          <span>
            {product.promotions.length
              ? `Promo aktif: ${product.promotions[0]?.name}.`
              : "Harga aktif akan mengikuti katalog saat checkout."}
          </span>
        </div>
      </div>
    </section>
  );
}
