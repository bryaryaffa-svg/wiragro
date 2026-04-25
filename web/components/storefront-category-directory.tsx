import type { CSSProperties } from "react";
import Link from "next/link";

import {
  buildStorefrontCategoryHref,
  buildStorefrontSubcategoryHref,
  STOREFRONT_CATEGORY_CLUSTERS,
  STOREFRONT_MAIN_CATEGORIES,
} from "@/lib/storefront-category-system";

import { StorefrontCategoryPhoto } from "@/components/storefront-category-photo";
import { SubcategoryIcon } from "@/components/storefront-category-visuals";

const clusterOrder = ["budidaya", "peralatan", "operasional"] as const;

export function StorefrontCategoryDirectory({
  categories,
}: {
  categories: Array<{ name: string; slug: string }>;
}) {
  return (
    <section className="storefront-section storefront-section--category-directory">
      <div className="storefront-section__header storefront-section__header--category-directory">
        <div>
          <span className="storefront-eyebrow">Kategori produk</span>
          <h2>Sistem kategori produk Wiragro</h2>
          <p>
            Kategori utama ditampilkan dengan visual yang lebih mudah dikenali, sementara
            subkategori tetap ringkas sebagai chip yang nyaman dipindai di mobile maupun desktop.
          </p>
        </div>
        <Link href="/produk">Buka katalog</Link>
      </div>

      <div className="category-directory">
        {clusterOrder.map((clusterKey) => {
          const cluster = STOREFRONT_CATEGORY_CLUSTERS[clusterKey];
          const items = STOREFRONT_MAIN_CATEGORIES.filter((item) => item.cluster === clusterKey);

          return (
            <section className="category-directory__cluster" key={clusterKey}>
              <div className="category-directory__cluster-header">
                <div>
                  <span className="storefront-pill storefront-pill--soft">{cluster.label}</span>
                  <h3>{cluster.label}</h3>
                </div>
                <p>{cluster.description}</p>
              </div>

              <div className="category-directory__grid">
                {items.map((item) => {
                  const href = buildStorefrontCategoryHref(item, categories);
                  const style = {
                    "--category-accent": item.accent,
                    "--category-accent-soft": item.accentSoft,
                    "--category-accent-warm": item.accentWarm,
                  } as CSSProperties;

                  return (
                    <article className="category-directory-card" key={item.key} style={style}>
                      <div className="category-directory-card__art">
                        <StorefrontCategoryPhoto
                          alt={item.imageAlt}
                          sizes="(max-width: 640px) 92vw, (max-width: 980px) 44vw, 28vw"
                          src={item.imageSrc}
                        />
                      </div>

                      <div className="category-directory-card__body">
                        <div className="category-directory-card__header">
                          <div>
                            <span className="category-directory-card__cluster">
                              {cluster.label}
                            </span>
                            <h4>{item.label}</h4>
                            <p>{item.description}</p>
                          </div>
                          <Link className="category-directory-card__link" href={href}>
                            Jelajahi
                          </Link>
                        </div>

                        <div className="category-directory-card__chips">
                          {item.subcategories.slice(0, 3).map((subItem) => (
                            <Link
                              className="category-directory-chip"
                              href={buildStorefrontSubcategoryHref(item.key, subItem, categories)}
                              key={`${item.key}-${subItem.label}`}
                            >
                              <span className="category-directory-chip__icon">
                                <SubcategoryIcon kind={subItem.icon} />
                              </span>
                              <span>{subItem.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
