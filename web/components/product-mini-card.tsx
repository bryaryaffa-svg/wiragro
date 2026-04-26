"use client";

import Image from "next/image";
import Link from "next/link";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { RoleAwarePrice } from "@/components/ui/role-aware-price";
import type { ProductSummary } from "@/lib/api";

export function ProductMiniCard({ product }: { product: ProductSummary }) {
  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];

  return (
    <article className="chat-mini-card chat-mini-card--product">
      <div className="chat-mini-card__media">
        {primaryImage ? (
          <Image
            alt={primaryImage.alt_text || product.name}
            fill
            sizes="96px"
            src={primaryImage.url}
            unoptimized={primaryImage.url.startsWith("/")}
          />
        ) : (
          <div className="product-card__placeholder" />
        )}
      </div>
      <div className="chat-mini-card__body">
        <strong>{product.name}</strong>
        <RoleAwarePrice compact price={product.price} />
        <div className="chat-mini-card__actions">
          <Link className="btn btn-secondary" href={`/produk/${product.slug}`}>
            Detail
          </Link>
          <AddToCartButton
            buttonClassName="btn btn-primary"
            label="Tambah"
            productId={product.id}
          />
        </div>
      </div>
    </article>
  );
}
