import type { CSSProperties } from "react";
import Link from "next/link";

import {
  buildStorefrontCategoryHref,
  buildStorefrontSubcategoryHref,
  resolveStorefrontCategorySelection,
  STOREFRONT_CATEGORY_CLUSTERS,
  STOREFRONT_MAIN_CATEGORIES,
} from "@/lib/storefront-category-system";

import { StorefrontCategoryPhoto } from "@/components/storefront-category-photo";
import { SubcategoryIcon } from "@/components/storefront-category-visuals";

export function StorefrontCategoryNavigator({
  categories,
  activeMainKey,
  activeSubcategory,
  activeCategorySlug,
  activeQuery,
}: {
  categories: Array<{ name: string; slug: string }>;
  activeMainKey?: string | null;
  activeSubcategory?: string | null;
  activeCategorySlug?: string | null;
  activeQuery?: string | null;
}) {
  const selection = resolveStorefrontCategorySelection({
    mainKey: activeMainKey,
    subLabel: activeSubcategory,
    categorySlug: activeCategorySlug,
    query: activeQuery,
  });

  const activeMain = selection.main ?? STOREFRONT_MAIN_CATEGORIES[0];

  return (
    <section className="catalog-category-navigator">
      <div className="catalog-category-navigator__header">
        <div>
          <span className="eyebrow-label">Kategori storefront</span>
          <h2>Belanja per kategori utama</h2>
          <p>
            Telusuri kategori foto-led untuk masuk ke kelompok belanja yang tepat, lalu lanjut ke
            subcategory dengan chip yang tetap ringkas.
          </p>
        </div>
        <div className="catalog-category-navigator__clusters" aria-label="Kelompok kategori">
          {Object.entries(STOREFRONT_CATEGORY_CLUSTERS).map(([key, cluster]) => {
            const isActive = activeMain.cluster === key;
            return (
              <span
                className={isActive ? "is-active" : undefined}
                key={key}
              >
                {cluster.label}
              </span>
            );
          })}
        </div>
      </div>

      <div className="catalog-category-navigator__rail" aria-label="Main categories">
        {STOREFRONT_MAIN_CATEGORIES.map((item) => {
          const isActive = activeMain.key === item.key;
          const href = buildStorefrontCategoryHref(item, categories);
          const style = {
            "--category-accent": item.accent,
            "--category-accent-soft": item.accentSoft,
            "--category-accent-warm": item.accentWarm,
          } as CSSProperties;

          return (
            <Link
              className={`catalog-category-card${isActive ? " is-active" : ""}`}
              href={href}
              key={item.key}
              style={style}
            >
              <div className="catalog-category-card__art">
                <StorefrontCategoryPhoto
                  alt={item.imageAlt}
                  sizes="(max-width: 640px) 38vw, (max-width: 980px) 24vw, 14vw"
                  src={item.imageSrc}
                />
              </div>
              <span className="catalog-category-card__text">
                <strong>{item.label}</strong>
                <small>{STOREFRONT_CATEGORY_CLUSTERS[item.cluster].label}</small>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="catalog-category-subnav">
        <div className="catalog-category-subnav__lead">
          <strong>{activeMain.label}</strong>
          <span>{activeMain.description}</span>
        </div>
        <div className="catalog-category-subnav__chips" aria-label={`Subkategori ${activeMain.label}`}>
          {activeMain.subcategories.map((item) => {
            const href = buildStorefrontSubcategoryHref(activeMain.key, item, categories);
            const isActive = selection.sub?.label === item.label;

            return (
              <Link
                className={`catalog-category-subchip${isActive ? " is-active" : ""}`}
                href={href}
                key={`${activeMain.key}-${item.label}`}
              >
                <span className="catalog-category-subchip__icon">
                  <SubcategoryIcon kind={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
