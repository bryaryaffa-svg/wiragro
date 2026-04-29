"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import { AgriIcon, type AgriIconName } from "@/components/ui/agri-icon";
import { RoleAwarePrice } from "@/components/ui/role-aware-price";
import type { GlobalSearchResults, GlobalSearchTab } from "@/lib/global-search";

const SEARCH_TABS: Array<{
  id: GlobalSearchTab;
  label: string;
}> = [
  { id: "all", label: "Semua" },
  { id: "solutions", label: "Solusi" },
  { id: "products", label: "Produk" },
  { id: "education", label: "Edukasi" },
  { id: "videos", label: "Video/artikel" },
];

const SEARCH_RESULT_GROUPS: Array<{
  id: Exclude<GlobalSearchTab, "all">;
  label: string;
}> = [
  { id: "solutions", label: "Solusi terkait" },
  { id: "products", label: "Produk terkait" },
  { id: "education", label: "Edukasi terkait" },
  { id: "videos", label: "Video/artikel" },
];

function SearchResultItem({
  item,
  onResultClick,
}: {
  item: GlobalSearchResults["groups"]["all"][number];
  onResultClick?: (href: string) => void;
}) {
  if (item.kind === "solution") {
    return (
      <Link
        className="search-result-item search-result-item--solution"
        href={item.href}
        onClick={() => onResultClick?.(item.href)}
      >
        <span className="search-result-item__icon">
          <AgriIcon name={item.icon as AgriIconName} />
        </span>
        <div className="search-result-item__body">
          <span className="search-result-item__eyebrow">Solusi</span>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <small>{item.tags.join(" · ")}</small>
        </div>
      </Link>
    );
  }

  if (item.kind === "product") {
    return (
      <Link
        className="search-result-item search-result-item--product"
        href={item.href}
        onClick={() => onResultClick?.(item.href)}
      >
        <div className="search-result-item__media">
          {item.imageUrl ? (
            <Image
              alt={item.title}
              fill
              sizes="72px"
              src={item.imageUrl}
              unoptimized={item.imageUrl.startsWith("/")}
            />
          ) : (
            <span className="search-result-item__placeholder">
              <AgriIcon name="product" />
            </span>
          )}
        </div>
        <div className="search-result-item__body">
          <span className="search-result-item__eyebrow">{item.category}</span>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <RoleAwarePrice compact price={item.product.price} />
        </div>
      </Link>
    );
  }

  if (item.kind === "article") {
    return (
      <Link
        className="search-result-item search-result-item--article"
        href={item.href}
        onClick={() => onResultClick?.(item.href)}
      >
        <span className="search-result-item__icon">
          <AgriIcon name="article" />
        </span>
        <div className="search-result-item__body">
          <span className="search-result-item__eyebrow">Edukasi</span>
          <strong>{item.title}</strong>
          <p>{item.summary}</p>
          <small>{item.tags.join(" · ")}</small>
        </div>
      </Link>
    );
  }

  return (
    <Link
      className="search-result-item search-result-item--video"
      href={item.href}
      onClick={() => onResultClick?.(item.href)}
    >
      <div className="search-result-item__media">
        {item.thumbnail ? (
          <Image
            alt={item.title}
            fill
            sizes="72px"
            src={item.thumbnail}
            unoptimized={item.thumbnail.startsWith("/")}
          />
        ) : (
          <span className="search-result-item__placeholder">
            <AgriIcon name="video" />
          </span>
        )}
      </div>
      <div className="search-result-item__body">
        <span className="search-result-item__eyebrow">{item.category}</span>
        <strong>{item.title}</strong>
        <p>{item.summary}</p>
        <small>{item.tags.join(" · ")}</small>
      </div>
    </Link>
  );
}

export function SearchResultTabs({
  consultationHref = "/kontak",
  compact = false,
  defaultTab = "all",
  onResultClick,
  results,
}: {
  consultationHref?: string | null;
  compact?: boolean;
  defaultTab?: GlobalSearchTab;
  onResultClick?: (href: string) => void;
  results: GlobalSearchResults;
}) {
  const [activeTab, setActiveTab] = useState<GlobalSearchTab>(defaultTab);
  const activeItems = useMemo(() => {
    return results.groups[activeTab];
  }, [activeTab, results.groups]);
  const showGroupedResults = activeTab === "all" && results.query.length > 0;

  const renderResultList = (items: GlobalSearchResults["groups"]["all"]) => (
    <div className="search-result-tabs__list">
      {items.map((item) => (
        <SearchResultItem item={item} key={`${item.kind}-${item.id}`} onResultClick={onResultClick} />
      ))}
    </div>
  );

  return (
    <div className={`search-result-tabs${compact ? " search-result-tabs--compact" : ""}`}>
      <div className="search-result-tabs__header" role="tablist" aria-label="Kategori hasil pencarian">
        {SEARCH_TABS.map((tab) => (
          <button
            aria-selected={activeTab === tab.id}
            className={activeTab === tab.id ? "is-active" : undefined}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            role="tab"
            type="button"
          >
            {tab.label}
            <span>{results.counts[tab.id]}</span>
          </button>
        ))}
      </div>

      {results.solutionCta ? (
        <Link
          className="search-solution-cta"
          href={results.solutionCta.href}
          onClick={() => onResultClick?.(results.solutionCta?.href ?? "/solusi")}
        >
          <span className="search-solution-cta__icon">
            <AgriIcon name="solution" />
          </span>
          <span>
            <strong>{results.solutionCta.label}</strong>
            <small>{results.solutionCta.description}</small>
          </span>
        </Link>
      ) : null}

      {activeItems.length ? (
        showGroupedResults ? (
          <div className="search-result-tabs__grouped">
            {SEARCH_RESULT_GROUPS.map((group) => {
              const groupItems = results.groups[group.id];

              return (
                <section className="search-result-tabs__group" key={group.id}>
                  <div className="search-result-tabs__group-header">
                    <h3>{group.label}</h3>
                    <span>{groupItems.length}</span>
                  </div>
                  {groupItems.length ? (
                    renderResultList(groupItems)
                  ) : (
                    <p className="search-result-tabs__group-empty">
                      Belum ada hasil di kelompok ini.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          renderResultList(activeItems)
        )
      ) : (
        <div className="search-result-tabs__empty">
          <strong>Belum ada hasil yang cocok</strong>
          <p>
            Coba mulai dari alur solusi, baca edukasi terkait, atau hubungi tim Wiragro
            untuk konsultasi singkat.
          </p>
          <div className="search-result-tabs__empty-actions">
            <Link className="btn btn-secondary" href="/solusi">
              Buka Solusi
            </Link>
            <Link className="btn btn-secondary" href="/artikel">
              Buka Edukasi
            </Link>
            {consultationHref ? (
              <Link className="btn btn-primary" href={consultationHref}>
                Konsultasi WhatsApp
              </Link>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
