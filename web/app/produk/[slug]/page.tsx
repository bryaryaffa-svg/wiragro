import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { WishlistButton } from "@/components/wishlist-button";
import { getProduct } from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await getProduct(slug);
    return {
      title: product.seo?.title || product.name,
      description: product.seo?.description || product.summary || product.description || "",
    };
  } catch {
    return {
      title: "Produk",
    };
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if ("detail" in (product as unknown as { detail?: string })) {
    notFound();
  }

  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];

  return (
    <div className="page-stack">
      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/produk">Produk</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <section className="product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__main">
            {primaryImage ? (
              <Image
                alt={primaryImage.alt_text || product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                src={primaryImage.url}
              />
            ) : (
              <div className="product-card__placeholder" />
            )}
          </div>
          <div className="gallery-strip">
            {product.images.map((image) => (
              <div className="gallery-thumb" key={image.id}>
                <Image
                  alt={image.alt_text || product.name}
                  fill
                  sizes="100px"
                  src={image.url}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="product-detail__summary">
          <div className="product-card__badges">
            {product.badges.featured ? <span>Unggulan</span> : null}
            {product.badges.new_arrival ? <span>Baru</span> : null}
            {product.badges.best_seller ? <span>Terlaris</span> : null}
          </div>
          <span className="eyebrow-label">{product.product_type}</span>
          <h1>{product.name}</h1>
          <p>{product.summary}</p>
          <div className="price-panel">
            <strong>{formatCurrency(product.price.amount)}</strong>
            <span>
              {product.price.type || "RETAIL"}
              {product.price.min_qty ? ` | min ${product.price.min_qty}` : ""}
            </span>
          </div>
          <div className="info-list">
            <div>
              <span>Satuan</span>
              <strong>{product.unit}</strong>
            </div>
            <div>
              <span>Berat</span>
              <strong>{product.weight_grams} gram</strong>
            </div>
            <div>
              <span>Status stok</span>
              <strong>{product.stock_badge.message}</strong>
            </div>
          </div>
          <div className="product-detail__actions">
            <AddToCartButton productId={product.id} qty={1} />
            <WishlistButton product={product} />
          </div>
          {product.promotions.length ? (
            <div className="promo-box">
              <span className="eyebrow-label">Promo aktif</span>
              {product.promotions.map((promotion) => (
                <div key={promotion.code}>
                  <strong>{promotion.name}</strong>
                  <p>{JSON.stringify(promotion.rule_payload)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="content-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Detail produk</span>
            <h2>Deskripsi dan media</h2>
          </div>
        </div>
        <div className="rich-content">
          <p>{product.description}</p>
          {product.videos.length ? (
            <ul className="plain-list">
              {product.videos.map((video) => (
                <li key={video.id}>
                  <a href={video.url} rel="noreferrer" target="_blank">
                    Lihat video {video.platform}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {product.related_products.length ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow-label">Rekomendasi</span>
              <h2>Produk terkait</h2>
            </div>
          </div>
          <div className="product-grid">
            {product.related_products.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
