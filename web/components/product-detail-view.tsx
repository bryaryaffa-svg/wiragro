"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { WishlistButton } from "@/components/wishlist-button";
import type { ProductDetailPayload } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

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

export function ProductDetailView({ product }: { product: ProductDetailPayload }) {
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
    <section className="product-showcase">
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
          <span className="eyebrow-label">{product.category?.name || product.product_type}</span>
          <h1>{product.name}</h1>
          <p>{product.description || product.summary}</p>
        </div>

        <div className="product-purchase-panel">
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
              productId={product.id}
              qty={qty}
            />
            <BuyNowButton
              buttonClassName="btn btn-secondary btn-block"
              disabled={isOutOfStock}
              productId={product.id}
              qty={qty}
            />
            <Link className="btn btn-secondary btn-block" href="/keranjang">
              Buka keranjang
            </Link>
          </div>
        </div>

        <div className="product-info-grid">
          <article className="product-info-card">
            <span className="eyebrow-label">Pembelian</span>
            <strong>Siap untuk wishlist, cart, dan checkout</strong>
            <p>Gunakan produk ini untuk mencoba alur belanja baru sampai selesai.</p>
          </article>
          <article className="product-info-card">
            <span className="eyebrow-label">Kategori</span>
            <strong>{product.category?.name || product.product_type}</strong>
            <p>
              Lihat produk lain yang sejenis di{" "}
              <Link href={product.category ? `/produk?kategori=${product.category.slug}` : "/produk"}>
                katalog terkait
              </Link>
              .
            </p>
          </article>
          {product.promotions.length ? (
            <article className="product-info-card">
              <span className="eyebrow-label">Promo aktif</span>
              <strong>{product.promotions[0]?.name}</strong>
              <p>
                Harga promo saat ini {formatCurrency(String(product.promotions[0]?.rule_payload.promo_price ?? 0))}
              </p>
            </article>
          ) : (
            <article className="product-info-card">
              <span className="eyebrow-label">Informasi</span>
              <strong>Tidak ada promo tambahan</strong>
              <p>Harga yang tampil adalah harga aktif yang dipakai saat checkout.</p>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
