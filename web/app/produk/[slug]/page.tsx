import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductCard } from "@/components/product-card";
import { WishlistButton } from "@/components/wishlist-button";
import { ApiRequestError, getProduct } from "@/lib/api";
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
  let product = null;
  let productUnavailable = false;

  try {
    product = await getProduct(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status !== 404) {
      productUnavailable = true;
    }
  }

  if (!product && !productUnavailable) {
    notFound();
  }

  if (!product) {
    return (
      <div className="page-stack">
        <article className="empty-state empty-state--shopping">
          <span className="eyebrow-label">Produk belum bisa dibuka</span>
          <h1>Detail produk gagal dimuat dari server.</h1>
          <p>
            Halaman produk ini tidak hilang, tetapi data detailnya sedang tidak berhasil
            diambil. Silakan kembali ke katalog atau coba lagi beberapa saat lagi.
          </p>
          <div className="empty-state__actions">
            <Link className="btn btn-primary" href="/produk">
              Kembali ke katalog
            </Link>
          </div>
        </article>
      </div>
    );
  }

  const primaryImage = product.images.find((image) => image.is_primary) ?? product.images[0];
  const isOutOfStock = product.availability.state === "out_of_stock";

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
            {product.badges.featured ? <span>Promo</span> : null}
            {product.badges.new_arrival ? <span>Baru</span> : null}
            {product.badges.best_seller ? <span>Terlaris</span> : null}
          </div>
          <span className="eyebrow-label">{product.product_type}</span>
          <h1>{product.name}</h1>
          <p>{product.summary}</p>
          <div className="price-panel">
            <strong>{formatCurrency(product.price.amount)}</strong>
            {product.price.compare_at_amount ? (
              <small className="price-strike">
                {formatCurrency(product.price.compare_at_amount)}
              </small>
            ) : null}
            <span className={`status-badge status-badge--${product.availability.state}`}>
              {product.availability.label}
            </span>
          </div>
          <div className="info-list">
            <div>
              <span>Satuan</span>
              <strong>{product.unit}</strong>
            </div>
            <div>
              <span>Kategori</span>
              <strong>{product.category?.name || product.product_type}</strong>
            </div>
            <div>
              <span>Status stok</span>
              <strong>{product.stock_badge.message}</strong>
            </div>
          </div>
          <div className="product-detail__actions">
            <AddToCartButton
              buttonClassName="btn btn-primary btn-block"
              disabled={isOutOfStock}
              productId={product.id}
              qty={1}
            />
            <WishlistButton buttonClassName="btn btn-secondary btn-block" product={product} />
            <Link className="btn btn-secondary btn-block" href="/keranjang">
              Buka keranjang
            </Link>
          </div>
          {product.promotions.length ? (
            <div className="promo-box">
              <span className="eyebrow-label">Promo aktif</span>
              {product.promotions.map((promotion) => (
                <div key={promotion.code}>
                  <strong>{promotion.name}</strong>
                  <p>
                    Harga promo {formatCurrency(String(promotion.rule_payload.promo_price ?? 0))}
                  </p>
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
