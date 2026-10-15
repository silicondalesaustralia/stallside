"use client";

import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import type { BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater };

const FIELD_LABELS: Record<string, string> = {
  description: "About",
  offering: "What you offer",
  story: "Story",
  serviceArea: "Area",
  audience: "Customers",
  differentiators: "What's different",
};

export default function ImportedFacts({ brief, update }: Props) {
  const imports = brief.sources.imports;
  if (imports.length === 0) return null;

  const toggle = (url: string, index: number, accepted: boolean) =>
    update((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        imports: prev.sources.imports.map((s) =>
          s.url === url ? { ...s, facts: s.facts.map((f, i) => (i === index ? { ...f, accepted } : f)) } : s,
        ),
      },
    }));

  const remove = (url: string) =>
    update((prev) => ({
      ...prev,
      sources: {
        ...prev.sources,
        urls: prev.sources.urls.filter((u) => u !== url),
        imports: prev.sources.imports.filter((s) => s.url !== url),
      },
    }));

  return (
    <ul className="mt-3 flex flex-col gap-3">
      {imports.map((source) => (
        <li key={source.url} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium text-[var(--field)]">{source.title || source.url}</span>
            <button type="button" className="text-xs text-[var(--muted)] underline" onClick={() => remove(source.url)}>
              Remove
            </button>
          </div>
          {source.status !== "ok" ? (
            <p className="mt-1 text-xs text-[var(--muted)]">Couldn&apos;t read this page.</p>
          ) : null}
          <ul className="mt-2 flex flex-col gap-2">
            {source.facts.map((fact, i) => (
              <li key={`${fact.field}-${i}`}>
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-1" checked={fact.accepted} onChange={(e) => toggle(source.url, i, e.target.checked)} />
                  <span>
                    <span className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                      {FIELD_LABELS[fact.field] ?? fact.field}
                    </span>
                    <span className="block text-[var(--field)]">{fact.value}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}
