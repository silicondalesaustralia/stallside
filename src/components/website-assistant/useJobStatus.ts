"use client";

import { useCallback, useEffect, useState } from "react";
import type { JobStatusView } from "@/lib/website-ai/assistant/jobs/status";

const ACTIVE = new Set(["QUEUED", "RUNNING", "RETRY_WAIT"]);
const POLL_MS = 3_000;

/** Polls the owner-scoped status endpoint; polling also advances the build on Preview. */
export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<JobStatusView | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!jobId) return;
    try {
      const res = await fetch(`/api/website-ai/jobs/${encodeURIComponent(jobId)}`, { cache: "no-store" });
      if (!res.ok) {
        setError(res.status === 404 ? "This build could not be found." : "Couldn't check progress. Retrying…");
        return;
      }
      setStatus((await res.json()) as JobStatusView);
      setError(null);
    } catch (err) {
      console.error("[website-ai] status poll failed", err);
      setError("Couldn't check progress. Retrying…");
    }
  }, [jobId]);

  const active = !status || ACTIVE.has(status.status);
  useEffect(() => {
    if (!jobId || !active) return;
    const first = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => void refresh(), POLL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [jobId, active, refresh]);

  return { status, error, refresh };
}
