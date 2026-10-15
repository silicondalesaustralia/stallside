"use client";

import { POLICY_PAGE_IDS, type BriefData } from "@/lib/website-ai/assistant/brief/schema";
import { MAX_SELECTED_PAGES, POLICY_LABELS, type PageOption } from "@/lib/website-ai/assistant/pages/catalogue";
import CustomPagesEditor from "./CustomPagesEditor";
import type { BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater; options: PageOption[]; notes: string[] };

export default function PagesStep({ brief, update, options, notes }: Props) {
  const selected = new Set(brief.pages.selected);
  const total = selected.size + brief.pages.custom.length;

  const toggle = (id: string, on: boolean) =>
    update((prev) => {
      const next = new Set(prev.pages.selected);
      if (on) next.add(id);
      else next.delete(id);
      next.add("HOME");
      return { ...prev, pages: { ...prev.pages, selected: [...next] } };
    });

  const togglePolicy = (id: (typeof POLICY_PAGE_IDS)[number], on: boolean) =>
    update((prev) => {
      const rest = prev.pages.policies.filter((p) => p !== id);
      return { ...prev, pages: { ...prev.pages, policies: on ? [...rest, id] : rest } };
    });

  return (
    <div className="flex flex-col gap-5">
      <section>
        <h3 className="text-sm font-medium text-[var(--field)]">Pages</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          We&apos;ve ticked the pages that suit your business. Up to {MAX_SELECTED_PAGES} pages.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {options.map((opt) => (
            <li key={opt.id}>
              <label className={`flex items-start gap-2 text-sm ${opt.available ? "" : "opacity-60"}`}>
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected.has(opt.id)}
                  disabled={opt.id === "HOME" || !opt.available || (!selected.has(opt.id) && total >= MAX_SELECTED_PAGES)}
                  onChange={(e) => toggle(opt.id, e.target.checked)}
                />
                <span>
                  <span className="font-medium text-[var(--field)]">{opt.label}</span>
                  {opt.recommended ? <span className="ml-2 text-xs text-green-800">Recommended</span> : null}
                  <span className="block text-xs text-[var(--muted)]">{opt.prerequisite ?? opt.description}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <CustomPagesEditor brief={brief} update={update} canAdd={total < MAX_SELECTED_PAGES} />

      <section>
        <h3 className="text-sm font-medium text-[var(--field)]">Policies (footer)</h3>
        <p className="mt-1 text-xs text-[var(--muted)]">
          We&apos;ll draft these from your real details. You must review each one before you can publish. Existing policy text is kept.
        </p>
        <ul className="mt-2 flex flex-wrap gap-4">
          {POLICY_PAGE_IDS.map((id) => (
            <li key={id}>
              <label className="flex items-center gap-2 text-sm text-[var(--field)]">
                <input type="checkbox" checked={brief.pages.policies.includes(id)} onChange={(e) => togglePolicy(id, e.target.checked)} />
                {POLICY_LABELS[id]}
              </label>
            </li>
          ))}
        </ul>
      </section>

      {notes.length > 0 ? (
        <ul className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs text-[var(--muted)]">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
