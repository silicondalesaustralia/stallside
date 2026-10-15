"use client";

import { useState, useTransition } from "react";
import { importUrlAction } from "@/app/dashboard/(gated)/website/assistant/actions";
import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import AssistantField from "./AssistantField";
import ImportedFacts from "./ImportedFacts";
import { inputClass, secondaryButton, type BriefUpdater } from "./assistant-copy";

type Props = { brief: BriefData; update: BriefUpdater };

export default function ImportSources({ brief, update }: Props) {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const full = brief.sources.imports.length >= 3;

  const runImport = () =>
    start(async () => {
      setMessage(null);
      const res = await importUrlAction(url);
      if (!res.ok) return setMessage(res.error);
      const { source, message: note } = res.outcome;
      setMessage(note);
      update((prev) => ({
        ...prev,
        sources: {
          ...prev.sources,
          urls: [...new Set([...prev.sources.urls, source.url])].slice(0, 3),
          imports: [...prev.sources.imports.filter((s) => s.url !== source.url), source].slice(-3),
        },
      }));
      setUrl("");
    });

  return (
    <section className="rounded-md border border-[var(--border)] px-4 py-4">
      <h3 className="text-sm font-medium text-[var(--field)]">Import from your website or social page</h3>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Optional. We&apos;ll suggest details from the page — nothing is used until you tick it.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <input
          className={`${inputClass} mt-0 max-w-md flex-1`}
          placeholder="https://yourbusiness.com.au"
          value={url}
          disabled={full || pending}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button type="button" className={secondaryButton} disabled={full || pending || !url.trim()} onClick={runImport}>
          {pending ? "Reading…" : "Import"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-[var(--muted)]">{message}</p> : null}
      <ImportedFacts brief={brief} update={update} />
      <div className="mt-3">
        <AssistantField
          label="Or paste text about your business"
          hint="Your bio, a few posts or a flyer. Treated as your own words."
          multiline
          value={brief.sources.pastedText}
          maxLength={4000}
          onChange={(v) => update((prev) => ({ ...prev, sources: { ...prev.sources, pastedText: v } }))}
        />
      </div>
    </section>
  );
}
