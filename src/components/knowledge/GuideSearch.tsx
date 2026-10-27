"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import GuideSearchResults from "@/components/knowledge/GuideSearchResults";
import { searchGuides, tokenize } from "@/lib/knowledge-base/search";
import type { KnowledgeSearchEntry } from "@/lib/knowledge-base";

type GuideSearchProps = {
  entries: KnowledgeSearchEntry[];
  initialQuery: string;
  children: ReactNode;
};

export default function GuideSearch({ entries, initialQuery, children }: GuideSearchProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);

  const tokens = useMemo(() => tokenize(query), [query]);
  const hits = useMemo(() => searchGuides(entries, query), [entries, query]);
  const searching = tokens.length > 0;

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing = target?.closest("input, textarea, select, [contenteditable='true']");
      if (event.key === "/" && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");
    window.history.replaceState(window.history.state, "", url);
  }, [query]);

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setQuery("");
      return;
    }
    if (!hits.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, hits.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[activeIndex] ?? hits[0];
      router.push(`/dashboard/knowledge/${hit.entry.slug}`);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-2xl">
        <Search
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--muted)]"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onInputKey}
          placeholder="Search guides, e.g. deposits, stock count, Square"
          aria-label="Search guides"
          autoComplete="off"
          className="w-full rounded-2xl border border-[var(--line)] bg-[var(--panel)] py-3.5 pl-12 pr-12 text-base text-[var(--ink)] shadow-sm outline-none placeholder:text-[var(--muted)] focus:border-[var(--leaf)] focus:ring-2 focus:ring-[var(--leaf)]/20 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-[var(--muted)] hover:bg-[var(--wash)]"
          >
            <X aria-hidden className="size-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-[var(--line)] px-1.5 text-xs text-[var(--muted)] sm:block">
            /
          </kbd>
        )}
      </div>

      {searching ? (
        <GuideSearchResults query={query} hits={hits} tokens={tokens} activeIndex={activeIndex} />
      ) : (
        children
      )}
    </div>
  );
}
