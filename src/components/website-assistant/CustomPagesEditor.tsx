"use client";

import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import AssistantField from "./AssistantField";
import { secondaryButton, type BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater; canAdd: boolean };

const MAX_CUSTOM = 3;

export default function CustomPagesEditor({ brief, update, canAdd }: Props) {
  const pages = brief.pages.custom;
  const setPages = (custom: BriefData["pages"]["custom"]) =>
    update((prev) => ({ ...prev, pages: { ...prev.pages, custom } }));

  const add = () => {
    const id = `p${Date.now().toString(36)}`;
    setPages([...pages, { id, title: "", purpose: "" }]);
  };

  return (
    <section>
      <h3 className="text-sm font-medium text-[var(--field)]">Extra pages</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">Optional. Up to {MAX_CUSTOM}, e.g. &ldquo;Workshops&rdquo; or &ldquo;Wholesale&rdquo;.</p>
      <ul className="mt-3 flex flex-col gap-3">
        {pages.map((page, i) => (
          <li key={page.id} className="rounded-md border border-[var(--border)] px-3 py-3">
            <AssistantField
              label="Page title"
              value={page.title}
              maxLength={60}
              onChange={(v) => setPages(pages.map((p, j) => (j === i ? { ...p, title: v } : p)))}
            />
            <div className="mt-2">
              <AssistantField
                label="What should this page cover?"
                multiline
                value={page.purpose}
                maxLength={300}
                onChange={(v) => setPages(pages.map((p, j) => (j === i ? { ...p, purpose: v } : p)))}
              />
            </div>
            <button type="button" className="mt-2 text-xs text-[var(--muted)] underline" onClick={() => setPages(pages.filter((_, j) => j !== i))}>
              Remove page
            </button>
          </li>
        ))}
      </ul>
      {pages.length < MAX_CUSTOM ? (
        <button type="button" className={`${secondaryButton} mt-3`} disabled={!canAdd} onClick={add}>
          Add a page
        </button>
      ) : null}
    </section>
  );
}
