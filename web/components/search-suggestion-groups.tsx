"use client";

import Link from "next/link";

import { GLOBAL_SEARCH_SUGGESTION_GROUPS } from "@/lib/global-search";

export function SearchSuggestionGroups({
  onSuggestionClick,
}: {
  onSuggestionClick?: (suggestion: string) => void;
}) {
  return (
    <div className="search-suggestion-groups">
      {GLOBAL_SEARCH_SUGGESTION_GROUPS.map((group) => (
        <section className="search-suggestion-group" key={group.title}>
          <span className="eyebrow-label">{group.title}</span>
          <div className="global-search__chips">
            {group.items.map((suggestion) =>
              onSuggestionClick ? (
                <button
                  key={suggestion}
                  onClick={() => onSuggestionClick(suggestion)}
                  type="button"
                >
                  {suggestion}
                </button>
              ) : (
                <Link
                  className="filter-chip"
                  href={`/cari?q=${encodeURIComponent(suggestion)}`}
                  key={suggestion}
                >
                  {suggestion}
                </Link>
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
