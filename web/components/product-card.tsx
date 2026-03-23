"use client";

import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistButton } from "@/components/wishlist-button";
import type { ProductSummary } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export function ProductCard({ product }: { product: ProductSummary }) {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];

  return (
    <article className="product-card">
      <Link className="product-card__media" href={`/produk/${product.slug}`}>
        {primaryImage ? (
          <Image
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={primaryImage.url}
          />
        ) : (
          <div className="product-card__placeholder" />
        )}
      </Link>

      <div className="product-card__body">
        <div className="product-card__badges">
          {product.badges.featured ? <span>Unggulan</span> : null}
          {product.badges.new_arrival ? <span>Baru</span> : null}
          {product.badges.best_seller ? <span>Terlaris</span> : null}
        </div>
        <div className="product-card__meta">
          <span>{product.product_type}</span>
          <span>{product.unit}</span>
        </div>
        <Link className="product-card__title" href={`/produk/${product.slug}`}>
          {product.name}
        </Link>
        <p>{product.summary}</p>
        <div className="product-card__footer">
          <div>
            <strong>{formatCurrency(product.price.amount)}</strong>
            {product.price.compare_at_amount ? (
              <small className="price-strike">
                {formatCurrency(product.price.compare_at_amount)}
              </small>
            ) : null}
            {product.price.min_qty && product.price.min_qty > 1 ? (
              <small>Mulai {product.price.min_qty} {product.unit}</small>
            ) : null}
          </div>
          <div className="product-card__actions">
            <WishlistButton product={product} />
            <AddToCartButton label="Tambah" productId={product.id} />
          </div>
        </div>
      </div>
    </article>
  );
}
