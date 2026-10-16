"use client";

import { useState, useTransition } from "react";
import { startBuildAction } from "@/app/dashboard/(gated)/website/assistant/build-actions";
import type { BuildMode } from "@/lib/website-ai/assistant/jobs/start";
import type { BriefData } from "@/lib/website-ai/assistant/brief/schema";
import { briefMissingFields } from "@/lib/website-ai/assistant/brief/missing";
import ReplaceWarning from "./ReplaceWarning";
import { primaryButton, secondaryButton } from "./assistant-copy";

type Props = {
  brief: BriefData;
  hasExistingSite: boolean;
  isPublished: boolean;
  aiAvailable: boolean;
  saveNow: () => Promise<boolean>;
  onStarted: (jobId: string) => void;
};

export default function CreateStep({ brief, hasExistingSite, isPublished, aiAvailable, saveNow, onStarted }: Props) {
  const [understood, setUnderstood] = useState(!hasExistingSite);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const missing = briefMissingFields(brief);
  const blocked = missing.length > 0 || !understood || pending;

  const begin = (mode: BuildMode) =>
    start(async () => {
      setError(null);
      if (!(await saveNow())) return setError("Your details couldn't be saved. Check the earlier steps.");
      const res = await startBuildAction(crypto.randomUUID(), mode);
      if (!res.ok) return setError(res.error);
      if (res.jobId) onStarted(res.jobId);
    });

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--muted)]">
        Vendl will plan your pages, write them from your details, choose a design and build a draft. It usually takes 1–3
        minutes. Your live website won&apos;t change until you press <strong>Publish website</strong>.
      </p>
      {missing.length > 0 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Still needed: {missing.join(", ")}.
        </div>
      ) : null}
      {hasExistingSite ? (
        <ReplaceWarning isPublished={isPublished} understood={understood} onChange={setUnderstood} />
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        {aiAvailable ? (
          <div className="flex flex-col gap-2 rounded-md border border-[var(--border)] p-4">
            <button type="button" className={primaryButton} disabled={blocked} onClick={() => begin("ai")}>
              {pending ? "Starting…" : "Create my website with AI"}
            </button>
            <p className="text-xs text-[var(--muted)]">
              Recommended. AI writes every page from your details — headings, intros, About, FAQ and draft policies —
              and builds the full site. Takes 1–3 minutes.
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-2 rounded-md border border-[var(--border)] p-4">
          <button
            type="button"
            className={aiAvailable ? secondaryButton : primaryButton}
            disabled={blocked}
            onClick={() => begin("basic")}
          >
            Build from my own words (no AI)
          </button>
          <p className="text-xs text-[var(--muted)]">
            Uses only what you&apos;ve entered, with no AI writing. Your products and details still show, but FAQ and
            policy pages are left for you to fill in. Quick and predictable.
          </p>
        </div>
      </div>
      {!aiAvailable ? (
        <p className="text-xs text-[var(--muted)]">AI writing isn&apos;t available right now, so we&apos;ll build a starter from your own words.</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
