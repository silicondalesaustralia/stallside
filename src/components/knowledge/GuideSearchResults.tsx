import Link from "next/link";
import GuideHighlight from "@/components/knowledge/GuideHighlight";
import type { KnowledgeSearchHit } from "@/lib/knowledge-base/search";

type GuideSearchResultsProps = {
  query: string;
  hits: KnowledgeSearchHit[];
  tokens: string[];
  activeIndex: number;
};

export default function GuideSearchResults({
  query,
  hits,
  tokens,
  activeIndex,
}: GuideSearchResultsProps) {
  if (!hits.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--panel)] px-6 py-10 text-center">
        <p className="font-medium text-[var(--ink)]">No guides match “{query}”</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Try a simpler word like “stock”, “Square”, “deposit” or “email”.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-3 text-sm text-[var(--muted)]" aria-live="polite">
        {hits.length} {hits.length === 1 ? "guide" : "guides"} found
      </p>
      <ul className="flex flex-col gap-2" role="listbox" aria-label="Search results">
        {hits.map((hit, index) => (
          <li key={hit.entry.slug} role="option" aria-selected={index === activeIndex}>
            <Link
              href={`/dashboard/knowledge/${hit.entry.slug}`}
              className={`block rounded-2xl border bg-[var(--panel)] px-4 py-3 transition hover:border-[var(--leaf)] ${
                index === activeIndex ? "border-[var(--leaf)] ring-2 ring-[var(--leaf)]/20" : "border-[var(--line)]"
              }`}
            >
              <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                {hit.entry.categoryTitle}
              </span>
              <span className="mt-0.5 block font-semibold text-[var(--ink)]">
                <GuideHighlight text={hit.entry.title} tokens={tokens} />
              </span>
              <span className="mt-1 block text-sm text-[var(--muted)]">
                <GuideHighlight text={hit.snippet ?? hit.entry.summary} tokens={tokens} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
