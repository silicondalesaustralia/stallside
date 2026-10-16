"use client";

import { useState, useTransition } from "react";
import { cancelBuildAction, confirmReplaceAction } from "@/app/dashboard/(gated)/website/assistant/build-actions";
import BuildResult from "./BuildResult";
import { useJobStatus } from "./useJobStatus";
import { primaryButton, secondaryButton } from "./assistant-copy";

type Props = { jobId: string; previewPath: string; editorHref: string; onReset: () => void };

export default function BuildProgress({ jobId, previewPath, editorHref, onReset }: Props) {
  const { status, error, refresh } = useJobStatus(jobId);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setActionError(null);
      const res = await fn();
      if (!res.ok) setActionError(res.error ?? "Something went wrong.");
      await refresh();
    });

  if (!status) return <p className="text-sm text-[var(--muted)]">{error ?? "Starting your build…"}</p>;

  if (status.status === "APPLIED") {
    return <BuildResult status={status} previewPath={previewPath} editorHref={editorHref} onRebuild={onReset} />;
  }

  if (status.status === "NEEDS_CONFIRMATION") {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <p className="font-medium">Your draft changed while we were building.</p>
        <p className="mt-1">Replace it with the new website? You can restore the previous draft afterwards.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" className={primaryButton} disabled={pending} onClick={() => act(() => confirmReplaceAction(jobId))}>
            Replace my draft
          </button>
          <button type="button" className={secondaryButton} disabled={pending} onClick={() => act(() => cancelBuildAction(jobId))}>
            Keep my current draft
          </button>
        </div>
        {actionError ? <p className="mt-2 text-red-700">{actionError}</p> : null}
      </div>
    );
  }

  if (status.status === "FAILED" || status.status === "CANCELLED") {
    return (
      <div className="flex flex-col gap-3 text-sm">
        <p className={status.status === "FAILED" ? "text-red-700" : "text-[var(--muted)]"}>
          {status.status === "CANCELLED" ? "The build was cancelled. Your draft was not changed." : status.error}
        </p>
        <button type="button" className={secondaryButton} onClick={onReset}>
          Back to my details
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-[var(--field)]">
        {status.stageLabel}
        {status.stage === "pages" && status.pagesPlanned > 0 ? ` (${status.pagesWritten} of ${status.pagesPlanned})` : ""}…
      </p>
      <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-[var(--border)]" role="progressbar" aria-valuenow={status.progress} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full bg-[var(--field)] transition-all" style={{ width: `${Math.max(5, status.progress)}%` }} />
      </div>
      {status.status === "RETRY_WAIT" ? <p className="text-xs text-[var(--muted)]">The AI service is busy — retrying shortly.</p> : null}
      <p className="text-xs text-[var(--muted)]">
        You can leave this page — we&apos;ll keep building. Website → Create with AI shows when it&apos;s ready.
      </p>
      {error ? <p className="text-xs text-[var(--muted)]">{error}</p> : null}
      <button type="button" className={`${secondaryButton} w-fit`} disabled={pending} onClick={() => act(() => cancelBuildAction(jobId))}>
        Cancel
      </button>
      {actionError ? <p className="text-sm text-red-700">{actionError}</p> : null}
    </div>
  );
}
