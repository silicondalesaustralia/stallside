"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { restorePreviousAction } from "@/app/dashboard/(gated)/website/assistant/build-actions";
import type { JobStatusView } from "@/lib/website-ai/assistant/jobs/status";
import PolicyReviewList from "./PolicyReviewList";
import { SEARCH_PROFILE_HREF, primaryButton, secondaryButton } from "./assistant-copy";

type Props = { status: JobStatusView; previewPath: string; editorHref: string; onRebuild: () => void };

export default function BuildResult({ status, previewPath, editorHref, onRebuild }: Props) {
  const [restored, setRestored] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const restore = () => {
    if (!window.confirm("Put back your draft from before this build? Changes made since will be lost.")) return;
    start(async () => {
      const res = await restorePreviousAction(status.id);
      if (res.ok) setRestored(true);
      else setError(res.error);
    });
  };

  if (restored) {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className="text-[var(--field)]">Your previous draft is back.</p>
        <button type="button" className={secondaryButton} onClick={onRebuild}>
          Back to my details
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900">
        Your draft website is ready. Nothing is live until you publish.
      </div>
      <div className="flex flex-wrap gap-2">
        <a href={previewPath} target="_blank" rel="noopener noreferrer" className={primaryButton}>
          Open preview
        </a>
        <Link href={editorHref} className={secondaryButton}>
          Edit in the editor
        </Link>
        <Link href="/dashboard/website/web-studio?tab=details" className={secondaryButton}>
          Publish website
        </Link>
      </div>
      <PolicyReviewList pageIds={status.reviewPageIds} />
      <p className="text-sm text-[var(--muted)]">
        Before publishing, check your{" "}
        <Link href={SEARCH_PROFILE_HREF} className="underline">
          Google &amp; search profile
        </Link>{" "}
        so your hours, address and business type show correctly in Google.
      </p>
      {status.notes.length > 0 ? (
        <ul className="list-disc pl-5 text-xs text-[var(--muted)]">
          {status.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      ) : null}
      <iframe title="Website preview" src={previewPath} className="h-[640px] w-full rounded-md border border-[var(--border)]" />
      <div className="flex flex-wrap gap-3 text-sm">
        {status.canRestore ? (
          <button type="button" className="text-[var(--muted)] underline" disabled={pending} onClick={restore}>
            Restore my previous draft
          </button>
        ) : null}
        <button type="button" className="text-[var(--muted)] underline" onClick={onRebuild}>
          Change details and rebuild
        </button>
      </div>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
