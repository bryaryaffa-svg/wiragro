"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useGlobalSearchResults } from "@/components/global-search";
import { SearchResultTabs } from "@/components/search-result-tabs";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { trackUiEvent } from "@/lib/analytics";

function CloseIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

export function MobileSearchOverlay({
  open,
  onClose,
}: {
  onClose: () => void;
  open: boolean;
}) {
  const router = useRouter();
  const { href, isLoading, query, results, setQuery, suggestions } = useGlobalSearchResults("");

  if (!open) {
    return null;
  }

  return (
    <div className="mobile-search-overlay" role="dialog" aria-modal="true" aria-label="Cari di Wiragro">
      <div className="mobile-search-overlay__header">
        <strong>Cari di Wiragro</strong>
        <button aria-label="Tutup pencarian" onClick={onClose} type="button">
          <CloseIcon />
        </button>
      </div>

      <form
        className="mobile-search-overlay__form"
        onSubmit={(event) => {
          event.preventDefault();
          trackUiEvent("global_search_submitted", {
            query: query.trim(),
            surface: "mobile_overlay",
          });
          onClose();
          router.push(href);
        }}
      >
        <label className="sr-only" htmlFor="mobile-search-input">
          Cari solusi, produk, artikel, atau masalah tanaman
        </label>
        <input
          autoFocus
          id="mobile-search-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari solusi, produk, artikel, atau masalah tanaman..."
          type="search"
          value={query}
        />
        <button className="btn btn-primary" type="submit">
          Cari
        </button>
      </form>

      {query.trim().length < 2 ? (
        <div className="mobile-search-overlay__suggestions">
          <span className="eyebrow-label">Pencarian populer</span>
          <div className="global-search__chips">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  trackUiEvent("global_search_suggestion_clicked", {
                    query: suggestion,
                    surface: "mobile_overlay",
                  });
                }}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
          <div className="mobile-search-overlay__quick-links">
            <Link href="/solusi" onClick={onClose}>
              Buka Solusi
            </Link>
            <Link href="/produk" onClick={onClose}>
              Lihat produk
            </Link>
            <Link href="/artikel" onClick={onClose}>
              Baca edukasi
            </Link>
          </div>
        </div>
      ) : isLoading ? (
        <LoadingSkeleton
          cards={3}
          eyebrow="Pencarian mobile"
          title="Menyiapkan hasil pencarian..."
        />
      ) : results ? (
        <SearchResultTabs
          onResultClick={() => onClose()}
          results={results}
        />
      ) : null}

    </div>
  );
}
