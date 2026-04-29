"use client";

import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useRef, useState } from "react";

import { SearchResultTabs } from "@/components/search-result-tabs";
import { SearchSuggestionGroups } from "@/components/search-suggestion-groups";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { trackUiEvent } from "@/lib/analytics";
import {
  DEFAULT_GLOBAL_SEARCH_SUGGESTIONS,
  type GlobalSearchResults,
} from "@/lib/global-search";

function SearchGlyph() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="6.3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}

function buildSearchHref(query: string) {
  const trimmed = query.trim();
  return trimmed ? `/cari?q=${encodeURIComponent(trimmed)}` : "/cari";
}

export function useGlobalSearchResults(initialValue = "") {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<GlobalSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(deferredQuery)}`);
        const payload = (await response.json()) as GlobalSearchResults;

        if (!isCancelled) {
          setResults(payload);
        }
      } catch {
        if (!isCancelled) {
          setResults({
            counts: {
              all: 0,
              education: 0,
              products: 0,
              solutions: 0,
              videos: 0,
            },
            groups: {
              all: [],
              education: [],
              products: [],
              solutions: [],
              videos: [],
            },
            query: deferredQuery,
            suggestions: DEFAULT_GLOBAL_SEARCH_SUGGESTIONS,
          });
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      isCancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [deferredQuery]);

  return {
    href: buildSearchHref(query),
    isLoading,
    query,
    results,
    setQuery,
    suggestions: results?.suggestions ?? DEFAULT_GLOBAL_SEARCH_SUGGESTIONS,
  };
}

export function GlobalSearch({
  defaultValue = "",
}: {
  defaultValue?: string;
}) {
  const router = useRouter();
  const { href, isLoading, query, results, setQuery } = useGlobalSearchResults(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const shouldShowPanel = isOpen || query.trim().length > 0;

  return (
    <div className="global-search" ref={wrapperRef}>
      <form
        className="global-search__form"
        onSubmit={(event) => {
          event.preventDefault();
          trackUiEvent("global_search_submitted", {
            query: query.trim(),
          });
          setIsOpen(false);
          router.push(href);
        }}
      >
        <label className="sr-only" htmlFor="global-search-input">
          Cari produk, tanaman, hama, gejala, atau artikel
        </label>
        <div className="global-search__control">
          <SearchGlyph />
          <input
            id="global-search-input"
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="Cari produk, tanaman, hama, gejala, atau artikel..."
            type="search"
            value={query}
          />
          <button aria-label="Cari" type="submit">
            Cari
          </button>
        </div>
      </form>

      {shouldShowPanel ? (
        <div className="global-search__panel">
          {query.trim().length < 2 ? (
            <div className="global-search__suggestions">
              <SearchSuggestionGroups
                onSuggestionClick={(suggestion) => {
                  setQuery(suggestion);
                  trackUiEvent("global_search_suggestion_clicked", {
                    query: suggestion,
                  });
                }}
              />
            </div>
          ) : isLoading ? (
            <LoadingSkeleton
              cards={3}
              eyebrow="Global search"
              title="Menyiapkan hasil pencarian..."
            />
          ) : results ? (
            <SearchResultTabs
              compact
              onResultClick={(resultHref) => {
                setIsOpen(false);
                trackUiEvent("global_search_result_clicked", {
                  href: resultHref,
                  query: query.trim(),
                });
              }}
              results={results}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
