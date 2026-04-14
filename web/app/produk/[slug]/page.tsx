import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { ProductDetailView } from "@/components/product-detail-view";
import { ApiRequestError, getProduct } from "@/lib/api";

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

  return (
    <div className="page-stack">
      <div className="breadcrumbs">
        <Link href="/">Beranda</Link>
        <span>/</span>
        <Link href="/produk">Produk</Link>
        <span>/</span>
        <span>{product.name}</span>
      </div>

      <ProductDetailView product={product} />

      <section className="content-shell">
        <div className="section-heading">
          <div>
            <span className="eyebrow-label">Spesifikasi</span>
            <h2>Informasi produk</h2>
          </div>
        </div>
        <div className="product-content-grid">
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
          <div className="product-spec-list">
            <div>
              <span>Kategori</span>
              <strong>{product.category?.name || product.product_type}</strong>
            </div>
            <div>
              <span>Satuan</span>
              <strong>{product.unit}</strong>
            </div>
            <div>
              <span>Berat</span>
              <strong>{Number(product.weight_grams || "0") > 0 ? `${(Number(product.weight_grams) / 1000).toFixed(2)} kg` : "-"}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{product.stock_badge.message}</strong>
            </div>
          </div>
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
